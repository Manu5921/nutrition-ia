-- =====================================================
-- COACH NUTRITIONNEL IA - BASE DE DONNÉES ALIMENTAIRE
-- =====================================================
-- Version: 1.0
-- Date: 2025-06-23
-- Description: Tables pour base de données d'aliments et nutrition détaillée

-- =====================================================
-- 1. FOODS - BASE DE DONNÉES D'ALIMENTS
-- =====================================================

CREATE TABLE foods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identifiants et noms
  name_fr text NOT NULL,
  name_scientific text,
  common_names text[],
  
  -- Classification
  category text NOT NULL, -- 'legume', 'fruit', 'proteine', 'cereale', 'lactaire', 'matiere_grasse', etc.
  subcategory text,
  food_group text, -- Groupe alimentaire principal
  
  -- Codes de référence (CIQUAL, etc.)
  ciqual_code text,
  usda_code text,
  
  -- Disponibilité et saison
  season_availability text[], -- ['printemps', 'ete', 'automne', 'hiver']
  geographical_origin text[],
  
  -- Données nutritionnelles pour 100g
  nutrition_per_100g jsonb NOT NULL DEFAULT '{
    "energy_kcal": 0,
    "energy_kj": 0,
    "water_g": 0,
    "protein_g": 0,
    "carbohydrate_g": 0,
    "fiber_g": 0,
    "sugar_g": 0,
    "fat_total_g": 0,
    "fat_saturated_g": 0,
    "fat_monounsaturated_g": 0,
    "fat_polyunsaturated_g": 0,
    "cholesterol_mg": 0,
    "sodium_mg": 0,
    "potassium_mg": 0,
    "calcium_mg": 0,
    "magnesium_mg": 0,
    "phosphorus_mg": 0,
    "iron_mg": 0,
    "zinc_mg": 0,
    "vitamin_a_ug": 0,
    "vitamin_c_mg": 0,
    "vitamin_d_ug": 0,
    "vitamin_e_mg": 0,
    "vitamin_k_ug": 0,
    "vitamin_b1_mg": 0,
    "vitamin_b2_mg": 0,
    "vitamin_b3_mg": 0,
    "vitamin_b6_mg": 0,
    "vitamin_b9_ug": 0,
    "vitamin_b12_ug": 0
  }'::jsonb,
  
  -- Scores et indices
  anti_inflammatory_score integer CHECK (anti_inflammatory_score >= 1 AND anti_inflammatory_score <= 10),
  glycemic_index integer CHECK (glycemic_index >= 0 AND glycemic_index <= 100),
  glycemic_load decimal(4,2),
  
  -- Propriétés anti-inflammatoires
  anti_inflammatory_compounds text[], -- ['omega3', 'anthocyanines', 'flavonoides', 'polyphenols', etc.]
  inflammatory_potential text CHECK (inflammatory_potential IN ('anti_inflammatoire', 'neutre', 'pro_inflammatoire')),
  
  -- Allergènes et restrictions
  allergens text[], -- ['gluten', 'lactose', 'fruits_a_coque', 'soja', etc.]
  diet_compatibility text[], -- ['vegetarien', 'vegan', 'cetogene', 'paleo', 'sans_gluten', etc.]
  
  -- Informations pratiques
  storage_instructions text,
  preparation_tips text[],
  cooking_methods text[],
  
  -- Coût approximatif (€/kg)
  average_price_per_kg decimal(5,2),
  price_category text CHECK (price_category IN ('economique', 'moyen', 'premium')),
  
  -- Durabilité et environnement
  carbon_footprint_kg_co2_per_kg decimal(5,3),
  sustainability_score integer CHECK (sustainability_score >= 1 AND sustainability_score <= 10),
  
  -- Images et références
  image_url text,
  source_refs text[],
  
  -- Métadonnées
  is_verified boolean DEFAULT false,
  verification_date timestamp,
  last_nutrition_update timestamp,
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Index pour recherche et performance
CREATE INDEX idx_foods_name ON foods(name_fr);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_subcategory ON foods(subcategory);
CREATE INDEX idx_foods_anti_inflammatory_score ON foods(anti_inflammatory_score);
CREATE INDEX idx_foods_season ON foods USING GIN(season_availability);
CREATE INDEX idx_foods_allergens ON foods USING GIN(allergens);
CREATE INDEX idx_foods_diet_compatibility ON foods USING GIN(diet_compatibility);
CREATE INDEX idx_foods_compounds ON foods USING GIN(anti_inflammatory_compounds);
CREATE INDEX idx_foods_inflammatory_potential ON foods(inflammatory_potential);

-- Index de recherche full-text pour noms
CREATE INDEX idx_foods_search ON foods USING GIN(
  to_tsvector('french', name_fr)
);

-- =====================================================
-- 2. FOOD_COMBINATIONS - SYNERGIES ALIMENTAIRES
-- =====================================================

CREATE TABLE food_combinations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Aliments combinés
  food_1_id uuid REFERENCES foods(id) ON DELETE CASCADE,
  food_2_id uuid REFERENCES foods(id) ON DELETE CASCADE,
  
  -- Type de synergie
  combination_type text CHECK (combination_type IN ('synergique', 'complementaire', 'antagoniste', 'neutre')),
  
  -- Bénéfices nutritionnels
  nutritional_benefits text[],
  absorption_enhancement text, -- Comment cette combinaison améliore l'absorption
  
  -- Score de synergie (1-10)
  synergy_score integer CHECK (synergy_score >= 1 AND synergy_score <= 10),
  
  -- Explications scientifiques
  scientific_explanation text,
  scientific_refs text[],
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(food_1_id, food_2_id)
);

-- Index pour performance
CREATE INDEX idx_food_combinations_food1 ON food_combinations(food_1_id);
CREATE INDEX idx_food_combinations_food2 ON food_combinations(food_2_id);
CREATE INDEX idx_food_combinations_type ON food_combinations(combination_type);
CREATE INDEX idx_food_combinations_score ON food_combinations(synergy_score);

-- =====================================================
-- 3. MEAL_NUTRITION_ANALYSIS - ANALYSES NUTRITIONNELLES
-- =====================================================

CREATE TABLE meal_nutrition_analysis (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  
  -- Référence vers le repas analysé
  meal_source jsonb NOT NULL, -- {"type": "recipe|meal_plan|custom", "source_id": "uuid", "meal_data": {...}}
  
  -- Analyse nutritionnelle détaillée
  nutrition_summary jsonb NOT NULL, -- Somme des valeurs nutritionnelles
  
  -- Scores calculés
  anti_inflammatory_score decimal(3,2),
  nutritional_completeness_score decimal(3,2), -- % des besoins journaliers couverts
  diet_compliance_score decimal(3,2), -- Respect des préférences alimentaires
  
  -- Recommandations d'amélioration
  improvement_suggestions jsonb, -- [{"type": "add|remove|modify", "food": "...", "reason": "..."}]
  missing_nutrients text[],
  excess_nutrients text[],
  
  -- Analyse par macronutriments
  macros_analysis jsonb, -- {"protein": {"amount": 25, "target": 30, "status": "low"}, ...}
  
  -- Analyse par micronutriments
  micros_analysis jsonb, -- Vitamines et minéraux
  
  -- Métadonnées
  analysis_date timestamp DEFAULT now(),
  analysis_version text DEFAULT '1.0',
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_meal_nutrition_analysis_user_id ON meal_nutrition_analysis(user_id);
CREATE INDEX idx_meal_nutrition_analysis_date ON meal_nutrition_analysis(analysis_date);
CREATE INDEX idx_meal_nutrition_analysis_anti_inflammatory ON meal_nutrition_analysis(anti_inflammatory_score);

-- =====================================================
-- 4. NUTRITION_GOALS - OBJECTIFS NUTRITIONNELS
-- =====================================================

CREATE TABLE nutrition_goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  
  -- Objectifs caloriques
  daily_calories_target integer,
  daily_calories_min integer,
  daily_calories_max integer,
  
  -- Objectifs macronutriments (en grammes)
  protein_target_g decimal(6,2),
  carbs_target_g decimal(6,2),
  fat_target_g decimal(6,2),
  fiber_target_g decimal(6,2),
  
  -- Objectifs micronutriments (valeurs clés)
  vitamin_c_target_mg decimal(6,2),
  vitamin_d_target_ug decimal(6,2),
  calcium_target_mg decimal(6,2),
  iron_target_mg decimal(6,2),
  omega3_target_g decimal(6,2),
  
  -- Objectifs spécifiques anti-inflammatoires
  anti_inflammatory_foods_per_day integer DEFAULT 5,
  max_processed_foods_per_week integer DEFAULT 3,
  
  -- Restrictions et limites
  sodium_limit_mg decimal(8,2),
  sugar_limit_g decimal(6,2),
  saturated_fat_limit_g decimal(6,2),
  
  -- Objectifs par repas (pourcentages)
  breakfast_calorie_percentage decimal(4,2) DEFAULT 25.0,
  lunch_calorie_percentage decimal(4,2) DEFAULT 35.0,
  dinner_calorie_percentage decimal(4,2) DEFAULT 30.0,
  snacks_calorie_percentage decimal(4,2) DEFAULT 10.0,
  
  -- Période de validité
  valid_from date DEFAULT CURRENT_DATE,
  valid_until date,
  
  -- Raison de l'objectif
  goal_reason text, -- 'weight_loss', 'muscle_gain', 'health_improvement', etc.
  medical_conditions text[],
  
  -- Statut
  is_active boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(user_id, valid_from) -- Un seul objectif actif par période
);

-- Index pour performance
CREATE INDEX idx_nutrition_goals_user_id ON nutrition_goals(user_id);
CREATE INDEX idx_nutrition_goals_active ON nutrition_goals(is_active) WHERE is_active = true;
CREATE INDEX idx_nutrition_goals_period ON nutrition_goals(valid_from, valid_until);

-- =====================================================
-- 5. DAILY_NUTRITION_TRACKING - SUIVI QUOTIDIEN
-- =====================================================

CREATE TABLE daily_nutrition_tracking (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  
  -- Date du suivi
  tracking_date date NOT NULL,
  
  -- Données nutritionnelles consommées
  consumed_nutrition jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Objectifs du jour (copie depuis nutrition_goals)
  daily_targets jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Calculs de progression
  calories_consumed integer DEFAULT 0,
  calories_remaining integer DEFAULT 0,
  
  -- Pourcentage d'atteinte des objectifs
  protein_goal_percentage decimal(5,2),
  carbs_goal_percentage decimal(5,2),
  fat_goal_percentage decimal(5,2),
  fiber_goal_percentage decimal(5,2),
  
  -- Score anti-inflammatoire de la journée
  daily_anti_inflammatory_score decimal(3,2),
  
  -- Analyse qualitative
  nutrition_quality_score decimal(3,2), -- Score global de qualité nutritionnelle
  diet_adherence_score decimal(3,2), -- Respect du régime suivi
  
  -- Repas de la journée
  meals_consumed jsonb DEFAULT '[]'::jsonb, -- [{"meal_type": "breakfast", "foods": [...], "timestamp": "..."}]
  
  -- Notes et ressenti
  daily_notes text,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  hunger_satisfaction integer CHECK (hunger_satisfaction >= 1 AND hunger_satisfaction <= 10),
  
  -- Métadonnées
  last_updated timestamp DEFAULT now(),
  data_source text DEFAULT 'manual', -- 'manual', 'meal_plan', 'imported'
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(user_id, tracking_date)
);

-- Index pour performance
CREATE INDEX idx_daily_nutrition_tracking_user_id ON daily_nutrition_tracking(user_id);
CREATE INDEX idx_daily_nutrition_tracking_date ON daily_nutrition_tracking(tracking_date);
CREATE INDEX idx_daily_nutrition_tracking_user_date ON daily_nutrition_tracking(user_id, tracking_date);

-- =====================================================
-- 6. COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE foods IS 'Base de données complète des aliments avec valeurs nutritionnelles détaillées';
COMMENT ON TABLE food_combinations IS 'Synergies et interactions entre aliments pour optimisation nutritionnelle';
COMMENT ON TABLE meal_nutrition_analysis IS 'Analyses nutritionnelles détaillées des repas et recommandations';
COMMENT ON TABLE nutrition_goals IS 'Objectifs nutritionnels personnalisés par utilisateur';
COMMENT ON TABLE daily_nutrition_tracking IS 'Suivi quotidien de la nutrition et progression vers les objectifs';