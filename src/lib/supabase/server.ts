/**
 * COACH NUTRITIONNEL IA - SUPABASE SERVER CLIENT 2025
 * ===================================================
 * Client serveur Supabase optimisé pour SSR avec @supabase/ssr
 * Patterns 2025 : Server Components, Edge Runtime, cache React
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { Database } from './types'

// Configuration pour le client serveur
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variables d\'environnement Supabase serveur manquantes')
}

// Client serveur Supabase avec cache React pour éviter les appels multiples
export const createSupabaseServerClient = cache(() => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // Ignore les erreurs de cookies en mode SSR/SSG
            console.warn('Erreur lors de la définition des cookies:', error)
          }
        },
      },
      auth: {
        persistSession: false, // Pas de persistence côté serveur
        autoRefreshToken: false, // Pas de refresh automatique côté serveur
        detectSessionInUrl: false, // Pas de détection URL côté serveur
      },
      global: {
        headers: {
          'X-Client-Info': 'coach-nutritionnel-ia-server/1.0',
          'X-Region': 'france',
        },
      },
    }
  )
})

// Client pour les Server Components (lecture seule)
export const getSupabaseServerClient = () => {
  return createSupabaseServerClient()
}

// Client pour les Server Actions (lecture/écriture)
export const getSupabaseActionClient = () => {
  return createSupabaseServerClient()
}

// Fonctions utilitaires serveur avec gestion d'erreurs
export const getServerUser = cache(async () => {
  const supabase = getSupabaseServerClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Erreur récupération utilisateur serveur:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Erreur inattendue récupération utilisateur:', error)
    return null
  }
})

// Fonction pour obtenir la session serveur
export const getServerSession = cache(async () => {
  const supabase = getSupabaseServerClient()
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Erreur récupération session serveur:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Erreur inattendue récupération session:', error)
    return null
  }
})

// Fonction pour vérifier l'abonnement côté serveur
export const getServerSubscription = cache(async (userId?: string) => {
  if (!userId) {
    const user = await getServerUser()
    if (!user) return null
    userId = user.id
  }

  const supabase = getSupabaseServerClient()

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('current_period_end', new Date().toISOString())
      .maybeSingle()

    if (error) {
      console.error('Erreur récupération abonnement serveur:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erreur inattendue récupération abonnement:', error)
    return null
  }
})

// Fonction pour obtenir le profil utilisateur complet côté serveur
export const getServerUserProfile = cache(async (userId?: string) => {
  if (!userId) {
    const user = await getServerUser()
    if (!user) return null
    userId = user.id
  }

  const supabase = getSupabaseServerClient()

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_preferences (*),
        subscriptions (*)
      `)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('Erreur récupération profil serveur:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erreur inattendue récupération profil:', error)
    return null
  }
})

// Fonction pour vérifier les permissions côté serveur
export const checkServerPermissions = cache(async (requiredRole: 'user' | 'subscriber' | 'admin' = 'user') => {
  const user = await getServerUser()
  
  if (!user) {
    return { hasPermission: false, user: null, subscription: null }
  }

  // Vérifier si l'utilisateur est admin
  const isAdmin = user.user_metadata?.is_admin === true
  
  if (isAdmin) {
    return { hasPermission: true, user, subscription: null, isAdmin: true }
  }

  // Pour les permissions subscriber, vérifier l'abonnement
  if (requiredRole === 'subscriber') {
    const subscription = await getServerSubscription(user.id)
    const hasActiveSubscription = !!subscription
    
    return { 
      hasPermission: hasActiveSubscription, 
      user, 
      subscription,
      isAdmin: false 
    }
  }

  // Pour les permissions basic user
  return { hasPermission: true, user, subscription: null, isAdmin: false }
})

// Fonction pour les Server Actions avec gestion d'erreurs
export const withServerAction = <T extends any[], R>(
  action: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<{ data?: R; error?: string }> => {
    try {
      const data = await action(...args)
      return { data }
    } catch (error) {
      console.error('Erreur Server Action:', error)
      return { 
        error: error instanceof Error 
          ? error.message 
          : 'Une erreur inattendue s\'est produite' 
      }
    }
  }
}

// Fonction pour les requêtes protégées côté serveur
export const withServerAuth = <T extends any[], R>(
  action: (user: NonNullable<Awaited<ReturnType<typeof getServerUser>>>, ...args: T) => Promise<R>,
  requiredRole: 'user' | 'subscriber' | 'admin' = 'user'
) => {
  return async (...args: T): Promise<{ data?: R; error?: string }> => {
    try {
      const { hasPermission, user } = await checkServerPermissions(requiredRole)
      
      if (!hasPermission || !user) {
        return { error: 'Accès non autorisé' }
      }

      const data = await action(user, ...args)
      return { data }
    } catch (error) {
      console.error('Erreur action authentifiée:', error)
      return { 
        error: error instanceof Error 
          ? error.message 
          : 'Une erreur inattendue s\'est produite' 
      }
    }
  }
}

// Fonction pour optimiser les requêtes avec Postgres EXPLAIN
export const explainQuery = async (query: string) => {
  if (process.env.NODE_ENV !== 'development') return

  const supabase = getSupabaseServerClient()
  
  try {
    const { data, error } = await supabase.rpc('explain_query', { query })
    
    if (!error && data) {
      console.log('Query Explain:', data)
    }
  } catch (error) {
    console.warn('Impossible d\'analyser la requête:', error)
  }
}

// Fonction pour les métriques de performance
export const trackServerQuery = (queryName: string) => {
  const start = Date.now()
  
  return {
    end: () => {
      const duration = Date.now() - start
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Query ${queryName} executed in ${duration}ms`)
      }
      
      // En production, envoyer vers un service de monitoring
      if (process.env.NODE_ENV === 'production' && duration > 1000) {
        console.warn(`Slow query detected: ${queryName} took ${duration}ms`)
      }
    }
  }
}

// Types pour améliorer l'expérience développeur
export type ServerSupabaseClient = ReturnType<typeof getSupabaseServerClient>
export type ServerUser = Awaited<ReturnType<typeof getServerUser>>
export type ServerSession = Awaited<ReturnType<typeof getServerSession>>
export type ServerUserProfile = Awaited<ReturnType<typeof getServerUserProfile>>
export type ServerSubscription = Awaited<ReturnType<typeof getServerSubscription>>

// Export par défaut du client principal
export default getSupabaseServerClient