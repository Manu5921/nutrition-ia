/**
 * COACH NUTRITIONNEL IA - TRPC SUBSCRIPTIONS ROUTER 2025
 * ======================================================
 * API tRPC pour la gestion des abonnements Stripe
 * Integration complète avec webhooks et cycle de vie
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import Stripe from 'stripe'
import { 
  createTRPCRouter, 
  publicProcedure,
  protectedProcedure, 
  adminProcedure,
  handleSupabaseError
} from '../server'

// Configuration Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const PRICE_ID_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY! // 5.99€/mois
const PRICE_ID_ANNUAL = process.env.STRIPE_PRICE_ID_ANNUAL! // Optionnel

// Schémas Zod pour validation
const createCheckoutSchema = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  trialDays: z.number().min(0).max(30).optional(),
})

const manageSubscriptionSchema = z.object({
  returnUrl: z.string().url(),
})

const updateSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  action: z.enum(['cancel', 'reactivate', 'update_payment']),
  cancelAtPeriodEnd: z.boolean().optional(),
})

// Types pour les réponses
interface CheckoutResponse {
  url: string
  sessionId: string
}

interface PortalResponse {
  url: string
}

export const subscriptionsRouter = createTRPCRouter({
  // Obtenir les informations d'abonnement de l'utilisateur
  getCurrent: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { data, error } = await ctx.supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) handleSupabaseError(error)

        // Si pas d'abonnement dans la DB mais utilisateur connecté, vérifier Stripe
        if (!data && ctx.user.email) {
          try {
            const customers = await stripe.customers.list({
              email: ctx.user.email,
              limit: 1,
            })

            if (customers.data.length > 0) {
              const customer = customers.data[0]
              const subscriptions = await stripe.subscriptions.list({
                customer: customer.id,
                status: 'active',
                limit: 1,
              })

              if (subscriptions.data.length > 0) {
                const subscription = subscriptions.data[0]
                
                // Créer l'enregistrement manquant dans Supabase
                const { data: newSub, error: insertError } = await ctx.supabase
                  .from('subscriptions')
                  .insert({
                    user_id: ctx.user.id,
                    stripe_customer_id: customer.id,
                    stripe_subscription_id: subscription.id,
                    stripe_price_id: subscription.items.data[0].price.id,
                    status: subscription.status,
                    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    amount_euro: (subscription.items.data[0].price.unit_amount || 599) / 100,
                  })
                  .select()
                  .single()

                if (insertError) {
                  console.error('Erreur création abonnement manquant:', insertError)
                } else {
                  return newSub
                }
              }
            }
          } catch (stripeError) {
            console.error('Erreur vérification Stripe:', stripeError)
          }
        }

        return data
      } catch (error) {
        console.error('Erreur récupération abonnement:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération de l\'abonnement',
        })
      }
    }),

  // Créer une session de checkout Stripe
  createCheckoutSession: protectedProcedure
    .input(createCheckoutSchema)
    .mutation(async ({ ctx, input }): Promise<CheckoutResponse> => {
      try {
        // Vérifier que l'utilisateur n'a pas déjà un abonnement actif
        const { data: existingSubscription } = await ctx.supabase
          .from('subscriptions')
          .select('id, status')
          .eq('user_id', ctx.user.id)
          .in('status', ['active', 'trialing'])
          .maybeSingle()

        if (existingSubscription) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Vous avez déjà un abonnement actif',
          })
        }

        // Récupérer ou créer le customer Stripe
        let customerId: string | undefined

        if (ctx.user.email) {
          const existingCustomers = await stripe.customers.list({
            email: ctx.user.email,
            limit: 1,
          })

          if (existingCustomers.data.length > 0) {
            customerId = existingCustomers.data[0].id
          } else {
            const customer = await stripe.customers.create({
              email: ctx.user.email,
              metadata: {
                supabase_user_id: ctx.user.id,
              },
            })
            customerId = customer.id
          }
        }

        // Créer la session de checkout
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
          customer: customerId,
          payment_method_types: ['card', 'sepa_debit'],
          line_items: [
            {
              price: input.priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          locale: 'fr',
          currency: 'eur',
          billing_address_collection: 'required',
          subscription_data: {
            metadata: {
              supabase_user_id: ctx.user.id,
            },
          },
          metadata: {
            supabase_user_id: ctx.user.id,
          },
        }

        // Ajouter période d'essai si spécifiée
        if (input.trialDays && input.trialDays > 0) {
          sessionParams.subscription_data = {
            ...sessionParams.subscription_data,
            trial_period_days: input.trialDays,
          }
        }

        const session = await stripe.checkout.sessions.create(sessionParams)

        if (!session.url) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Erreur lors de la création de la session de paiement',
          })
        }

        return {
          url: session.url,
          sessionId: session.id,
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        console.error('Erreur création session checkout:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la création de la session de paiement',
        })
      }
    }),

  // Créer une session du portail client Stripe
  createPortalSession: protectedProcedure
    .input(manageSubscriptionSchema)
    .mutation(async ({ ctx, input }): Promise<PortalResponse> => {
      try {
        // Récupérer l'abonnement actuel
        const { data: subscription, error } = await ctx.supabase
          .from('subscriptions')
          .select('stripe_customer_id')
          .eq('user_id', ctx.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) handleSupabaseError(error)

        if (!subscription?.stripe_customer_id) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Aucun abonnement trouvé',
          })
        }

        // Créer la session du portail
        const session = await stripe.billingPortal.sessions.create({
          customer: subscription.stripe_customer_id,
          return_url: input.returnUrl,
        })

        return {
          url: session.url,
        }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        console.error('Erreur création session portail:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la création de la session de gestion',
        })
      }
    }),

  // Annuler un abonnement
  cancelSubscription: protectedProcedure
    .input(z.object({
      reason: z.string().max(500).optional(),
      cancelAtPeriodEnd: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Récupérer l'abonnement actuel
        const { data: subscription, error } = await ctx.supabase
          .from('subscriptions')
          .select('stripe_subscription_id, stripe_customer_id')
          .eq('user_id', ctx.user.id)
          .eq('status', 'active')
          .maybeSingle()

        if (error) handleSupabaseError(error)

        if (!subscription) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Aucun abonnement actif trouvé',
          })
        }

        // Annuler dans Stripe
        const updatedSubscription = await stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          {
            cancel_at_period_end: input.cancelAtPeriodEnd,
            metadata: {
              cancellation_reason: input.reason || 'Annulation utilisateur',
            },
          }
        )

        // Mettre à jour dans Supabase
        const { data: updatedSub, error: updateError } = await ctx.supabase
          .from('subscriptions')
          .update({
            cancel_at_period_end: input.cancelAtPeriodEnd,
            cancellation_reason: input.reason,
            cancel_at: input.cancelAtPeriodEnd ? 
              new Date(updatedSubscription.current_period_end * 1000).toISOString() : 
              new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', ctx.user.id)
          .eq('stripe_subscription_id', subscription.stripe_subscription_id)
          .select()
          .single()

        if (updateError) handleSupabaseError(updateError)

        return { success: true, subscription: updatedSub }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        console.error('Erreur annulation abonnement:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de l\'annulation de l\'abonnement',
        })
      }
    }),

  // Réactiver un abonnement annulé
  reactivateSubscription: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        // Récupérer l'abonnement annulé
        const { data: subscription, error } = await ctx.supabase
          .from('subscriptions')
          .select('stripe_subscription_id')
          .eq('user_id', ctx.user.id)
          .eq('cancel_at_period_end', true)
          .maybeSingle()

        if (error) handleSupabaseError(error)

        if (!subscription) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Aucun abonnement à réactiver trouvé',
          })
        }

        // Réactiver dans Stripe
        const updatedSubscription = await stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          {
            cancel_at_period_end: false,
          }
        )

        // Mettre à jour dans Supabase
        const { data: updatedSub, error: updateError } = await ctx.supabase
          .from('subscriptions')
          .update({
            cancel_at_period_end: false,
            cancel_at: null,
            cancellation_reason: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', ctx.user.id)
          .eq('stripe_subscription_id', subscription.stripe_subscription_id)
          .select()
          .single()

        if (updateError) handleSupabaseError(updateError)

        return { success: true, subscription: updatedSub }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        console.error('Erreur réactivation abonnement:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la réactivation de l\'abonnement',
        })
      }
    }),

  // Obtenir les prix disponibles (public)
  getPrices: publicProcedure
    .query(async () => {
      try {
        const prices = await stripe.prices.list({
          active: true,
          type: 'recurring',
          limit: 10,
        })

        return prices.data.map(price => ({
          id: price.id,
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval,
          intervalCount: price.recurring?.interval_count,
          nickname: price.nickname,
          product: price.product,
        }))
      } catch (error) {
        console.error('Erreur récupération prix:', error)
        return []
      }
    }),

  // Obtenir les statistiques d'abonnements (admin)
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      try {
        const [
          totalSubscriptions,
          activeSubscriptions,
          cancelledSubscriptions,
          revenueResult,
        ] = await Promise.all([
          ctx.supabase
            .from('subscriptions')
            .select('id', { count: 'exact' }),
          
          ctx.supabase
            .from('subscriptions')
            .select('id', { count: 'exact' })
            .eq('status', 'active'),
          
          ctx.supabase
            .from('subscriptions')
            .select('id', { count: 'exact' })
            .eq('status', 'canceled'),
          
          ctx.supabase
            .from('subscriptions')
            .select('amount_euro')
            .eq('status', 'active'),
        ])

        const monthlyRevenue = revenueResult.data?.reduce((sum, sub) => sum + (sub.amount_euro || 0), 0) || 0

        return {
          total: totalSubscriptions.count || 0,
          active: activeSubscriptions.count || 0,
          cancelled: cancelledSubscriptions.count || 0,
          monthlyRevenue,
          conversionRate: totalSubscriptions.count ? 
            ((activeSubscriptions.count || 0) / totalSubscriptions.count * 100) : 0,
        }
      } catch (error) {
        console.error('Erreur récupération statistiques abonnements:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des statistiques',
        })
      }
    }),

  // Obtenir tous les abonnements (admin)
  getAll: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      status: z.enum(['active', 'canceled', 'past_due', 'unpaid', 'all']).default('all'),
    }))
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabase
          .from('subscriptions')
          .select(`
            *,
            users (
              id,
              email,
              created_at
            )
          `)
          .order('created_at', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        if (input.status !== 'all') {
          query = query.eq('status', input.status)
        }

        const { data, error } = await query

        if (error) handleSupabaseError(error)

        return data || []
      } catch (error) {
        console.error('Erreur récupération tous les abonnements:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des abonnements',
        })
      }
    }),

  // Forcer la synchronisation avec Stripe (admin)
  syncWithStripe: adminProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Récupérer l'utilisateur
        const { data: user, error: userError } = await ctx.supabase
          .from('users')
          .select('email')
          .eq('id', input.userId)
          .single()

        if (userError) handleSupabaseError(userError)

        if (!user?.email) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Utilisateur non trouvé',
          })
        }

        // Rechercher le customer dans Stripe
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 1,
        })

        if (customers.data.length === 0) {
          return { success: true, message: 'Aucun customer Stripe trouvé' }
        }

        const customer = customers.data[0]

        // Récupérer les abonnements Stripe
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
        })

        // Synchroniser chaque abonnement
        for (const subscription of subscriptions.data) {
          await ctx.supabase
            .from('subscriptions')
            .upsert({
              user_id: input.userId,
              stripe_customer_id: customer.id,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0].price.id,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              cancel_at_period_end: subscription.cancel_at_period_end,
              cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
              amount_euro: (subscription.items.data[0].price.unit_amount || 599) / 100,
              updated_at: new Date().toISOString(),
            })
        }

        return { success: true, message: `${subscriptions.data.length} abonnement(s) synchronisé(s)` }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        console.error('Erreur synchronisation Stripe:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la synchronisation avec Stripe',
        })
      }
    }),
})