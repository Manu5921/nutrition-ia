/**
 * COACH NUTRITIONNEL IA - SUPABASE CLIENT 2025
 * ============================================
 * Configuration client Supabase avec @supabase/ssr pour Next.js 15.3
 * Patterns 2025 : SSR-safe, TypeScript strict, optimisé Edge Runtime
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

// Configuration pour le client navigateur
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variables d\'environnement Supabase manquantes')
}

// Client Supabase pour le navigateur avec types TypeScript
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      // Configuration Auth 2025
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      
      // Politique de stockage sécurisée
      storage: {
        getItem: (key: string) => {
          if (typeof window === 'undefined') return null
          return window.localStorage.getItem(key)
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') return
          window.localStorage.setItem(key, value)
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return
          window.localStorage.removeItem(key)
        },
      },
    },
    
    // Configuration optimisée pour performance
    realtime: {
      params: {
        eventsPerSecond: 2, // Limite pour éviter spam
      },
    },
    
    // Headers personnalisés pour l'application
    global: {
      headers: {
        'X-Client-Info': 'coach-nutritionnel-ia/1.0',
        'X-Region': 'france',
      },
    },
  }
)

// Fonctions utilitaires typées
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Fonction pour vérifier l'abonnement actif
export const hasActiveSubscription = async (userId?: string) => {
  if (!userId) {
    const user = await getCurrentUser()
    if (!user) return false
    userId = user.id
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gte('current_period_end', new Date().toISOString())
    .maybeSingle()

  if (error) {
    console.error('Erreur vérification abonnement:', error)
    return false
  }

  return !!data
}

// Fonction pour obtenir le profil utilisateur complet
export const getUserProfile = async (userId?: string) => {
  if (!userId) {
    const user = await getCurrentUser()
    if (!user) return null
    userId = user.id
  }

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
    console.error('Erreur récupération profil:', error)
    return null
  }

  return data
}

// Fonction pour mettre à jour le profil
export const updateUserProfile = async (
  userId: string, 
  updates: Partial<Database['public']['Tables']['user_profiles']['Update']>
) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Fonction de recherche de recettes optimisée
export const searchRecipes = async (params: {
  query?: string
  difficulty?: string
  maxTime?: number
  season?: string
  tags?: string[]
  limit?: number
  offset?: number
}) => {
  let query = supabase
    .from('recipes')
    .select(`
      id,
      name,
      slug,
      short_description,
      image_url,
      anti_inflammatory_score,
      difficulty_level,
      total_time_minutes,
      meal_type,
      diet_tags,
      season,
      rating_avg,
      rating_count
    `)
    .eq('is_published', true)
    .order('rating_avg', { ascending: false })

  // Recherche textuelle
  if (params.query) {
    query = query.textSearch('name', params.query, {
      type: 'websearch',
      config: 'french'
    })
  }

  // Filtres
  if (params.difficulty) {
    query = query.eq('difficulty_level', params.difficulty)
  }

  if (params.maxTime) {
    query = query.lte('total_time_minutes', params.maxTime)
  }

  if (params.season) {
    query = query.contains('season', [params.season])
  }

  if (params.tags && params.tags.length > 0) {
    query = query.overlaps('diet_tags', params.tags)
  }

  // Pagination
  if (params.limit) {
    query = query.limit(params.limit)
  }

  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

// Fonction pour obtenir une recette complète
export const getRecipe = async (slugOrId: string) => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      user_recipe_interactions!inner (
        is_liked,
        is_saved,
        rating,
        review_text
      )
    `)
    .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
    .eq('is_published', true)
    .maybeSingle()

  if (error) throw error
  return data
}

// Fonction pour créer un plan alimentaire
export const createWeeklyMealPlan = async (
  userId: string,
  weekStartDate: string,
  meals: Database['public']['Tables']['weekly_meal_plans']['Insert']['meals']
) => {
  const { data, error } = await supabase
    .from('weekly_meal_plans')
    .insert({
      user_id: userId,
      week_start_date: weekStartDate,
      meals,
      status: 'draft',
      generated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Fonction pour interactions avec les recettes
export const toggleRecipeAction = async (
  userId: string,
  recipeId: string,
  action: 'like' | 'save' | 'cook',
  value: boolean
) => {
  const updateData = {
    [`is_${action}${action === 'cook' ? 'ed' : 'd'}`]: value,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('user_recipe_interactions')
    .upsert({
      user_id: userId,
      recipe_id: recipeId,
      ...updateData,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Fonction de rating de recette
export const rateRecipe = async (
  userId: string,
  recipeId: string,
  rating: number,
  review?: string
) => {
  const { data, error } = await supabase
    .from('user_recipe_interactions')
    .upsert({
      user_id: userId,
      recipe_id: recipeId,
      rating,
      review_text: review,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Export du type Database pour utilisation dans l'app
export type { Database }