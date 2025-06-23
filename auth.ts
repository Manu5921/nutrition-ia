/**
 * COACH NUTRITIONNEL IA - AUTH.JS v5 CONFIGURATION
 * ===============================================
 * Configuration NextAuth.js v5 avec Supabase
 * Patterns 2025 : Auth.js v5, Edge Runtime, Supabase integration
 */

import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // Vérifier l'abonnement actif
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        token.hasActiveSubscription = !!subscription
        token.subscriptionId = subscription?.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.hasActiveSubscription = token.hasActiveSubscription as boolean
        session.user.subscriptionId = token.subscriptionId as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Redirection post-connexion vers dashboard
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  events: {
    async createUser({ user }) {
      // Créer le profil utilisateur dans Supabase
      await supabase.from('user_profiles').insert({
        user_id: user.id!,
        activity_level: 'moderate',
        health_goals: ['weight_loss'],
        food_restrictions: [],
        preferred_meal_times: ['breakfast', 'lunch', 'dinner'],
        cooking_skill_level: 'beginner',
      })

      // Créer les préférences par défaut
      await supabase.from('user_preferences').insert({
        user_id: user.id!,
        favorite_cuisines: ['mediterranean', 'french'],
        preferred_language: 'fr',
        communication_frequency: 'weekly',
        notification_preferences: {
          meal_reminders: true,
          weekly_reports: true,
          recipe_suggestions: true,
        },
      })
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  debug: process.env.NODE_ENV === "development",
})