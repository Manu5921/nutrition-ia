/**
 * COACH NUTRITIONNEL IA - TRPC USER ROUTER 2025
 * ==============================================
 * API tRPC pour la gestion des utilisateurs, profils et préférences
 * Validation Zod + RLS Supabase + calculs métaboliques
 */

import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { 
  createTRPCRouter, 
  publicProcedure, 
  protectedProcedure, 
  handleSupabaseError,
  auditLog,
  trackServerQuery
} from '../server'

// Schémas Zod pour validation des profils utilisateur
const userProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  birthDate: z.string().date().optional(),
  gender: z.enum(['homme', 'femme', 'autre', 'non_specifie']).optional(),
  weightKg: z.number().min(30).max(300).optional(),
  heightCm: z.number().min(100).max(250).optional(),
  bodyFatPercentage: z.number().min(5).max(50).optional(),
  activityLevel: z.enum(['sedentaire', 'leger', 'modere', 'intense', 'tres_intense']).optional(),
  exerciseFrequencyPerWeek: z.number().min(0).max(14).optional(),
  healthGoals: z.array(z.string()).optional(),
  targetWeightKg: z.number().min(30).max(300).optional(),
  weightGoalTimeline: z.enum(['1_mois', '3_mois', '6_mois', '1_an', 'plus_1_an']).optional(),
  foodRestrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medicalConditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  preferredMealTimes: z.array(z.string()).optional(),
  cookingSkillLevel: z.enum(['debutant', 'intermediaire', 'avance']).optional(),
  mealPrepTimeAvailable: z.number().min(10).max(480).optional(),
  budgetPerWeekEuro: z.number().min(10).max(500).optional(),
})

const userPreferencesSchema = z.object({
  favoriteCuisines: z.array(z.string()).optional(),
  dislikedIngredients: z.array(z.string()).optional(),
  preferredCookingMethods: z.array(z.string()).optional(),
  mealTimes: z.record(z.string()).optional(),
  prepDayPreferences: z.array(z.string()).optional(),
  preferredMacrosRatio: z.object({
    protein: z.number().min(10).max(40),
    carbs: z.number().min(20).max(70),
    fat: z.number().min(15).max(40),
  }).optional(),
  calorieDistribution: z.object({
    petit_dejeuner: z.number().min(15).max(35),
    dejeuner: z.number().min(25).max(45),
    diner: z.number().min(20).max(40),
    collations: z.number().min(5).max(20),
  }).optional(),
  notificationPreferences: z.object({
    meal_reminders: z.boolean(),
    shopping_list: z.boolean(),
    new_recipes: z.boolean(),
    weekly_summary: z.boolean(),
    motivation_messages: z.boolean(),
  }).optional(),
  communicationFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
})

const progressEntrySchema = z.object({
  recordedDate: z.string().date(),
  weightKg: z.number().min(30).max(300).optional(),
  bodyFatPercentage: z.number().min(5).max(50).optional(),
  muscleMassKg: z.number().min(20).max(100).optional(),
  waistCircumferenceCm: z.number().min(50).max(150).optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  sleepQuality: z.number().min(1).max(10).optional(),
  moodScore: z.number().min(1).max(10).optional(),
  inflammationFeeling: z.number().min(1).max(10).optional(),
  mealsFollowedPercentage: z.number().min(0).max(100).optional(),
  notes: z.string().max(500).optional(),
  progressPhotosUrls: z.array(z.string().url()).optional(),
})

export const userRouter = createTRPCRouter({
  // Obtenir le profil utilisateur complet
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const tracker = trackServerQuery('user.getProfile')
      
      try {
        const { data, error } = await ctx.supabase
          .from('user_profiles')
          .select(`
            *,
            user_preferences (*),
            subscriptions (*)
          `)
          .eq('user_id', ctx.user.id)
          .maybeSingle()

        if (error) handleSupabaseError(error)

        tracker.end()
        return data
      } catch (error) {
        tracker.end()
        console.error('Erreur récupération profil utilisateur:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération du profil',
        })
      }
    }),

  // Mettre à jour le profil utilisateur
  updateProfile: protectedProcedure
    .input(userProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const tracker = trackServerQuery('user.updateProfile')
      
      try {
        // Calculer les données métaboliques si nécessaire
        let calculatedData = {}
        
        if (input.weightKg && input.heightCm && input.birthDate && input.gender && input.activityLevel) {
          const birthDate = new Date(input.birthDate)
          const ageYears = new Date().getFullYear() - birthDate.getFullYear()
          
          // Appeler les fonctions PostgreSQL pour les calculs
          const { data: bmr } = await ctx.supabase.rpc('calculate_bmr', {
            weight_kg: input.weightKg,
            height_cm: input.heightCm,
            age_years: ageYears,
            gender: input.gender
          })
          
          if (bmr) {
            const { data: dailyCalories } = await ctx.supabase.rpc('calculate_daily_calories', {
              bmr: bmr,
              activity_level: input.activityLevel
            })
            
            calculatedData = {
              bmr_calories: bmr,
              daily_calorie_needs: dailyCalories,
              protein_needs_g: Math.round(input.weightKg * 1.6), // 1.6g par kg pour anti-inflammatoire
            }
          }
        }

        // Récupérer l'ancien profil pour l'audit
        const { data: oldProfile } = await ctx.supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', ctx.user.id)
          .maybeSingle()

        // Mise à jour ou création du profil
        const { data, error } = await ctx.supabase
          .from('user_profiles')
          .upsert({
            user_id: ctx.user.id,
            first_name: input.firstName,
            last_name: input.lastName,
            birth_date: input.birthDate,
            gender: input.gender,
            weight_kg: input.weightKg,
            height_cm: input.heightCm,
            body_fat_percentage: input.bodyFatPercentage,
            activity_level: input.activityLevel,
            exercise_frequency_per_week: input.exerciseFrequencyPerWeek,
            health_goals: input.healthGoals,
            target_weight_kg: input.targetWeightKg,
            weight_goal_timeline: input.weightGoalTimeline,
            food_restrictions: input.foodRestrictions,
            allergies: input.allergies,
            medical_conditions: input.medicalConditions,
            medications: input.medications,
            preferred_meal_times: input.preferredMealTimes,
            cooking_skill_level: input.cookingSkillLevel,
            meal_prep_time_available: input.mealPrepTimeAvailable,
            budget_per_week_euro: input.budgetPerWeekEuro,
            ...calculatedData,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) handleSupabaseError(error)

        // Audit log
        await auditLog(
          ctx.supabase,
          oldProfile ? 'UPDATE' : 'INSERT',
          'user_profiles',
          data.id,
          oldProfile,
          data
        )

        tracker.end()
        return { success: true, profile: data }
      } catch (error) {
        tracker.end()
        if (error instanceof TRPCError) throw error
        console.error('Erreur mise à jour profil:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la mise à jour du profil',
        })
      }
    }),

  // Mettre à jour les préférences utilisateur
  updatePreferences: protectedProcedure
    .input(userPreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      const tracker = trackServerQuery('user.updatePreferences')
      
      try {
        // Valider que les pourcentages totalisent 100%
        if (input.preferredMacrosRatio) {
          const total = input.preferredMacrosRatio.protein + 
                       input.preferredMacrosRatio.carbs + 
                       input.preferredMacrosRatio.fat
          if (Math.abs(total - 100) > 1) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Les ratios de macronutriments doivent totaliser 100%',
            })
          }
        }

        if (input.calorieDistribution) {
          const total = input.calorieDistribution.petit_dejeuner +
                       input.calorieDistribution.dejeuner +
                       input.calorieDistribution.diner +
                       input.calorieDistribution.collations
          if (Math.abs(total - 100) > 1) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'La distribution calorique doit totaliser 100%',
            })
          }
        }

        const { data, error } = await ctx.supabase
          .from('user_preferences')
          .upsert({
            user_id: ctx.user.id,
            favorite_cuisines: input.favoriteCuisines,
            disliked_ingredients: input.dislikedIngredients,
            preferred_cooking_methods: input.preferredCookingMethods,
            meal_times: input.mealTimes,
            prep_day_preferences: input.prepDayPreferences,
            preferred_macros_ratio: input.preferredMacrosRatio,
            calorie_distribution: input.calorieDistribution,
            notification_preferences: input.notificationPreferences,
            communication_frequency: input.communicationFrequency,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) handleSupabaseError(error)

        tracker.end()
        return { success: true, preferences: data }
      } catch (error) {
        tracker.end()
        if (error instanceof TRPCError) throw error
        console.error('Erreur mise à jour préférences:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la mise à jour des préférences',
        })
      }
    }),

  // Ajouter une entrée de progression
  addProgress: protectedProcedure
    .input(progressEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const tracker = trackServerQuery('user.addProgress')
      
      try {
        const { data, error } = await ctx.supabase
          .from('user_progress')
          .insert({
            user_id: ctx.user.id,
            recorded_date: input.recordedDate,
            weight_kg: input.weightKg,
            body_fat_percentage: input.bodyFatPercentage,
            muscle_mass_kg: input.muscleMassKg,
            waist_circumference_cm: input.waistCircumferenceCm,
            energy_level: input.energyLevel,
            sleep_quality: input.sleepQuality,
            mood_score: input.moodScore,
            inflammation_feeling: input.inflammationFeeling,
            meals_followed_percentage: input.mealsFollowedPercentage,
            notes: input.notes,
            progress_photos_urls: input.progressPhotosUrls,
          })
          .select()
          .single()

        if (error) handleSupabaseError(error)

        tracker.end()
        return { success: true, progress: data }
      } catch (error) {
        tracker.end()
        if (error instanceof TRPCError) throw error
        console.error('Erreur ajout progression:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de l\'ajout de la progression',
        })
      }
    }),

  // Obtenir l'historique de progression
  getProgress: protectedProcedure
    .input(z.object({
      startDate: z.string().date().optional(),
      endDate: z.string().date().optional(),
      limit: z.number().min(1).max(100).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const tracker = trackServerQuery('user.getProgress')
      
      try {
        let query = ctx.supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', ctx.user.id)
          .order('recorded_date', { ascending: false })

        if (input.startDate) {
          query = query.gte('recorded_date', input.startDate)
        }

        if (input.endDate) {
          query = query.lte('recorded_date', input.endDate)
        }

        query = query.limit(input.limit)

        const { data, error } = await query

        if (error) handleSupabaseError(error)

        tracker.end()
        return data || []
      } catch (error) {
        tracker.end()
        console.error('Erreur récupération progression:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération de la progression',
        })
      }
    }),

  // Obtenir les statistiques utilisateur
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const tracker = trackServerQuery('user.getStats')
      
      try {
        // Récupérer les interactions avec les recettes
        const { data: interactions, error: interactionsError } = await ctx.supabase
          .from('user_recipe_interactions')
          .select('is_liked, is_saved, is_cooked, rating')
          .eq('user_id', ctx.user.id)

        if (interactionsError) handleSupabaseError(interactionsError)

        // Récupérer les plans alimentaires
        const { data: mealPlans, error: mealPlansError } = await ctx.supabase
          .from('weekly_meal_plans')
          .select('anti_inflammatory_score_avg, status')
          .eq('user_id', ctx.user.id)

        if (mealPlansError) handleSupabaseError(mealPlansError)

        // Calculer les statistiques
        const stats = {
          recipesLiked: interactions?.filter(i => i.is_liked).length || 0,
          recipesSaved: interactions?.filter(i => i.is_saved).length || 0,
          recipesCooked: interactions?.filter(i => i.is_cooked).length || 0,
          mealPlansCreated: mealPlans?.length || 0,
          mealPlansCompleted: mealPlans?.filter(mp => mp.status === 'completed').length || 0,
          avgAntiInflammatoryScore: mealPlans?.reduce((acc, mp) => acc + (mp.anti_inflammatory_score_avg || 0), 0) / Math.max(mealPlans?.length || 1, 1),
          avgRecipeRating: interactions?.filter(i => i.rating).reduce((acc, i) => acc + (i.rating || 0), 0) / Math.max(interactions?.filter(i => i.rating).length || 1, 1),
        }

        tracker.end()
        return stats
      } catch (error) {
        tracker.end()
        console.error('Erreur récupération statistiques:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération des statistiques',
        })
      }
    }),

  // Obtenir le dashboard utilisateur (données agrégées)
  getDashboard: protectedProcedure
    .query(async ({ ctx }) => {
      const tracker = trackServerQuery('user.getDashboard')
      
      try {
        // Récupérer plusieurs informations en parallèle
        const [profileResult, statsResult, recentProgressResult, currentMealPlanResult] = await Promise.all([
          // Profil complet
          ctx.supabase
            .from('user_profiles')
            .select(`
              *,
              user_preferences (*),
              subscriptions (*)
            `)
            .eq('user_id', ctx.user.id)
            .maybeSingle(),

          // Statistiques
          ctx.supabase
            .from('user_recipe_interactions')
            .select('is_liked, is_saved, is_cooked')
            .eq('user_id', ctx.user.id),

          // Progression récente
          ctx.supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', ctx.user.id)
            .order('recorded_date', { ascending: false })
            .limit(7),

          // Plan alimentaire actuel
          ctx.supabase
            .from('weekly_meal_plans')
            .select('*')
            .eq('user_id', ctx.user.id)
            .eq('status', 'active')
            .gte('week_end_date', new Date().toISOString().split('T')[0])
            .maybeSingle(),
        ])

        if (profileResult.error) handleSupabaseError(profileResult.error)
        if (statsResult.error) handleSupabaseError(statsResult.error)
        if (recentProgressResult.error) handleSupabaseError(recentProgressResult.error)
        if (currentMealPlanResult.error) handleSupabaseError(currentMealPlanResult.error)

        const dashboard = {
          profile: profileResult.data,
          stats: {
            recipesLiked: statsResult.data?.filter(i => i.is_liked).length || 0,
            recipesSaved: statsResult.data?.filter(i => i.is_saved).length || 0,
            recipesCooked: statsResult.data?.filter(i => i.is_cooked).length || 0,
          },
          recentProgress: recentProgressResult.data || [],
          currentMealPlan: currentMealPlanResult.data,
          hasActiveSubscription: profileResult.data?.subscriptions?.some(
            (sub: any) => sub.status === 'active' && new Date(sub.current_period_end) > new Date()
          ) || false,
        }

        tracker.end()
        return dashboard
      } catch (error) {
        tracker.end()
        console.error('Erreur récupération dashboard:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la récupération du dashboard',
        })
      }
    }),

  // Supprimer le compte utilisateur (soft delete)
  deleteAccount: protectedProcedure
    .input(z.object({
      reason: z.string().min(5).max(500).optional(),
      confirmEmail: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tracker = trackServerQuery('user.deleteAccount')
      
      try {
        // Vérifier que l'email correspond
        if (input.confirmEmail !== ctx.user.email) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'L\'email de confirmation ne correspond pas',
          })
        }

        // Soft delete - marquer comme inactif
        const { error } = await ctx.supabase
          .from('users')
          .update({
            is_active: false,
            metadata: {
              ...ctx.user.user_metadata,
              deletion_reason: input.reason,
              deleted_at: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', ctx.user.id)

        if (error) handleSupabaseError(error)

        // Audit log
        await auditLog(
          ctx.supabase,
          'DELETE',
          'users',
          ctx.user.id,
          { is_active: true },
          { is_active: false, deletion_reason: input.reason }
        )

        tracker.end()
        return { success: true }
      } catch (error) {
        tracker.end()
        if (error instanceof TRPCError) throw error
        console.error('Erreur suppression compte:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur lors de la suppression du compte',
        })
      }
    }),
})