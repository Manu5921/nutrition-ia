/**
 * COACH NUTRITIONNEL IA - AUTH MIDDLEWARE 2025
 * ============================================
 * Middleware d'authentification pour Next.js 15.3 App Router
 * Intégration Supabase + protection des routes
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Configuration des routes publiques et protégées
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/auth/connexion',
  '/auth/inscription',
  '/auth/mot-de-passe-oublie',
  '/auth/callback',
  '/blog',
  '/recettes',
  '/a-propos',
  '/contact',
  '/politique-confidentialite',
  '/conditions-utilisation',
  '/api/webhooks',
]

const PROTECTED_ROUTES = [
  '/dashboard',
  '/profil',
  '/plans-alimentaires',
  '/recettes/favoris',
  '/progression',
  '/parametres',
]

const SUBSCRIPTION_REQUIRED_ROUTES = [
  '/dashboard/plans-alimentaires/generer',
  '/dashboard/recettes/recommandations',
  '/dashboard/nutrition-coach',
  '/api/trpc/mealPlans.generate',
  '/api/trpc/recipes.getRecommendations',
]

const ADMIN_ROUTES = [
  '/admin',
  '/api/admin',
]

// Fonction utilitaire pour vérifier les patterns de routes
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1))
    }
    return pathname === route || pathname.startsWith(route + '/')
  })
}

// Fonction pour créer le client Supabase avec middleware
function createSupabaseMiddleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  return { supabase, response }
}

// Fonction pour vérifier l'abonnement actif
async function hasActiveSubscription(userId: string, supabase: ReturnType<typeof createClient>): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .maybeSingle()

    return !error && !!data
  } catch (error) {
    console.error('Erreur vérification abonnement middleware:', error)
    return false
  }
}

// Fonction pour vérifier les privilèges admin
async function isAdmin(userId: string, supabase: ReturnType<typeof createClient>): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('metadata')
      .eq('id', userId)
      .single()

    return !error && data?.metadata?.is_admin === true
  } catch (error) {
    console.error('Erreur vérification admin middleware:', error)
    return false
  }
}

// Middleware principal
export async function authMiddleware(request: NextRequest) {
  const { supabase, response } = createSupabaseMiddleware(request)
  const pathname = request.nextUrl.pathname

  try {
    // Récupérer l'utilisateur actuel
    const { data: { user }, error } = await supabase.auth.getUser()

    // Gestion des erreurs d'authentification
    if (error) {
      console.error('Erreur authentification middleware:', error)
      
      // Si on est sur une route protégée, rediriger vers login
      if (matchesRoute(pathname, PROTECTED_ROUTES)) {
        const redirectUrl = new URL('/auth/connexion', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }
      
      return response
    }

    // Routes publiques - accès libre
    if (matchesRoute(pathname, PUBLIC_ROUTES)) {
      // Si utilisateur connecté sur page auth, rediriger vers dashboard
      if (user && pathname.startsWith('/auth/') && pathname !== '/auth/callback') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return response
    }

    // Routes admin - vérifier privilèges
    if (matchesRoute(pathname, ADMIN_ROUTES)) {
      if (!user) {
        const redirectUrl = new URL('/auth/connexion', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      const userIsAdmin = await isAdmin(user.id, supabase)
      if (!userIsAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      return response
    }

    // Routes protégées - vérifier authentification
    if (matchesRoute(pathname, PROTECTED_ROUTES)) {
      if (!user) {
        const redirectUrl = new URL('/auth/connexion', request.url)
        redirectUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Vérifier si abonnement requis
      if (matchesRoute(pathname, SUBSCRIPTION_REQUIRED_ROUTES)) {
        const hasSubscription = await hasActiveSubscription(user.id, supabase)
        const userIsAdmin = await isAdmin(user.id, supabase)

        if (!hasSubscription && !userIsAdmin) {
          const redirectUrl = new URL('/abonnement', request.url)
          redirectUrl.searchParams.set('reason', 'subscription_required')
          redirectUrl.searchParams.set('redirect', pathname)
          return NextResponse.redirect(redirectUrl)
        }
      }

      return response
    }

    // API tRPC - vérifier authentification pour certaines routes
    if (pathname.startsWith('/api/trpc/')) {
      const procedure = pathname.split('/api/trpc/')[1]
      
      // Procédures nécessitant authentification
      const protectedProcedures = [
        'user.',
        'mealPlans.',
        'progress.',
        'subscriptions.getCurrent',
        'subscriptions.createCheckoutSession',
        'subscriptions.createPortalSession',
        'subscriptions.cancelSubscription',
        'subscriptions.reactivateSubscription',
        'recipes.getFavorites',
        'recipes.interact',
        'recipes.rate',
      ]

      // Procédures nécessitant abonnement
      const subscriptionProcedures = [
        'mealPlans.generate',
        'recipes.getRecommendations',
      ]

      // Procédures admin
      const adminProcedures = [
        'admin.',
        'subscriptions.getStats',
        'subscriptions.getAll',
        'subscriptions.syncWithStripe',
        'recipes.create',
        'recipes.update',
        'recipes.delete',
        'user.getAllUsers',
      ]

      if (adminProcedures.some(p => procedure?.startsWith(p))) {
        if (!user) {
          return new NextResponse('Unauthorized', { status: 401 })
        }
        
        const userIsAdmin = await isAdmin(user.id, supabase)
        if (!userIsAdmin) {
          return new NextResponse('Forbidden', { status: 403 })
        }
      } else if (subscriptionProcedures.some(p => procedure?.startsWith(p))) {
        if (!user) {
          return new NextResponse('Unauthorized', { status: 401 })
        }

        const hasSubscription = await hasActiveSubscription(user.id, supabase)
        const userIsAdmin = await isAdmin(user.id, supabase)

        if (!hasSubscription && !userIsAdmin) {
          return new NextResponse('Subscription Required', { status: 402 })
        }
      } else if (protectedProcedures.some(p => procedure?.startsWith(p))) {
        if (!user) {
          return new NextResponse('Unauthorized', { status: 401 })
        }
      }

      return response
    }

    // Webhooks - laisser passer
    if (pathname.startsWith('/api/webhooks/')) {
      return response
    }

    // Routes API autres - vérifier selon le cas
    if (pathname.startsWith('/api/')) {
      // Par défaut, les API sont publiques sauf indication contraire
      return response
    }

    // Par défaut, laisser passer
    return response

  } catch (error) {
    console.error('Erreur middleware auth:', error)
    
    // En cas d'erreur, rediriger vers login si route protégée
    if (matchesRoute(pathname, PROTECTED_ROUTES) || matchesRoute(pathname, ADMIN_ROUTES)) {
      const redirectUrl = new URL('/auth/connexion', request.url)
      redirectUrl.searchParams.set('error', 'auth_error')
      return NextResponse.redirect(redirectUrl)
    }
    
    return response
  }
}

// Configuration du matcher pour optimiser les performances
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}

// Export des types pour utilisation
export type AuthMiddlewareConfig = {
  publicRoutes?: string[]
  protectedRoutes?: string[]
  subscriptionRequiredRoutes?: string[]
  adminRoutes?: string[]
}

// Fonction utilitaire pour créer un middleware personnalisé
export function createAuthMiddleware(config?: AuthMiddlewareConfig) {
  return async (request: NextRequest) => {
    // Si aucune config personnalisée, utiliser le middleware par défaut
    if (!config) {
      return authMiddleware(request)
    }

    // Fusionner avec la configuration par défaut
    const mergedConfig = {
      publicRoutes: [...PUBLIC_ROUTES, ...(config.publicRoutes || [])],
      protectedRoutes: [...PROTECTED_ROUTES, ...(config.protectedRoutes || [])],
      subscriptionRequiredRoutes: [...SUBSCRIPTION_REQUIRED_ROUTES, ...(config.subscriptionRequiredRoutes || [])],
      adminRoutes: [...ADMIN_ROUTES, ...(config.adminRoutes || [])],
    }

    // Utiliser la logique du middleware avec la config personnalisée
    // (Ici on pourrait implémenter une logique personnalisée avec mergedConfig)
    console.log('Using custom config:', mergedConfig)
    return authMiddleware(request)
  }
}