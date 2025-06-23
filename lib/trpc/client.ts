/**
 * COACH NUTRITIONNEL IA - TRPC CLIENT 2025
 * =========================================
 * Client tRPC v11 optimisé pour Next.js 15.3 avec React Query
 * Patterns 2025 : App Router, SSR, Streaming, Edge Runtime
 */

'use client'

import { createTRPCReact } from '@trpc/react-query'
import { loggerLink, unstable_httpBatchStreamLink } from '@trpc/client'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import superjson from 'superjson'
import type { AppRouter } from './root'

// Client tRPC React avec configuration optimisée
export const trpc = createTRPCReact<AppRouter>()

// Fonction pour obtenir l'URL de base de l'API
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side : utiliser l'origine actuelle
    return window.location.origin
  }
  
  if (process.env.VERCEL_URL) {
    // SSR sur Vercel
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Développement local
  return `http://localhost:${process.env.PORT ?? 3000}`
}

// Configuration du client tRPC avec liens optimisés
export const trpcClientConfig = {
  transformer: superjson,
  links: [
    // Logger pour développement
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    
    // HTTP Batch Stream Link pour performance optimale
    unstable_httpBatchStreamLink({
      url: `${getBaseUrl()}/api/trpc`,
      
      // Headers personnalisés
      headers: async () => {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Client-Info': 'coach-nutritionnel-ia-client/1.0',
        }
        
        // Ajouter des headers de localisation pour le marché français
        if (typeof window !== 'undefined') {
          headers['Accept-Language'] = 'fr-FR,fr;q=0.9'
          headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone
        }
        
        return headers
      },
      
      // Configuration de batch pour optimiser les requêtes
      maxURLLength: 2083,
      
      // Transformer pour sérialisation
      transformer: superjson,
      
      // Gestion des erreurs réseau
      fetch: async (url, options) => {
        const response = await fetch(url, {
          ...options,
          // Configuration pour Edge Runtime
          cache: 'no-store',
          // Timeout pour éviter les requêtes infinies
          signal: AbortSignal.timeout(30000),
        })
        
        // Gestion personnalisée des erreurs HTTP
        if (!response.ok && response.status >= 500) {
          throw new Error(`Erreur serveur: ${response.status}`)
        }
        
        return response
      },
    }),
  ],
  
  // Configuration React Query
  queryClientConfig: {
    defaultOptions: {
      queries: {
        // Cache par défaut plus agressif pour les données statiques
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        
        // Retry logic intelligent
        retry: (failureCount, error: any) => {
          // Ne pas retry sur les erreurs d'authentification
          if (error?.data?.code === 'UNAUTHORIZED') return false
          if (error?.data?.code === 'FORBIDDEN') return false
          
          // Retry jusqu'à 3 fois pour les autres erreurs
          return failureCount < 3
        },
        
        // Refetch en arrière-plan quand la fenêtre reprend le focus
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
        
        // Garder les données précédentes pendant les refetch
        keepPreviousData: true,
      },
      
      mutations: {
        // Retry pour les mutations en cas d'erreur réseau
        retry: (failureCount, error: any) => {
          if (error?.data?.code === 'UNAUTHORIZED') return false
          if (error?.data?.code === 'FORBIDDEN') return false
          if (error?.data?.code === 'CONFLICT') return false
          
          return failureCount < 2
        },
        
        // Timeout pour les mutations
        mutationKey: ['mutation'],
      },
    },
  },
}

// Types inférés pour l'autocomplétion et la sécurité de type
export type AppRouterInputs = inferRouterInputs<AppRouter>
export type AppRouterOutputs = inferRouterOutputs<AppRouter>

// Types d'input pour les principales opérations
export type RecipeSearchInput = AppRouterInputs['recipes']['search']
export type RecipeCreateInput = AppRouterInputs['recipes']['create']
export type UserProfileUpdateInput = AppRouterInputs['user']['updateProfile']
export type MealPlanCreateInput = AppRouterInputs['mealPlans']['create']

// Types d'output pour les principales requêtes
export type RecipeSearchOutput = AppRouterOutputs['recipes']['search']
export type RecipeOutput = AppRouterOutputs['recipes']['getBySlug']
export type UserProfileOutput = AppRouterOutputs['user']['getProfile']
export type MealPlanOutput = AppRouterOutputs['mealPlans']['getCurrent']

// Hooks personnalisés pour les opérations courantes
export const useRecipeSearch = (input: RecipeSearchInput) => {
  return trpc.recipes.search.useQuery(input, {
    enabled: true,
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes pour les recherches
  })
}

export const useUserProfile = () => {
  return trpc.user.getProfile.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutes pour le profil
    cacheTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useActiveSubscription = () => {
  return trpc.subscriptions.getCurrent.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch toutes les 5 minutes
  })
}

// Hooks pour les mutations avec invalidation optimisée
export const useRecipeInteraction = () => {
  const utils = trpc.useContext()
  
  return trpc.recipes.interact.useMutation({
    onSuccess: (data, variables) => {
      // Invalider les requêtes liées aux interactions
      utils.recipes.getFavorites.invalidate({ type: variables.action === 'like' ? 'liked' : variables.action === 'save' ? 'saved' : 'cooked' })
      
      // Mettre à jour le cache de la recette spécifique
      utils.recipes.getBySlug.invalidate()
    },
  })
}

export const useUserProfileUpdate = () => {
  const utils = trpc.useContext()
  
  return trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      // Invalider le profil utilisateur
      utils.user.getProfile.invalidate()
      
      // Invalider les recommandations qui dépendent du profil
      utils.recipes.getRecommendations.invalidate()
    },
  })
}

// Utilitaires pour la gestion d'état globale
export const useTRPCErrorHandler = () => {
  return (error: any) => {
    if (error?.data?.code === 'UNAUTHORIZED') {
      // Rediriger vers la page de connexion
      window.location.href = '/auth/signin'
    } else if (error?.data?.code === 'FORBIDDEN') {
      // Rediriger vers la page d'abonnement
      window.location.href = '/abonnement'
    } else {
      // Logger les autres erreurs
      console.error('Erreur tRPC:', error)
    }
  }
}

// Hook pour les statistiques utilisateur
export const useUserStats = () => {
  return trpc.user.getStats.useQuery(undefined, {
    staleTime: 10 * 60 * 1000, // 10 minutes
    select: (data) => ({
      ...data,
      // Calculs dérivés côté client
      totalInteractions: data.recipesLiked + data.recipesSaved + data.recipesCooked,
      engagementScore: Math.round((data.recipesCooked / Math.max(data.recipesSaved, 1)) * 100),
    }),
  })
}

// Hook pour précharger les données importantes
export const usePrefetchEssentialData = () => {
  const utils = trpc.useContext()
  
  return () => {
    // Précharger le profil utilisateur
    utils.user.getProfile.prefetch()
    
    // Précharger l'abonnement
    utils.subscriptions.getCurrent.prefetch()
    
    // Précharger les recettes featured
    utils.recipes.getFeatured.prefetch({ limit: 8 })
    
    // Précharger le plan alimentaire actuel
    utils.mealPlans.getCurrent.prefetch()
  }
}

// Configuration pour le cache persistant (localStorage)
export const persistentCacheKeys = [
  'user.getProfile',
  'recipes.getFeatured',
  'subscriptions.getCurrent',
] as const

// Fonction pour nettoyer le cache
export const clearTRPCCache = () => {
  if (typeof window !== 'undefined') {
    // Nettoyer React Query cache
    const queryClient = trpc.useContext().queryClient
    queryClient.clear()
    
    // Nettoyer le localStorage des clés persistantes
    persistentCacheKeys.forEach(key => {
      localStorage.removeItem(`trpc.${key}`)
    })
  }
}

// Export pour utilisation dans les composants
export { trpc as api }