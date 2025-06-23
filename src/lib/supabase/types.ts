/**
 * COACH NUTRITIONNEL IA - TYPES SUPABASE 2025
 * ==========================================
 * Types TypeScript générés automatiquement depuis le schéma PostgreSQL
 * Utilisez `supabase gen types typescript` pour regenerer
 */

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      recipes: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          ingredients: Json
          instructions: string[]
          tips: string[] | null
          nutrition_facts: Json | null
          anti_inflammatory_score: number | null
          inflammatory_ingredients: string[] | null
          anti_inflammatory_ingredients: string[] | null
          servings: number | null
          prep_time_minutes: number | null
          cook_time_minutes: number | null
          total_time_minutes: number | null
          difficulty_level: string | null
          meal_type: string[] | null
          diet_tags: string[] | null
          season: string[] | null
          cost_per_serving_euro: number | null
          cost_category: string | null
          image_url: string | null
          images_urls: string[] | null
          video_url: string | null
          source: string | null
          author: string | null
          is_featured: boolean | null
          is_published: boolean | null
          view_count: number | null
          like_count: number | null
          rating_avg: number | null
          rating_count: number | null
          created_at: string | null
          updated_at: string | null
          published_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          ingredients: Json
          instructions: string[]
          tips?: string[] | null
          nutrition_facts?: Json | null
          anti_inflammatory_score?: number | null
          inflammatory_ingredients?: string[] | null
          anti_inflammatory_ingredients?: string[] | null
          servings?: number | null
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          difficulty_level?: string | null
          meal_type?: string[] | null
          diet_tags?: string[] | null
          season?: string[] | null
          cost_per_serving_euro?: number | null
          cost_category?: string | null
          image_url?: string | null
          images_urls?: string[] | null
          video_url?: string | null
          source?: string | null
          author?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          view_count?: number | null
          like_count?: number | null
          rating_avg?: number | null
          rating_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          published_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          ingredients?: Json
          instructions?: string[]
          tips?: string[] | null
          nutrition_facts?: Json | null
          anti_inflammatory_score?: number | null
          inflammatory_ingredients?: string[] | null
          anti_inflammatory_ingredients?: string[] | null
          servings?: number | null
          prep_time_minutes?: number | null
          cook_time_minutes?: number | null
          difficulty_level?: string | null
          meal_type?: string[] | null
          diet_tags?: string[] | null
          season?: string[] | null
          cost_per_serving_euro?: number | null
          cost_category?: string | null
          image_url?: string | null
          images_urls?: string[] | null
          video_url?: string | null
          source?: string | null
          author?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          view_count?: number | null
          like_count?: number | null
          rating_avg?: number | null
          rating_count?: number | null
          created_at?: string | null
          updated_at?: string | null
          published_at?: string | null
        }
        Relationships: []
      }
      shopping_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          start_date: string | null
          end_date: string | null
          items: Json
          total_estimated_cost_euro: number | null
          actual_cost_euro: number | null
          status: string | null
          completion_percentage: number | null
          source_meal_plan_id: string | null
          is_auto_generated: boolean | null
          created_at: string | null
          updated_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          items: Json
          total_estimated_cost_euro?: number | null
          actual_cost_euro?: number | null
          status?: string | null
          completion_percentage?: number | null
          source_meal_plan_id?: string | null
          is_auto_generated?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          items?: Json
          total_estimated_cost_euro?: number | null
          actual_cost_euro?: number | null
          status?: string | null
          completion_percentage?: number | null
          source_meal_plan_id?: string | null
          is_auto_generated?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_source_meal_plan_id_fkey"
            columns: ["source_meal_plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          status: string
          current_period_start: string
          current_period_end: string
          trial_start: string | null
          trial_end: string | null
          cancel_at_period_end: boolean | null
          cancel_at: string | null
          canceled_at: string | null
          cancellation_reason: string | null
          amount_euro: number
          currency: string | null
          interval_type: string | null
          metadata: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id: string
          stripe_subscription_id: string
          stripe_price_id: string
          status: string
          current_period_start: string
          current_period_end: string
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean | null
          cancel_at?: string | null
          canceled_at?: string | null
          cancellation_reason?: string | null
          amount_euro?: number
          currency?: string | null
          interval_type?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          stripe_price_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          trial_start?: string | null
          trial_end?: string | null
          cancel_at_period_end?: boolean | null
          cancel_at?: string | null
          canceled_at?: string | null
          cancellation_reason?: string | null
          amount_euro?: number
          currency?: string | null
          interval_type?: string | null
          metadata?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_action_rates: {
        Row: {
          id: string
          user_id: string
          action_type: string
          action_count: number | null
          window_start: string | null
        }
        Insert: {
          id?: string
          user_id: string
          action_type: string
          action_count?: number | null
          window_start?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          action_type?: string
          action_count?: number | null
          window_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_action_rates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          favorite_cuisines: string[] | null
          disliked_ingredients: string[] | null
          preferred_cooking_methods: string[] | null
          meal_times: Json | null
          prep_day_preferences: string[] | null
          preferred_macros_ratio: Json | null
          calorie_distribution: Json | null
          notification_preferences: Json | null
          communication_frequency: string | null
          preferred_language: string | null
          ai_personalization_data: Json | null
          learning_preferences: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          favorite_cuisines?: string[] | null
          disliked_ingredients?: string[] | null
          preferred_cooking_methods?: string[] | null
          meal_times?: Json | null
          prep_day_preferences?: string[] | null
          preferred_macros_ratio?: Json | null
          calorie_distribution?: Json | null
          notification_preferences?: Json | null
          communication_frequency?: string | null
          preferred_language?: string | null
          ai_personalization_data?: Json | null
          learning_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          favorite_cuisines?: string[] | null
          disliked_ingredients?: string[] | null
          preferred_cooking_methods?: string[] | null
          meal_times?: Json | null
          prep_day_preferences?: string[] | null
          preferred_macros_ratio?: Json | null
          calorie_distribution?: Json | null
          notification_preferences?: Json | null
          communication_frequency?: string | null
          preferred_language?: string | null
          ai_personalization_data?: Json | null
          learning_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          birth_date: string | null
          gender: string | null
          weight_kg: number | null
          height_cm: number | null
          body_fat_percentage: number | null
          activity_level: string | null
          exercise_frequency_per_week: number | null
          health_goals: string[] | null
          target_weight_kg: number | null
          weight_goal_timeline: string | null
          food_restrictions: string[] | null
          allergies: string[] | null
          medical_conditions: string[] | null
          medications: string[] | null
          preferred_meal_times: string[] | null
          cooking_skill_level: string | null
          meal_prep_time_available: number | null
          budget_per_week_euro: number | null
          bmr_calories: number | null
          daily_calorie_needs: number | null
          protein_needs_g: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          birth_date?: string | null
          gender?: string | null
          weight_kg?: number | null
          height_cm?: number | null
          body_fat_percentage?: number | null
          activity_level?: string | null
          exercise_frequency_per_week?: number | null
          health_goals?: string[] | null
          target_weight_kg?: number | null
          weight_goal_timeline?: string | null
          food_restrictions?: string[] | null
          allergies?: string[] | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          preferred_meal_times?: string[] | null
          cooking_skill_level?: string | null
          meal_prep_time_available?: number | null
          budget_per_week_euro?: number | null
          bmr_calories?: number | null
          daily_calorie_needs?: number | null
          protein_needs_g?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          birth_date?: string | null
          gender?: string | null
          weight_kg?: number | null
          height_cm?: number | null
          body_fat_percentage?: number | null
          activity_level?: string | null
          exercise_frequency_per_week?: number | null
          health_goals?: string[] | null
          target_weight_kg?: number | null
          weight_goal_timeline?: string | null
          food_restrictions?: string[] | null
          allergies?: string[] | null
          medical_conditions?: string[] | null
          medications?: string[] | null
          preferred_meal_times?: string[] | null
          cooking_skill_level?: string | null
          meal_prep_time_available?: number | null
          budget_per_week_euro?: number | null
          bmr_calories?: number | null
          daily_calorie_needs?: number | null
          protein_needs_g?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          recorded_date: string
          weight_kg: number | null
          body_fat_percentage: number | null
          muscle_mass_kg: number | null
          waist_circumference_cm: number | null
          energy_level: number | null
          sleep_quality: number | null
          mood_score: number | null
          inflammation_feeling: number | null
          meals_followed_percentage: number | null
          notes: string | null
          progress_photos_urls: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          recorded_date: string
          weight_kg?: number | null
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          waist_circumference_cm?: number | null
          energy_level?: number | null
          sleep_quality?: number | null
          mood_score?: number | null
          inflammation_feeling?: number | null
          meals_followed_percentage?: number | null
          notes?: string | null
          progress_photos_urls?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          recorded_date?: string
          weight_kg?: number | null
          body_fat_percentage?: number | null
          muscle_mass_kg?: number | null
          waist_circumference_cm?: number | null
          energy_level?: number | null
          sleep_quality?: number | null
          mood_score?: number | null
          inflammation_feeling?: number | null
          meals_followed_percentage?: number | null
          notes?: string | null
          progress_photos_urls?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_recipe_interactions: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          is_liked: boolean | null
          is_saved: boolean | null
          is_cooked: boolean | null
          rating: number | null
          review_text: string | null
          personal_notes: string | null
          ingredient_modifications: Json | null
          first_viewed_at: string | null
          last_viewed_at: string | null
          cooked_count: number | null
          times_cooked: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          is_liked?: boolean | null
          is_saved?: boolean | null
          is_cooked?: boolean | null
          rating?: number | null
          review_text?: string | null
          personal_notes?: string | null
          ingredient_modifications?: Json | null
          first_viewed_at?: string | null
          last_viewed_at?: string | null
          cooked_count?: number | null
          times_cooked?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          is_liked?: boolean | null
          is_saved?: boolean | null
          is_cooked?: boolean | null
          rating?: number | null
          review_text?: string | null
          personal_notes?: string | null
          ingredient_modifications?: Json | null
          first_viewed_at?: string | null
          last_viewed_at?: string | null
          cooked_count?: number | null
          times_cooked?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_recipe_interactions_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recipe_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          email_verified_at: string | null
          phone_verified_at: string | null
          created_at: string | null
          updated_at: string | null
          last_login_at: string | null
          is_active: boolean | null
          metadata: Json | null
        }
        Insert: {
          id: string
          email: string
          phone?: string | null
          email_verified_at?: string | null
          phone_verified_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_login_at?: string | null
          is_active?: boolean | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          email_verified_at?: string | null
          phone_verified_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          last_login_at?: string | null
          is_active?: boolean | null
          metadata?: Json | null
        }
        Relationships: []
      }
      weekly_meal_plans: {
        Row: {
          id: string
          user_id: string
          week_start_date: string
          week_end_date: string | null
          meals: Json
          shopping_list: Json | null
          total_estimated_cost_euro: number | null
          weekly_nutrition_summary: Json | null
          anti_inflammatory_score_avg: number | null
          status: string | null
          is_custom: boolean | null
          generation_prompt: string | null
          week_preferences: Json | null
          created_at: string | null
          updated_at: string | null
          generated_at: string | null
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          week_start_date: string
          meals: Json
          shopping_list?: Json | null
          total_estimated_cost_euro?: number | null
          weekly_nutrition_summary?: Json | null
          anti_inflammatory_score_avg?: number | null
          status?: string | null
          is_custom?: boolean | null
          generation_prompt?: string | null
          week_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
          generated_at?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          week_start_date?: string
          meals?: Json
          shopping_list?: Json | null
          total_estimated_cost_euro?: number | null
          weekly_nutrition_summary?: Json | null
          anti_inflammatory_score_avg?: number | null
          status?: string | null
          is_custom?: boolean | null
          generation_prompt?: string | null
          week_preferences?: Json | null
          created_at?: string | null
          updated_at?: string | null
          generated_at?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_meal_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      active_subscribers: {
        Row: {
          id: string | null
          email: string | null
          created_at: string | null
          subscription_status: string | null
          current_period_end: string | null
          amount_euro: number | null
        }
        Relationships: []
      }
      recipe_stats: {
        Row: {
          id: string | null
          name: string | null
          anti_inflammatory_score: number | null
          difficulty_level: string | null
          total_time_minutes: number | null
          interaction_count: number | null
          like_count: number | null
          cooked_count: number | null
          avg_rating: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_age: {
        Args: {
          birth_date: string
        }
        Returns: number
      }
      calculate_bmr: {
        Args: {
          weight_kg: number
          height_cm: number
          age_years: number
          gender: string
        }
        Returns: number
      }
      calculate_daily_calories: {
        Args: {
          bmr: number
          activity_level: string
        }
        Returns: number
      }
      can_access_premium_features: {
        Args: {
          user_uuid?: string
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_action_type: string
          p_max_actions: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      create_audit_log: {
        Args: {
          p_action: string
          p_table_name: string
          p_record_id: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: undefined
      }
      has_active_subscription: {
        Args: {
          user_uuid?: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Aliases pour faciliter l'utilisation
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Types utilitaires pour l'application
export type User = Tables<'users'>
export type UserProfile = Tables<'user_profiles'>
export type Recipe = Tables<'recipes'>
export type WeeklyMealPlan = Tables<'weekly_meal_plans'>
export type Subscription = Tables<'subscriptions'>
export type UserRecipeInteraction = Tables<'user_recipe_interactions'>
export type UserProgress = Tables<'user_progress'>
export type ShoppingList = Tables<'shopping_lists'>
export type UserPreferences = Tables<'user_preferences'>

// Types pour les insertions
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
export type WeeklyMealPlanInsert = Database['public']['Tables']['weekly_meal_plans']['Insert']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']

// Types pour les mises à jour
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
export type RecipeUpdate = Database['public']['Tables']['recipes']['Update']
export type WeeklyMealPlanUpdate = Database['public']['Tables']['weekly_meal_plans']['Update']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

// Types pour les vues
export type ActiveSubscriber = Database['public']['Views']['active_subscribers']['Row']
export type RecipeStats = Database['public']['Views']['recipe_stats']['Row']

// Types pour les fonctions
export type SupabaseFunctions = Database['public']['Functions']

// Types personnalisés pour l'application
export interface RecipeWithInteractions extends Recipe {
  user_recipe_interactions?: UserRecipeInteraction[]
  interaction_summary?: {
    is_liked: boolean
    is_saved: boolean
    is_cooked: boolean
    user_rating?: number
  }
}

export interface UserWithProfile extends User {
  user_profiles?: UserProfile
  user_preferences?: UserPreferences
  subscriptions?: Subscription[]
}

export interface WeeklyMealPlanWithDetails extends WeeklyMealPlan {
  recipes?: Recipe[]
  shopping_list_items?: Json[]
}

// Types pour les requêtes complexes
export interface UserDashboardData {
  user: UserWithProfile
  currentMealPlan?: WeeklyMealPlanWithDetails
  recentRecipes: Recipe[]
  favoriteRecipes: RecipeWithInteractions[]
  userStats: {
    recipesLiked: number
    recipesSaved: number
    recipesCooked: number
    mealPlansCreated: number
    avgAntiInflammatoryScore: number
  }
}

// Types pour l'API
export interface ApiResponse<T = any> {
  data: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Types pour les filtres de recherche
export interface RecipeFilters {
  search?: string
  difficulty?: string
  maxTime?: number
  season?: string
  mealType?: string[]
  dietTags?: string[]
  minAntiInflammatoryScore?: number
  maxCostPerServing?: number
}

// Types pour l'authentification
export interface AuthUser extends User {
  hasActiveSubscription: boolean
  subscriptionStatus?: string
  isAdmin: boolean
  profile?: UserProfile
  preferences?: UserPreferences
}