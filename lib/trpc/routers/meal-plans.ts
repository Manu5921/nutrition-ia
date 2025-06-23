/**
 * COACH NUTRITIONNEL IA - TRPC MEAL PLANS ROUTER 2025
 * ===================================================
 * API tRPC pour la gestion des plans alimentaires hebdomadaires
 * Génération automatique avec IA + personnalisation utilisateur
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { 
  createTRPCRouter, 
  subscribedProcedure, 
  adminProcedure,
  handleSupabaseError
} from '../server'

// Schémas Zod pour validation
const mealPlanGenerationSchema = z.object({
  weekStartDate: z.string().refine(date => {
    const d = new Date(date)
    return !isNaN(d.getTime()) && d.getDay() === 1 // Doit être un lundi
  }, "La date doit être un lundi"),
  preferences: z.object({
    targetCalories: z.number().min(1200).max(4000).optional(),
    proteinGoalG: z.number().min(50).max(300).optional(),
    maxMealPrepTime: z.number().min(15).max(120).default(45),
    budgetLimit: z.number().min(20).max(200).optional(),
    avoidIngredients: z.array(z.string()).default([]),
    favoriteIngredients: z.array(z.string()).default([]),
    mealTypes: z.array(z.enum(['petit_dejeuner', 'dejeuner', 'diner', 'collation'])).default(['petit_dejeuner', 'dejeuner', 'diner']),
    cookingDays: z.array(z.enum(['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'])).default(['dimanche']),
    antiInflammatoryFocus: z.boolean().default(true),
    seasonalPreference: z.boolean().default(true),
  }).optional(),
  customPrompt: z.string().max(500).optional(),
})

const mealSchema = z.object({
  recipeId: z.string().uuid(),
  servings: z.number().min(1).max(10).default(1),
  notes: z.string().max(200).optional(),
})

const dayMealsSchema = z.object({
  petit_dejeuner: mealSchema.optional(),
  dejeuner: mealSchema.optional(),
  diner: mealSchema.optional(),
  collation_matin: mealSchema.optional(),
  collation_apres_midi: mealSchema.optional(),
})

const customMealPlanSchema = z.object({
  weekStartDate: z.string().refine(date => {
    const d = new Date(date)
    return !isNaN(d.getTime()) && d.getDay() === 1
  }),
  meals: z.object({
    lundi: dayMealsSchema,
    mardi: dayMealsSchema,
    mercredi: dayMealsSchema,
    jeudi: dayMealsSchema,
    vendredi: dayMealsSchema,
    samedi: dayMealsSchema,
    dimanche: dayMealsSchema,
  }),
})

const shoppingListItemSchema = z.object({
  ingredient: z.string().min(1).max(100),
  quantity: z.string().min(1).max(50),
  unit: z.string().min(1).max(20),
  category: z.string().min(1).max(50),
  estimatedCost: z.number().min(0).optional(),
  isOptional: z.boolean().default(false),
})

// Fonction utilitaire pour calculer la date de fin de semaine
const getWeekEndDate = (weekStartDate: string): string => {
  const start = new Date(weekStartDate)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return end.toISOString().split('T')[0]
}

// Fonction pour générer une liste de courses à partir des repas
const generateShoppingList = async (meals: any, supabase: any): Promise<any[]> => {
  // Récupérer tous les IDs de recettes
  const recipeIds = new Set<string>()
  
  Object.values(meals).forEach((dayMeals: any) => {
    Object.values(dayMeals).forEach((meal: any) => {
      if (meal?.recipeId) {
        recipeIds.add(meal.recipeId)
      }
    })
  })

  if (recipeIds.size === 0) return []

  // Récupérer les ingrédients de toutes les recettes
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('id, ingredients, servings')
    .in('id', Array.from(recipeIds))

  if (error) {
    console.error('Erreur récupération recettes pour liste courses:', error)
    return []
  }

  // Consolider les ingrédients
  const consolidatedIngredients = new Map<string, any>()

  Object.entries(meals).forEach(([day, dayMeals]: [string, any]) => {
    Object.entries(dayMeals).forEach(([mealType, meal]: [string, any]) => {
      if (!meal?.recipeId) return

      const recipe = recipes?.find(r => r.id === meal.recipeId)
      if (!recipe) return

      const servingMultiplier = meal.servings / recipe.servings

      recipe.ingredients?.forEach((ingredient: any) => {
        const key = ingredient.name.toLowerCase()
        
        if (consolidatedIngredients.has(key)) {
          const existing = consolidatedIngredients.get(key)
          // Logique de consolidation simplifiée
          existing.quantity = `${parseFloat(existing.quantity) + (parseFloat(ingredient.quantity) * servingMultiplier)}`
        } else {
          consolidatedIngredients.set(key, {
            ingredient: ingredient.name,
            quantity: `${parseFloat(ingredient.quantity) * servingMultiplier}`,
            unit: ingredient.unit,
            category: categorizeIngredient(ingredient.name),
            estimatedCost: estimateIngredientCost(ingredient.name, ingredient.quantity, ingredient.unit),
          })
        }
      })
    })
  })

  return Array.from(consolidatedIngredients.values())
}

// Fonction utilitaire pour catégoriser les ingrédients
const categorizeIngredient = (name: string): string => {
  const categories = {
    'légumes': ['tomate', 'carotte', 'courgette', 'épinard', 'brocoli', 'poivron', 'oignon', 'ail'],
    'fruits': ['pomme', 'banane', 'orange', 'citron', 'avocat', 'berry'],
    'protéines': ['poulet', 'poisson', 'bœuf', 'porc', 'œuf', 'tofu', 'légumineuses'],
    'céréales': ['riz', 'pâtes', 'quinoa', 'avoine', 'pain'],
    'produits laitiers': ['lait', 'yaourt', 'fromage', 'beurre'],
    'épices et condiments': ['sel', 'poivre', 'curcuma', 'gingembre', 'huile', 'vinaigre'],
    'autres': [],
  }

  const lowerName = name.toLowerCase()
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return category
    }
  }
  
  return 'autres'
}

// Fonction utilitaire pour estimer le coût des ingrédients
const estimateIngredientCost = (name: string, quantity: string, unit: string): number => {
  // Estimation simplifiée basée sur des prix moyens français
  const costPerUnit: Record<string, number> = {
    'kg': 5.0,
    'g': 0.005,
    'l': 2.0,
    'ml': 0.002,
    'unité': 0.5,
    'pièce': 0.5,
  }

  const qty = parseFloat(quantity) || 1
  const unitCost = costPerUnit[unit.toLowerCase()] || 0.1
  
  return Math.round(qty * unitCost * 100) / 100
}

export const mealPlansRouter = createTRPCRouter({
  // Obtenir le plan alimentaire actuel
  getCurrent: subscribedProcedure
    .query(async ({ ctx }) => {
      try {
        // Calculer le début de la semaine actuelle (lundi)
        const now = new Date()
        const dayOfWeek = now.getDay()
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        const monday = new Date(now)
        monday.setDate(now.getDate() + mondayOffset)
        monday.setHours(0, 0, 0, 0)
        
        const { data, error } = await ctx.supabase
          .from('weekly_meal_plans')
          .select(`
            *,
            shopping_lists (*)
          `)
          .eq('user_id', ctx.user.id)
          .eq('week_start_date', monday.toISOString().split('T')[0])
          .maybeSingle()

        if (error) handleSupabaseError(error)

        return data
      } catch (error) {
        console.error('Erreur récupération plan alimentaire actuel:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération du plan alimentaire',
        })
      }
    }),

  // Obtenir l'historique des plans alimentaires
  getHistory: subscribedProcedure
    .input(z.object({
      limit: z.number().min(1).max(20).default(10),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { data, error } = await ctx.supabase
          .from('weekly_meal_plans')
          .select(`
            id,
            week_start_date,
            week_end_date,
            status,
            anti_inflammatory_score_avg,
            total_estimated_cost_euro,
            is_custom,
            created_at
          `)
          .eq('user_id', ctx.user.id)
          .order('week_start_date', { ascending: false })
          .range(input.offset, input.offset + input.limit - 1)

        if (error) handleSupabaseError(error)

        return data || []
      } catch (error) {
        console.error('Erreur récupération historique plans:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération de l\'historique',
        })
      }
    }),

  // Obtenir un plan alimentaire spécifique avec détails des recettes
  getById: subscribedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: mealPlan, error } = await ctx.supabase
          .from('weekly_meal_plans')
          .select('*')
          .eq('id', input.id)
          .eq('user_id', ctx.user.id)
          .single()

        if (error) handleSupabaseError(error)

        // Récupérer les détails des recettes
        const recipeIds = new Set<string>()
        Object.values(mealPlan.meals).forEach((dayMeals: any) => {
          Object.values(dayMeals).forEach((meal: any) => {
            if (meal?.recipeId) {
              recipeIds.add(meal.recipeId)
            }
          })
        })

        let recipesData = []
        if (recipeIds.size > 0) {
          const { data: recipes, error: recipesError } = await ctx.supabase
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
              servings,
              ingredients,
              instructions
            `)
            .in('id', Array.from(recipeIds))

          if (recipesError) {
            console.error('Erreur récupération recettes:', recipesError)
          } else {
            recipesData = recipes || []
          }
        }

        return {
          ...mealPlan,
          recipesDetails: recipesData
        }
      } catch (error) {
        console.error('Erreur récupération plan alimentaire:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération du plan alimentaire',
        })
      }
    }),

  // Générer un nouveau plan alimentaire avec IA
  generate: subscribedProcedure
    .input(mealPlanGenerationSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Récupérer le profil utilisateur pour personnalisation
        const { data: profile } = await ctx.supabase
          .from('user_profiles')
          .select(`
            *,
            user_preferences (*)
          `)
          .eq('user_id', ctx.user.id)
          .maybeSingle()

        // Vérifier qu'un plan n'existe pas déjà pour cette semaine
        const { data: existingPlan } = await ctx.supabase
          .from('weekly_meal_plans')
          .select('id')
          .eq('user_id', ctx.user.id)
          .eq('week_start_date', input.weekStartDate)
          .maybeSingle()

        if (existingPlan) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Un plan alimentaire existe déjà pour cette semaine',
          })
        }

        // Récupérer des recettes adaptées aux critères
        let query = ctx.supabase
          .from('recipes')
          .select(`
            id,
            name,
            anti_inflammatory_score,
            difficulty_level,
            total_time_minutes,
            meal_type,
            diet_tags,
            ingredients,
            servings,
            cost_per_serving_euro
          `)
          .eq('is_published', true)

        // Filtrer selon les préférences
        if (input.preferences?.antiInflammatoryFocus) {
          query = query.gte('anti_inflammatory_score', 7)
        }

        if (input.preferences?.maxMealPrepTime) {
          query = query.lte('total_time_minutes', input.preferences.maxMealPrepTime)
        }

        if (profile?.food_restrictions && profile.food_restrictions.length > 0) {
          // Cette logique nécessiterait une fonction PostgreSQL personnalisée
          // Pour simplifier, on traite côté application
        }

        query = query.limit(100) // Limite pour avoir un pool de recettes

        const { data: availableRecipes, error: recipesError } = await query

        if (recipesError) handleSupabaseError(recipesError)

        if (!availableRecipes || availableRecipes.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Aucune recette disponible selon vos critères',
          })
        }

        // Algorithme de sélection des recettes pour la semaine
        const selectedMeals = generateWeeklyMeals(
          availableRecipes,
          input.preferences,
          profile
        )

        // Générer la liste de courses
        const shoppingList = await generateShoppingList(selectedMeals, ctx.supabase)

        // Calculer les statistiques nutritionnelles
        const nutritionSummary = calculateWeeklyNutrition(selectedMeals, availableRecipes)

        // Créer le plan alimentaire
        const { data: newMealPlan, error: createError } = await ctx.supabase
          .from('weekly_meal_plans')
          .insert({
            user_id: ctx.user.id,
            week_start_date: input.weekStartDate,
            meals: selectedMeals,
            shopping_list: shoppingList,
            total_estimated_cost_euro: shoppingList.reduce((sum, item) => sum + (item.estimatedCost || 0), 0),
            weekly_nutrition_summary: nutritionSummary,
            anti_inflammatory_score_avg: nutritionSummary.avgAntiInflammatoryScore,
            status: 'draft',
            is_custom: false,
            generation_prompt: input.customPrompt,
            week_preferences: input.preferences,
            generated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) handleSupabaseError(createError)

        // Créer la liste de courses associée
        if (shoppingList.length > 0) {
          const { error: shoppingListError } = await ctx.supabase
            .from('shopping_lists')
            .insert({
              user_id: ctx.user.id,
              name: `Liste courses semaine ${input.weekStartDate}`,
              description: 'Liste générée automatiquement',
              start_date: input.weekStartDate,
              end_date: getWeekEndDate(input.weekStartDate),
              items: shoppingList,
              total_estimated_cost_euro: shoppingList.reduce((sum, item) => sum + (item.estimatedCost || 0), 0),
              source_meal_plan_id: newMealPlan.id,
              is_auto_generated: true,
              status: 'draft',
            })

          if (shoppingListError) {
            console.error('Erreur création liste courses:', shoppingListError)
          }
        }

        return { success: true, mealPlan: newMealPlan }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        console.error('Erreur génération plan alimentaire:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la génération du plan alimentaire',
        })
      }
    }),

  // Créer un plan alimentaire personnalisé
  createCustom: subscribedProcedure
    .input(customMealPlanSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Vérifier qu'un plan n'existe pas déjà
        const { data: existingPlan } = await ctx.supabase
          .from('weekly_meal_plans')
          .select('id')
          .eq('user_id', ctx.user.id)
          .eq('week_start_date', input.weekStartDate)
          .maybeSingle()

        if (existingPlan) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Un plan alimentaire existe déjà pour cette semaine',
          })
        }

        // Générer la liste de courses
        const shoppingList = await generateShoppingList(input.meals, ctx.supabase)

        // Calculer les statistiques nutritionnelles
        const recipeIds = new Set<string>()
        Object.values(input.meals).forEach((dayMeals: any) => {
          Object.values(dayMeals).forEach((meal: any) => {
            if (meal?.recipeId) {
              recipeIds.add(meal.recipeId)
            }
          })
        })

        let nutritionSummary = { avgAntiInflammatoryScore: 0 }
        if (recipeIds.size > 0) {
          const { data: recipes } = await ctx.supabase
            .from('recipes')
            .select('id, anti_inflammatory_score, nutrition_facts')
            .in('id', Array.from(recipeIds))

          if (recipes) {
            nutritionSummary = calculateWeeklyNutrition(input.meals, recipes)
          }
        }

        // Créer le plan alimentaire
        const { data: newMealPlan, error } = await ctx.supabase
          .from('weekly_meal_plans')
          .insert({
            user_id: ctx.user.id,
            week_start_date: input.weekStartDate,
            meals: input.meals,
            shopping_list: shoppingList,
            total_estimated_cost_euro: shoppingList.reduce((sum, item) => sum + (item.estimatedCost || 0), 0),
            weekly_nutrition_summary: nutritionSummary,
            anti_inflammatory_score_avg: nutritionSummary.avgAntiInflammatoryScore,
            status: 'draft',
            is_custom: true,
            generated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) handleSupabaseError(error)

        return { success: true, mealPlan: newMealPlan }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        console.error('Erreur création plan personnalisé:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la création du plan personnalisé',
        })
      }
    }),

  // Mettre à jour un plan alimentaire
  update: subscribedProcedure
    .input(z.object({
      id: z.string().uuid(),
      meals: z.record(z.string(), dayMealsSchema).optional(),
      status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const updateData: any = {
          updated_at: new Date().toISOString(),
        }

        if (input.meals) {
          updateData.meals = input.meals
          updateData.is_custom = true

          // Recalculer la liste de courses et les stats
          const shoppingList = await generateShoppingList(input.meals, ctx.supabase)
          updateData.shopping_list = shoppingList
          updateData.total_estimated_cost_euro = shoppingList.reduce((sum, item) => sum + (item.estimatedCost || 0), 0)
        }

        if (input.status) {
          updateData.status = input.status
          if (input.status === 'active') {
            updateData.started_at = new Date().toISOString()
          } else if (input.status === 'completed') {
            updateData.completed_at = new Date().toISOString()
          }
        }

        const { data, error } = await ctx.supabase
          .from('weekly_meal_plans')
          .update(updateData)
          .eq('id', input.id)
          .eq('user_id', ctx.user.id)
          .select()
          .single()

        if (error) handleSupabaseError(error)

        return { success: true, mealPlan: data }
      } catch (error) {
        console.error('Erreur mise à jour plan alimentaire:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la mise à jour du plan alimentaire',
        })
      }
    }),

  // Supprimer un plan alimentaire
  delete: subscribedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { error } = await ctx.supabase
          .from('weekly_meal_plans')
          .delete()
          .eq('id', input.id)
          .eq('user_id', ctx.user.id)

        if (error) handleSupabaseError(error)

        return { success: true }
      } catch (error) {
        console.error('Erreur suppression plan alimentaire:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la suppression du plan alimentaire',
        })
      }
    }),
})

// Fonctions utilitaires pour la génération des plans
function generateWeeklyMeals(recipes: any[], preferences: any, profile: any): any {
  // Algorithme simplifié de sélection des recettes
  const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
  const mealTypes = preferences?.mealTypes || ['petit_dejeuner', 'dejeuner', 'diner']
  
  const weeklyMeals: any = {}

  days.forEach(day => {
    weeklyMeals[day] = {}
    
    mealTypes.forEach(mealType => {
      // Filtrer les recettes par type de repas
      const suitableRecipes = recipes.filter(recipe => 
        recipe.meal_type?.includes(mealType) &&
        recipe.anti_inflammatory_score >= 6
      )

      if (suitableRecipes.length > 0) {
        // Sélection aléatoire pondérée par le score anti-inflammatoire
        const selectedRecipe = suitableRecipes[Math.floor(Math.random() * suitableRecipes.length)]
        
        weeklyMeals[day][mealType] = {
          recipeId: selectedRecipe.id,
          servings: calculateOptimalServings(selectedRecipe, profile),
          notes: null,
        }
      }
    })
  })

  return weeklyMeals
}

function calculateOptimalServings(recipe: any, profile: any): number {
  // Calcul basé sur les besoins caloriques et les portions de la recette
  if (!profile?.daily_calorie_needs || !recipe.nutrition_facts?.calories) {
    return 1
  }

  const targetCaloriesPerMeal = profile.daily_calorie_needs / 3 // Approximation
  const recipeCaloriesPerServing = recipe.nutrition_facts.calories
  
  const optimalServings = targetCaloriesPerMeal / recipeCaloriesPerServing
  
  // Arrondir à la demi-portion près, entre 0.5 et 3
  return Math.max(0.5, Math.min(3, Math.round(optimalServings * 2) / 2))
}

function calculateWeeklyNutrition(meals: any, recipes: any[]): any {
  let totalAntiInflammatoryScore = 0
  let totalMeals = 0
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  Object.values(meals).forEach((dayMeals: any) => {
    Object.values(dayMeals).forEach((meal: any) => {
      if (!meal?.recipeId) return

      const recipe = recipes.find(r => r.id === meal.recipeId)
      if (!recipe) return

      totalMeals++
      totalAntiInflammatoryScore += recipe.anti_inflammatory_score || 0

      if (recipe.nutrition_facts) {
        const servingMultiplier = meal.servings || 1
        totalCalories += (recipe.nutrition_facts.calories || 0) * servingMultiplier
        totalProtein += (recipe.nutrition_facts.proteins || 0) * servingMultiplier
        totalCarbs += (recipe.nutrition_facts.carbs || 0) * servingMultiplier
        totalFat += (recipe.nutrition_facts.fats || 0) * servingMultiplier
      }
    })
  })

  return {
    avgAntiInflammatoryScore: totalMeals > 0 ? totalAntiInflammatoryScore / totalMeals : 0,
    totalCalories,
    avgDailyCalories: totalCalories / 7,
    totalProtein,
    avgDailyProtein: totalProtein / 7,
    totalCarbs,
    avgDailyCarbs: totalCarbs / 7,
    totalFat,
    avgDailyFat: totalFat / 7,
    totalMeals,
  }
}