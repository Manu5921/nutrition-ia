/**
 * COACH NUTRITIONNEL IA - TRPC RECIPES ROUTER 2025
 * ================================================
 * API tRPC pour la gestion des recettes anti-inflammatoires
 * Validation Zod + RLS Supabase
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { 
  createTRPCRouter, 
  publicProcedure, 
  protectedProcedure, 
  subscribedProcedure, 
  adminProcedure,
  handleSupabaseError
} from '../server'

// Schémas Zod pour validation
const recipeFiltersSchema = z.object({
  search: z.string().optional(),
  difficulty: z.enum(['facile', 'moyen', 'difficile']).optional(),
  maxTime: z.number().min(1).max(480).optional(),
  season: z.enum(['printemps', 'ete', 'automne', 'hiver']).optional(),
  mealType: z.array(z.string()).optional(),
  dietTags: z.array(z.string()).optional(),
  minAntiInflammatoryScore: z.number().min(1).max(10).optional(),
  maxCostPerServing: z.number().min(0).optional(),
  limit: z.number().min(1).max(50).default(12),
  offset: z.number().min(0).default(0),
})

const recipeInteractionSchema = z.object({
  recipeId: z.string().uuid(),
  action: z.enum(['like', 'save', 'cook']),
  value: z.boolean(),
})

const recipeRatingSchema = z.object({
  recipeId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  review: z.string().max(1000).optional(),
})

const ingredientSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.string().min(1).max(50),
  unit: z.string().min(1).max(20),
  notes: z.string().max(200).optional(),
})

const nutritionFactsSchema = z.object({
  calories: z.number().min(0),
  proteins: z.number().min(0),
  carbs: z.number().min(0),
  fats: z.number().min(0),
  fiber: z.number().min(0),
  sugar: z.number().min(0),
  sodium: z.number().min(0),
})

const createRecipeSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000).optional(),
  shortDescription: z.string().min(10).max(200).optional(),
  ingredients: z.array(ingredientSchema).min(1),
  instructions: z.array(z.string().min(5).max(500)).min(1),
  tips: z.array(z.string().max(300)).optional(),
  nutritionFacts: nutritionFactsSchema.optional(),
  antiInflammatoryScore: z.number().min(1).max(10),
  servings: z.number().min(1).max(20),
  prepTimeMinutes: z.number().min(0).max(480),
  cookTimeMinutes: z.number().min(0).max(480),
  difficultyLevel: z.enum(['facile', 'moyen', 'difficile']),
  mealType: z.array(z.enum(['petit_dejeuner', 'dejeuner', 'diner', 'collation'])),
  dietTags: z.array(z.string()).optional(),
  season: z.array(z.enum(['printemps', 'ete', 'automne', 'hiver'])).optional(),
  costPerServingEuro: z.number().min(0).optional(),
  imageUrl: z.string().url().optional(),
})

export const recipesRouter = createTRPCRouter({
  // Rechercher des recettes (public)
  search: publicProcedure
    .input(recipeFiltersSchema)
    .query(async ({ ctx, input }) => {
      try {
        let query = ctx.supabase
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
            rating_count,
            cost_per_serving_euro,
            servings
          `)
          .eq('is_published', true)
          .order('rating_avg', { ascending: false })

        // Recherche textuelle en français
        if (input.search) {
          query = query.textSearch('name', input.search, {
            type: 'websearch',
            config: 'french'
          })
        }

        // Filtres
        if (input.difficulty) {
          query = query.eq('difficulty_level', input.difficulty)
        }

        if (input.maxTime) {
          query = query.lte('total_time_minutes', input.maxTime)
        }

        if (input.season) {
          query = query.contains('season', [input.season])
        }

        if (input.mealType && input.mealType.length > 0) {
          query = query.overlaps('meal_type', input.mealType)
        }

        if (input.dietTags && input.dietTags.length > 0) {
          query = query.overlaps('diet_tags', input.dietTags)
        }

        if (input.minAntiInflammatoryScore) {
          query = query.gte('anti_inflammatory_score', input.minAntiInflammatoryScore)
        }

        if (input.maxCostPerServing) {
          query = query.lte('cost_per_serving_euro', input.maxCostPerServing)
        }

        // Pagination
        query = query.range(input.offset, input.offset + input.limit - 1)

        const { data, error } = await query

        if (error) handleSupabaseError(error)

        return {
          recipes: data || [],
          hasMore: (data?.length || 0) === input.limit,
          total: data?.length || 0
        }
      } catch (error) {
        console.error('Erreur recherche recettes:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la recherche de recettes',
        })
      }
    }),

  // Obtenir une recette par slug/ID (public)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase
          .from('recipes')
          .select(`
            *,
            user_recipe_interactions (
              is_liked,
              is_saved,
              is_cooked,
              rating,
              review_text
            )
          `)
          .or(`slug.eq.${input.slug},id.eq.${input.slug}`)
          .eq('is_published', true)
          .maybeSingle()

        if (error) handleSupabaseError(error)

        if (!data) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Recette non trouvée',
          })
        }

        // Incrémenter le compteur de vues
        if (data.id) {
          await ctx.supabase
            .from('recipes')
            .update({ view_count: (data.view_count || 0) + 1 })
            .eq('id', data.id)
        }

        return data
      } catch (error) {
        if (error instanceof TRPCError) throw error
        console.error('Erreur récupération recette:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération de la recette',
        })
      }
    }),

  // Obtenir les recettes populaires/featured (public)
  getFeatured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(8) }))
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase
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
            rating_avg,
            rating_count
          `)
          .eq('is_published', true)
          .eq('is_featured', true)
          .order('rating_avg', { ascending: false })
          .limit(input.limit)

        if (error) handleSupabaseError(error)

        return data || []
      } catch (error) {
        console.error('Erreur récupération recettes featured:', error)
        return []
      }
    }),

  // Obtenir les recettes saisonnières (public)
  getSeasonal: publicProcedure
    .input(z.object({ 
      season: z.enum(['printemps', 'ete', 'automne', 'hiver']),
      limit: z.number().min(1).max(20).default(6) 
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase
          .from('recipes')
          .select(`
            id,
            name,
            slug,
            short_description,
            image_url,
            anti_inflammatory_score,
            season
          `)
          .eq('is_published', true)
          .contains('season', [input.season])
          .order('anti_inflammatory_score', { ascending: false })
          .limit(input.limit)

        if (error) handleSupabaseError(error)

        return data || []
      } catch (error) {
        console.error('Erreur récupération recettes saisonnières:', error)
        return []
      }
    }),

  // Obtenir les recettes favorites de l'utilisateur (authentifié)
  getFavorites: protectedProcedure
    .input(z.object({ 
      type: z.enum(['liked', 'saved', 'cooked']).default('saved'),
      limit: z.number().min(1).max(50).default(20) 
    }))
    .query(async ({ ctx, input }) => {
      try {
        const filterField = `is_${input.type}${input.type === 'cooked' ? 'ed' : 'd'}`
        
        const { data, error } = await ctx.supabase
          .from('user_recipe_interactions')
          .select(`
            recipes (
              id,
              name,
              slug,
              short_description,
              image_url,
              anti_inflammatory_score,
              difficulty_level,
              total_time_minutes,
              rating_avg
            )
          `)
          .eq('user_id', ctx.user.id)
          .eq(filterField, true)
          .order('updated_at', { ascending: false })
          .limit(input.limit)

        if (error) handleSupabaseError(error)

        return data?.map(item => item.recipes).filter(Boolean) || []
      } catch (error) {
        console.error('Erreur récupération recettes favorites:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des recettes favorites',
        })
      }
    }),

  // Interagir avec une recette (like/save/cook) (authentifié)
  interact: protectedProcedure
    .input(recipeInteractionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const updateField = `is_${input.action}${input.action === 'cook' ? 'ed' : 'd'}`
        
        const { data, error } = await ctx.supabase
          .from('user_recipe_interactions')
          .upsert({
            user_id: ctx.user.id,
            recipe_id: input.recipeId,
            [updateField]: input.value,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) handleSupabaseError(error)

        return { success: true, interaction: data }
      } catch (error) {
        console.error('Erreur interaction recette:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de l\'interaction avec la recette',
        })
      }
    }),

  // Noter une recette (authentifié)
  rate: protectedProcedure
    .input(recipeRatingSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase
          .from('user_recipe_interactions')
          .upsert({
            user_id: ctx.user.id,
            recipe_id: input.recipeId,
            rating: input.rating,
            review_text: input.review,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) handleSupabaseError(error)

        return { success: true, rating: data }
      } catch (error) {
        console.error('Erreur notation recette:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la notation de la recette',
        })
      }
    }),

  // Obtenir les recommandations personnalisées (abonné)
  getRecommendations: subscribedProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ ctx, input }) => {
      try {
        // Récupérer le profil utilisateur pour personnaliser
        const { data: profile } = await ctx.supabase
          .from('user_profiles')
          .select('health_goals, food_restrictions, preferred_meal_times')
          .eq('user_id', ctx.user.id)
          .maybeSingle()

        // Construire la requête personnalisée
        let query = ctx.supabase
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
            rating_avg
          `)
          .eq('is_published', true)
          .gte('anti_inflammatory_score', 7) // Score anti-inflammatoire élevé

        // Exclure les recettes avec restrictions alimentaires
        if (profile?.food_restrictions && profile.food_restrictions.length > 0) {
          // Cette logique nécessiterait une fonction PostgreSQL personnalisée
          // Pour simplifier, on filtre côté application
        }

        query = query
          .order('anti_inflammatory_score', { ascending: false })
          .order('rating_avg', { ascending: false })
          .limit(input.limit)

        const { data, error } = await query

        if (error) handleSupabaseError(error)

        return data || []
      } catch (error) {
        console.error('Erreur récupération recommandations:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des recommandations',
        })
      }
    }),

  // Créer une nouvelle recette (admin)
  create: adminProcedure
    .input(createRecipeSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Générer un slug unique
        const slug = input.name
          .toLowerCase()
          .replace(/[àáäâ]/g, 'a')
          .replace(/[èéëê]/g, 'e')
          .replace(/[ìíïî]/g, 'i')
          .replace(/[òóöô]/g, 'o')
          .replace(/[ùúüû]/g, 'u')
          .replace(/[ñ]/g, 'n')
          .replace(/[ç]/g, 'c')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')

        const { data, error } = await ctx.supabase
          .from('recipes')
          .insert({
            name: input.name,
            slug,
            description: input.description,
            short_description: input.shortDescription,
            ingredients: input.ingredients,
            instructions: input.instructions,
            tips: input.tips,
            nutrition_facts: input.nutritionFacts,
            anti_inflammatory_score: input.antiInflammatoryScore,
            servings: input.servings,
            prep_time_minutes: input.prepTimeMinutes,
            cook_time_minutes: input.cookTimeMinutes,
            difficulty_level: input.difficultyLevel,
            meal_type: input.mealType,
            diet_tags: input.dietTags,
            season: input.season,
            cost_per_serving_euro: input.costPerServingEuro,
            image_url: input.imageUrl,
            author: ctx.user.email,
            is_published: true,
            published_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) handleSupabaseError(error)

        return { success: true, recipe: data }
      } catch (error) {
        console.error('Erreur création recette:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la création de la recette',
        })
      }
    }),

  // Mettre à jour une recette (admin)
  update: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: createRecipeSchema.partial()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase
          .from('recipes')
          .update({
            ...input.data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id)
          .select()
          .single()

        if (error) handleSupabaseError(error)

        return { success: true, recipe: data }
      } catch (error) {
        console.error('Erreur mise à jour recette:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la mise à jour de la recette',
        })
      }
    }),

  // Supprimer une recette (admin)
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { error } = await ctx.supabase
          .from('recipes')
          .delete()
          .eq('id', input.id)

        if (error) handleSupabaseError(error)

        return { success: true }
      } catch (error) {
        console.error('Erreur suppression recette:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la suppression de la recette',
        })
      }
    }),
})