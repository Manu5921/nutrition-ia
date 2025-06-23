-- =====================================================
-- COACH NUTRITIONNEL IA - MIGRATION INITIALE
-- =====================================================
-- Version: 1.0
-- Date: 2025-06-23
-- Description: Création du schéma complet pour l'application de coaching nutritionnel

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Pour recherche full-text améliorée
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- Pour index composites performants

-- =====================================================
-- 1. USERS & AUTHENTICATION
-- =====================================================

-- Table des utilisateurs (integration avec Supabase Auth)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  phone text,
  email_verified_at timestamp,
  phone_verified_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  last_login_at timestamp,
  is_active boolean DEFAULT true,
  
  -- Metadata utilisateur
  metadata jsonb DEFAULT '{}'::jsonb,
  
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index pour performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- =====================================================
-- 2. USER PROFILES
-- =====================================================

-- Profils utilisateurs détaillés
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  
  -- Informations personnelles
  first_name text,
  last_name text,
  birth_date date,
  gender text CHECK (gender IN ('homme', 'femme', 'autre', 'non_specifie')),
  
  -- Données physiques
  weight_kg decimal(5,2) CHECK (weight_kg > 0 AND weight_kg <= 500),
  height_cm integer CHECK (height_cm > 0 AND height_cm <= 300),
  body_fat_percentage decimal(4,2) CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  
  -- Niveau d'activité
  activity_level text CHECK (activity_level IN ('sedentaire', 'leger', 'modere', 'intense', 'tres_intense')) DEFAULT 'modere',
  exercise_frequency_per_week integer DEFAULT 0 CHECK (exercise_frequency_per_week >= 0 AND exercise_frequency_per_week <= 14),
  
  -- Objectifs santé
  health_goals text[] DEFAULT '{}',
  target_weight_kg decimal(5,2) CHECK (target_weight_kg > 0 AND target_weight_kg <= 500),
  weight_goal_timeline text CHECK (weight_goal_timeline IN ('1_mois', '3_mois', '6_mois', '1_an', 'plus_1_an')),
  
  -- Restrictions alimentaires
  food_restrictions text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  medical_conditions text[] DEFAULT '{}',
  medications text[] DEFAULT '{}',
  
  -- Préférences alimentaires
  preferred_meal_times text[] DEFAULT '{}',
  cooking_skill_level text CHECK (cooking_skill_level IN ('debutant', 'intermediaire', 'avance')) DEFAULT 'intermediaire',
  meal_prep_time_available integer DEFAULT 30 CHECK (meal_prep_time_available >= 0 AND meal_prep_time_available <= 480),
  budget_per_week_euro decimal(6,2) CHECK (budget_per_week_euro >= 0),
  
  -- Données calculées
  bmr_calories integer, -- Métabolisme de base
  daily_calorie_needs integer, -- Besoins caloriques journaliers
  protein_needs_g integer, -- Besoins en protéines
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Index pour performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_activity_level ON user_profiles(activity_level);
CREATE INDEX idx_user_profiles_health_goals ON user_profiles USING GIN(health_goals);

-- =====================================================
-- 3. RECIPES - RECETTES ANTI-INFLAMMATOIRE
-- =====================================================

CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informations de base
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  
  -- Contenu recette
  ingredients jsonb NOT NULL, -- [{"name": "string", "quantity": "string", "unit": "string", "notes": "string"}]
  instructions text[] NOT NULL,
  tips text[],
  
  -- Données nutritionnelles (pour 100g)
  nutrition_facts jsonb DEFAULT '{}'::jsonb, -- {"calories": 0, "proteins": 0, "carbs": 0, "fats": 0, "fiber": 0, "sugar": 0, "sodium": 0}
  
  -- Score anti-inflammatoire (1-10, 10 = très anti-inflammatoire)
  anti_inflammatory_score integer CHECK (anti_inflammatory_score >= 1 AND anti_inflammatory_score <= 10),
  inflammatory_ingredients text[], -- Ingrédients potentiellement inflammatoires
  anti_inflammatory_ingredients text[], -- Ingrédients anti-inflammatoires
  
  -- Informations pratiques
  servings integer DEFAULT 1 CHECK (servings > 0),
  prep_time_minutes integer CHECK (prep_time_minutes >= 0),
  cook_time_minutes integer CHECK (cook_time_minutes >= 0),
  total_time_minutes integer GENERATED ALWAYS AS (prep_time_minutes + cook_time_minutes) STORED,
  
  -- Classification
  difficulty_level text CHECK (difficulty_level IN ('facile', 'moyen', 'difficile')) DEFAULT 'moyen',
  meal_type text[] DEFAULT '{}', -- ['petit_dejeuner', 'dejeuner', 'diner', 'collation']
  diet_tags text[] DEFAULT '{}', -- ['vegetarien', 'vegan', 'sans_gluten', 'cetogene', 'paleo']
  season text[] DEFAULT '{}', -- ['printemps', 'ete', 'automne', 'hiver']
  
  -- Coût approximatif
  cost_per_serving_euro decimal(4,2),
  cost_category text CHECK (cost_category IN ('economique', 'moyen', 'premium')),
  
  -- Images et média
  image_url text,
  images_urls text[],
  video_url text,
  
  -- Métadonnées
  source text, -- Source de la recette
  author text,
  is_featured boolean DEFAULT false,
  is_published boolean DEFAULT true,
  
  -- Statistiques
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  rating_avg decimal(3,2) DEFAULT 0.0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  rating_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  published_at timestamp
);

-- Index pour performance et recherche
CREATE INDEX idx_recipes_slug ON recipes(slug);
CREATE INDEX idx_recipes_anti_inflammatory_score ON recipes(anti_inflammatory_score);
CREATE INDEX idx_recipes_meal_type ON recipes USING GIN(meal_type);
CREATE INDEX idx_recipes_diet_tags ON recipes USING GIN(diet_tags);
CREATE INDEX idx_recipes_season ON recipes USING GIN(season);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty_level);
CREATE INDEX idx_recipes_total_time ON recipes(total_time_minutes);
CREATE INDEX idx_recipes_published ON recipes(is_published) WHERE is_published = true;
CREATE INDEX idx_recipes_featured ON recipes(is_featured) WHERE is_featured = true;
CREATE INDEX idx_recipes_rating ON recipes(rating_avg DESC);

-- Index de recherche full-text
CREATE INDEX idx_recipes_search ON recipes USING GIN(to_tsvector('french', name || ' ' || COALESCE(description, '')));

-- =====================================================
-- 4. WEEKLY MEAL PLANS - PLANS ALIMENTAIRES
-- =====================================================

CREATE TABLE weekly_meal_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  
  -- Période du plan
  week_start_date date NOT NULL,
  week_end_date date GENERATED ALWAYS AS (week_start_date + interval '6 days') STORED,
  
  -- Structure des repas (JSON structuré)
  meals jsonb NOT NULL, -- Structure: {"lundi": {"petit_dejeuner": {"recipe_id": "uuid", "servings": 2}, "dejeuner": {...}}}
  
  -- Liste de courses générée
  shopping_list jsonb, -- [{"ingredient": "string", "quantity": "string", "unit": "string", "estimated_cost": 0}]
  total_estimated_cost_euro decimal(6,2),
  
  -- Statistiques nutritionnelles de la semaine
  weekly_nutrition_summary jsonb, -- {"avg_daily_calories": 0, "avg_daily_protein": 0, ...}
  anti_inflammatory_score_avg decimal(3,2),
  
  -- Statut et personnalisation
  status text CHECK (status IN ('draft', 'active', 'completed', 'cancelled')) DEFAULT 'draft',
  is_custom boolean DEFAULT false, -- Plan personnalisé par l'utilisateur vs généré par IA
  generation_prompt text, -- Prompt utilisé pour la génération IA
  
  -- Préférences pour cette semaine
  week_preferences jsonb, -- Préférences spécifiques à cette semaine
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),  
  generated_at timestamp,
  started_at timestamp,
  completed_at timestamp,
  
  UNIQUE(user_id, week_start_date)
);

-- Index pour performance
CREATE INDEX idx_weekly_meal_plans_user_id ON weekly_meal_plans(user_id);
CREATE INDEX idx_weekly_meal_plans_week_start ON weekly_meal_plans(week_start_date);
CREATE INDEX idx_weekly_meal_plans_status ON weekly_meal_plans(status);
CREATE INDEX idx_weekly_meal_plans_user_week ON weekly_meal_plans(user_id, week_start_date);

-- =====================================================
-- 5. USER PREFERENCES - PRÉFÉRENCES UTILISATEUR
-- =====================================================

CREATE TABLE user_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  
  -- Préférences alimentaires détaillées
  favorite_cuisines text[] DEFAULT '{}', -- ['francaise', 'mediterraneenne', 'asiatique', ...]
  disliked_ingredients text[] DEFAULT '{}',
  preferred_cooking_methods text[] DEFAULT '{}', -- ['vapeur', 'grille', 'saute', ...]
  
  -- Restrictions temporelles
  meal_times jsonb DEFAULT '{}'::jsonb, -- {"petit_dejeuner": "07:00", "dejeuner": "12:30", ...}
  prep_day_preferences text[] DEFAULT '{}', -- Jours préférés pour meal prep
  
  -- Préférences nutritionnelles
  preferred_macros_ratio jsonb, -- {"protein": 25, "carbs": 45, "fat": 30} (en pourcentages)
  calorie_distribution jsonb, -- {"petit_dejeuner": 25, "dejeuner": 35, "diner": 30, "collations": 10}
  
  -- Notifications et communication
  notification_preferences jsonb DEFAULT '{
    "meal_reminders": true,
    "shopping_list": true,
    "new_recipes": true,
    "weekly_summary": true,
    "motivation_messages": true
  }'::jsonb,
  communication_frequency text CHECK (communication_frequency IN ('daily', 'weekly', 'monthly')) DEFAULT 'weekly',
  preferred_language text DEFAULT 'fr' CHECK (preferred_language IN ('fr')),
  
  -- Données de personnalisation IA
  ai_personalization_data jsonb DEFAULT '{}'::jsonb,
  learning_preferences jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Index pour performance
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_cuisines ON user_preferences USING GIN(favorite_cuisines);

-- =====================================================
-- 6. SUBSCRIPTIONS - ABONNEMENTS STRIPE
-- =====================================================

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  
  -- Données Stripe
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_price_id text NOT NULL,
  
  -- Statut abonnement
  status text CHECK (status IN ('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')) NOT NULL,
  
  -- Périodes
  current_period_start timestamp NOT NULL,
  current_period_end timestamp NOT NULL,
  trial_start timestamp,
  trial_end timestamp,
  
  -- Annulation
  cancel_at_period_end boolean DEFAULT false,
  cancel_at timestamp,
  canceled_at timestamp,
  cancellation_reason text,
  
  -- Facturation
  amount_euro decimal(6,2) NOT NULL DEFAULT 5.99,
  currency text DEFAULT 'eur' CHECK (currency = 'eur'),
  interval_type text CHECK (interval_type IN ('month', 'year')) DEFAULT 'month',
  
  -- Métadonnées
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(user_id, stripe_subscription_id)
);

-- Index pour performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period ON subscriptions(current_period_start, current_period_end);
CREATE INDEX idx_subscriptions_active ON subscriptions(status) WHERE status = 'active';

-- =====================================================
-- 7. USER RECIPE INTERACTIONS
-- =====================================================

CREATE TABLE user_recipe_interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  
  -- Types d'interactions
  is_liked boolean DEFAULT false,
  is_saved boolean DEFAULT false,
  is_cooked boolean DEFAULT false,
  
  -- Rating
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  
  -- Modifications personnelles
  personal_notes text,
  ingredient_modifications jsonb,
  
  -- Historique
  first_viewed_at timestamp DEFAULT now(),
  last_viewed_at timestamp DEFAULT now(),
  cooked_count integer DEFAULT 0,
  times_cooked timestamp[],
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(user_id, recipe_id)
);

-- Index pour performance
CREATE INDEX idx_user_recipe_interactions_user_id ON user_recipe_interactions(user_id);
CREATE INDEX idx_user_recipe_interactions_recipe_id ON user_recipe_interactions(recipe_id);
CREATE INDEX idx_user_recipe_interactions_liked ON user_recipe_interactions(user_id) WHERE is_liked = true;
CREATE INDEX idx_user_recipe_interactions_saved ON user_recipe_interactions(user_id) WHERE is_saved = true;
CREATE INDEX idx_user_recipe_interactions_cooked ON user_recipe_interactions(user_id) WHERE is_cooked = true;

-- =====================================================
-- 8. USER PROGRESS TRACKING
-- =====================================================

CREATE TABLE user_progress (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  
  -- Date de mesure
  recorded_date date NOT NULL,
  
  -- Données physiques
  weight_kg decimal(5,2),
  body_fat_percentage decimal(4,2),
  muscle_mass_kg decimal(5,2),
  waist_circumference_cm decimal(5,2),
  
  -- Bien-être subjectif (1-10)
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  mood_score integer CHECK (mood_score >= 1 AND mood_score <= 10),
  inflammation_feeling integer CHECK (inflammation_feeling >= 1 AND inflammation_feeling <= 10),
  
  -- Adhérence au programme
  meals_followed_percentage decimal(5,2) CHECK (meals_followed_percentage >= 0 AND meals_followed_percentage <= 100),
  
  -- Notes personnelles
  notes text,
  
  -- Photos de progrès (URLs)
  progress_photos_urls text[],
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(user_id, recorded_date)
);

-- Index pour performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_date ON user_progress(recorded_date);
CREATE INDEX idx_user_progress_user_date ON user_progress(user_id, recorded_date);

-- =====================================================
-- 9. SHOPPING LISTS
-- =====================================================

CREATE TABLE shopping_lists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  
  -- Informations de base
  name text NOT NULL,
  description text,
  
  -- Période couverte
  start_date date,
  end_date date,
  
  -- Items de la liste
  items jsonb NOT NULL, -- [{"name": "string", "quantity": "string", "unit": "string", "category": "string", "is_purchased": false, "estimated_cost": 0}]
  
  -- Coût total estimé
  total_estimated_cost_euro decimal(6,2),
  actual_cost_euro decimal(6,2),
  
  -- Statut
  status text CHECK (status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  completion_percentage decimal(5,2) DEFAULT 0,
  
  -- Source de génération
  source_meal_plan_id uuid REFERENCES weekly_meal_plans(id),
  is_auto_generated boolean DEFAULT false,
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  completed_at timestamp
);

-- Index pour performance
CREATE INDEX idx_shopping_lists_user_id ON shopping_lists(user_id);
CREATE INDEX idx_shopping_lists_status ON shopping_lists(status);
CREATE INDEX idx_shopping_lists_dates ON shopping_lists(start_date, end_date);

-- =====================================================
-- 10. COMMENTAIRES DE DOCUMENTATION
-- =====================================================

COMMENT ON DATABASE postgres IS 'Coach Nutritionnel IA - Base de données pour application anti-inflammatoire française';
COMMENT ON SCHEMA public IS 'Schéma principal pour coach nutritionnel avec abonnement 5.99€/mois';