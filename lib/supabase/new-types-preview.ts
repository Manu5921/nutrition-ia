/**
 * PREVIEW DES NOUVEAUX TYPES TYPESCRIPT
 * ====================================
 * Aperçu des types qui seront générés après la migration 008
 * Exécutez `supabase gen types typescript --local` pour les types complets
 */

// =====================================================
// NOUVELLES TABLES AJOUTÉES PAR AGENT DATABASE/SCHEMA
// =====================================================

export interface AuditLog {
  id: string
  user_id: string | null
  action: string // 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT', etc.
  table_name: string
  record_id: string | null
  old_values: Json | null
  new_values: Json | null
  ip_address: string | null
  user_agent: string | null
  session_id: string | null
  api_endpoint: string | null
  request_method: string | null
  request_headers: Json | null
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'auth' | 'data' | 'security' | 'subscription' | 'admin'
  created_at: string
}

export interface UserActionRate {
  id: string
  user_id: string
  action_type: string // 'recipe_view' | 'meal_plan_generation' | 'api_call', etc.
  action_count: number
  window_start: string
  rate_limit_per_hour: number | null
  rate_limit_per_day: number | null
  last_action_at: string
  metadata: Json
  created_at: string
  updated_at: string
}

export interface Food {
  id: string
  name_fr: string
  name_scientific: string | null
  common_names: string[] | null
  category: string // 'legume' | 'fruit' | 'proteine' | 'cereale', etc.
  subcategory: string | null
  food_group: string | null
  ciqual_code: string | null
  usda_code: string | null
  season_availability: string[] | null // ['printemps', 'ete', 'automne', 'hiver']
  geographical_origin: string[] | null
  nutrition_per_100g: Json // Valeurs nutritionnelles complètes
  anti_inflammatory_score: number | null // 1-10
  glycemic_index: number | null // 0-100
  glycemic_load: number | null
  anti_inflammatory_compounds: string[] | null
  inflammatory_potential: 'anti_inflammatoire' | 'neutre' | 'pro_inflammatoire' | null
  allergens: string[] | null
  diet_compatibility: string[] | null
  storage_instructions: string | null
  preparation_tips: string[] | null
  cooking_methods: string[] | null
  average_price_per_kg: number | null
  price_category: 'economique' | 'moyen' | 'premium' | null
  carbon_footprint_kg_co2_per_kg: number | null
  sustainability_score: number | null // 1-10
  image_url: string | null
  source_references: string[] | null
  is_verified: boolean
  verification_date: string | null
  last_nutrition_update: string | null
  created_at: string
  updated_at: string
}

export interface FoodCombination {
  id: string
  food_1_id: string
  food_2_id: string
  combination_type: 'synergique' | 'complementaire' | 'antagoniste' | 'neutre'
  nutritional_benefits: string[] | null
  absorption_enhancement: string | null
  synergy_score: number // 1-10
  scientific_explanation: string | null
  references: string[] | null
  created_at: string
  updated_at: string
}

export interface NutritionGoal {
  id: string
  user_id: string
  daily_calories_target: number | null
  daily_calories_min: number | null
  daily_calories_max: number | null
  protein_target_g: number | null
  carbs_target_g: number | null
  fat_target_g: number | null
  fiber_target_g: number | null
  vitamin_c_target_mg: number | null
  vitamin_d_target_ug: number | null
  calcium_target_mg: number | null
  iron_target_mg: number | null
  omega3_target_g: number | null
  anti_inflammatory_foods_per_day: number
  max_processed_foods_per_week: number
  sodium_limit_mg: number | null
  sugar_limit_g: number | null
  saturated_fat_limit_g: number | null
  breakfast_calorie_percentage: number
  lunch_calorie_percentage: number
  dinner_calorie_percentage: number
  snacks_calorie_percentage: number
  valid_from: string
  valid_until: string | null
  goal_reason: string | null
  medical_conditions: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DailyNutritionTracking {
  id: string
  user_id: string
  tracking_date: string
  consumed_nutrition: Json
  daily_targets: Json
  calories_consumed: number
  calories_remaining: number // GENERATED COLUMN
  protein_goal_percentage: number | null
  carbs_goal_percentage: number | null
  fat_goal_percentage: number | null
  fiber_goal_percentage: number | null
  daily_anti_inflammatory_score: number | null
  nutrition_quality_score: number | null
  diet_adherence_score: number | null
  meals_consumed: Json // Array of meals
  daily_notes: string | null
  energy_level: number | null // 1-10
  hunger_satisfaction: number | null // 1-10
  last_updated: string
  data_source: string // 'manual' | 'meal_plan' | 'imported'
  created_at: string
  updated_at: string
}

export interface MealNutritionAnalysis {
  id: string
  user_id: string
  meal_source: Json // {type, source_id, meal_data}
  nutrition_summary: Json
  anti_inflammatory_score: number | null
  nutritional_completeness_score: number | null
  diet_compliance_score: number | null
  improvement_suggestions: Json | null
  missing_nutrients: string[] | null
  excess_nutrients: string[] | null
  macros_analysis: Json | null
  micros_analysis: Json | null
  analysis_date: string
  analysis_version: string
  created_at: string
  updated_at: string
}

// =====================================================
// NOUVELLES VUES AJOUTÉES
// =====================================================

export interface AuditStatistics {
  table_name: string | null
  action: string | null
  category: string | null
  action_count: number | null
  unique_users: number | null
  first_action: string | null
  last_action: string | null
}

export interface UserActivitySummary {
  email: string | null
  user_id: string | null
  total_actions: number | null
  tables_accessed: number | null
  last_activity: string | null
  actions_performed: string[] | null
}

// =====================================================
// NOUVELLES FONCTIONS DISPONIBLES
// =====================================================

export interface DatabaseFunctions {
  // Fonctions d'audit et sécurité
  create_audit_log: (
    action: string,
    table_name: string,
    record_id: string,
    old_values?: Json,
    new_values?: Json
  ) => void

  check_rate_limit: (
    action_type: string,
    max_actions: number,
    window_minutes?: number
  ) => boolean

  // Fonctions de maintenance
  cleanup_old_audit_logs: (days_to_keep?: number) => number
  cleanup_old_rate_limits: (hours_to_keep?: number) => number

  // Fonctions nutritionnelles avancées
  calculate_meal_anti_inflammatory_score: (
    recipe_ids: string[],
    portions?: number[]
  ) => number

  calculate_diet_compatibility_score: (
    recipe_id: string,
    user_id: string
  ) => number

  // Fonctions de calcul existantes étendues
  calculate_bmr: (
    weight_kg: number,
    height_cm: number,
    age_years: number,
    gender: string
  ) => number

  calculate_daily_calories: (
    bmr: number,
    activity_level: string
  ) => number

  calculate_age: (birth_date: string) => number

  // Fonctions de vérification d'abonnement
  has_active_subscription: (user_uuid?: string) => boolean
  can_access_premium_features: (user_uuid?: string) => boolean
}

// =====================================================
// TYPES UTILITAIRES ÉTENDUS
// =====================================================

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'AUTH_FAILED' | 'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_CANCELLED'
export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AuditCategory = 'auth' | 'data' | 'security' | 'subscription' | 'admin'

export type FoodCategory = 'legume' | 'fruit' | 'proteine' | 'cereale' | 'lactaire' | 'matiere_grasse' | 'epice' | 'boisson'
export type Season = 'printemps' | 'ete' | 'automne' | 'hiver'
export type InflammatoryPotential = 'anti_inflammatoire' | 'neutre' | 'pro_inflammatoire'
export type CombinationType = 'synergique' | 'complementaire' | 'antagoniste' | 'neutre'

export type RateLimitAction = 'recipe_view' | 'meal_plan_generation' | 'api_call' | 'search_request' | 'recommendation_request'

// Interface pour les requêtes complexes avec les nouvelles tables
export interface ExtendedUserDashboardData {
  user: UserWithProfile
  currentMealPlan?: WeeklyMealPlanWithDetails
  recentRecipes: Recipe[]
  favoriteRecipes: RecipeWithInteractions[]
  currentNutritionGoals?: NutritionGoal
  todayNutritionTracking?: DailyNutritionTracking
  recentAuditLogs: AuditLog[]
  userStats: {
    recipesLiked: number
    recipesSaved: number
    recipesCooked: number
    mealPlansCreated: number
    avgAntiInflammatoryScore: number
    nutritionGoalsAchieved: number
    daysTracked: number
  }
}