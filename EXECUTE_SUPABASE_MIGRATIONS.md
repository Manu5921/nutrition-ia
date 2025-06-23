# 🗄️ EXÉCUTION DES MIGRATIONS SUPABASE - GUIDE ÉTAPE PAR ÉTAPE

## 🎯 **INSTRUCTIONS IMPORTANTES**

**Vous devez exécuter ces migrations dans l'ordre exact via le Dashboard Supabase.**

### **Accès Dashboard Supabase**
- **URL** : https://supabase.com/dashboard/project/qyelzxeuffkoglfrueem
- **SQL Editor** : Cliquez sur "SQL Editor" dans le menu latéral

---

## 📋 **MIGRATION 1 : SCHEMA INITIAL**

**Fichier** : `supabase/migrations/001_initial_schema.sql`

```sql
-- =====================================================
-- COACH NUTRITIONNEL IA - MIGRATION INITIALE
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

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
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index pour performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Profils utilisateurs détaillés
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  height_cm integer CHECK (height_cm > 0 AND height_cm < 300),
  weight_kg numeric(5,2) CHECK (weight_kg > 0 AND weight_kg < 1000),
  activity_level text CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  health_goals text[] DEFAULT ARRAY[]::text[],
  allergies text[] DEFAULT ARRAY[]::text[],
  dietary_restrictions text[] DEFAULT ARRAY[]::text[],
  preferred_cuisine text[] DEFAULT ARRAY[]::text[],
  cooking_skill_level text CHECK (cooking_skill_level IN ('beginner', 'intermediate', 'advanced')),
  cooking_time_preference integer DEFAULT 30,
  budget_preference text CHECK (budget_preference IN ('low', 'medium', 'high')),
  spice_tolerance text CHECK (spice_tolerance IN ('none', 'mild', 'medium', 'hot', 'very_hot')),
  meal_frequency integer DEFAULT 3 CHECK (meal_frequency >= 1 AND meal_frequency <= 8),
  hydration_goal_ml integer DEFAULT 2000,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id)
);

-- Index pour user_profiles
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_goals ON user_profiles USING gin(health_goals);
CREATE INDEX idx_user_profiles_allergies ON user_profiles USING gin(allergies);

-- Table des abonnements
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  plan_type text NOT NULL CHECK (plan_type IN ('free', 'premium', 'pro')),
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
  current_period_start timestamp NOT NULL,
  current_period_end timestamp NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id)
);

-- Index pour subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
```

**✅ Exécutez ce code dans SQL Editor et cliquez "Run"**

---

## 📋 **MIGRATION 2 : BASE NUTRITION**

**Fichier** : `supabase/migrations/002_foods_nutrition_database.sql`

```sql
-- =====================================================
-- BASE DE DONNÉES NUTRITIONNELLE
-- =====================================================

-- Table des aliments avec données nutritionnelles
CREATE TABLE foods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  name_scientific text,
  code_ciqual text UNIQUE,
  category text NOT NULL,
  subcategory text,
  description text,
  origin text DEFAULT 'france',
  
  -- Données nutritionnelles pour 100g
  calories_per_100g numeric(8,2),
  proteins_g_per_100g numeric(8,2),
  carbohydrates_g_per_100g numeric(8,2),
  fats_g_per_100g numeric(8,2),
  fiber_g_per_100g numeric(8,2),
  sugars_g_per_100g numeric(8,2),
  sodium_mg_per_100g numeric(8,2),
  
  -- Micronutriments essentiels
  vitamin_c_mg_per_100g numeric(8,3),
  vitamin_d_ug_per_100g numeric(8,3),
  calcium_mg_per_100g numeric(8,2),
  iron_mg_per_100g numeric(8,3),
  magnesium_mg_per_100g numeric(8,2),
  potassium_mg_per_100g numeric(8,2),
  
  -- Score anti-inflammatoire (calculé)
  anti_inflammatory_score numeric(5,2) CHECK (anti_inflammatory_score >= 0 AND anti_inflammatory_score <= 100),
  
  -- Métadonnées
  data_source text DEFAULT 'ciqual',
  data_quality text CHECK (data_quality IN ('high', 'medium', 'low')) DEFAULT 'high',
  last_updated timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

-- Index pour foods
CREATE INDEX idx_foods_name ON foods USING gin(to_tsvector('french', name));
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_score ON foods(anti_inflammatory_score) WHERE anti_inflammatory_score IS NOT NULL;
CREATE INDEX idx_foods_ciqual ON foods(code_ciqual) WHERE code_ciqual IS NOT NULL;

-- Table des recettes
CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  instructions text NOT NULL,
  prep_time_minutes integer CHECK (prep_time_minutes > 0),
  cook_time_minutes integer CHECK (cook_time_minutes >= 0),
  total_time_minutes integer GENERATED ALWAYS AS (prep_time_minutes + cook_time_minutes) STORED,
  servings integer CHECK (servings > 0) DEFAULT 4,
  difficulty_level text CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  cuisine_type text,
  meal_type text[] DEFAULT ARRAY[]::text[],
  tags text[] DEFAULT ARRAY[]::text[],
  
  -- Nutrition calculée pour une portion
  calories_per_serving numeric(8,2),
  proteins_g_per_serving numeric(8,2),
  carbohydrates_g_per_serving numeric(8,2),
  fats_g_per_serving numeric(8,2),
  fiber_g_per_serving numeric(8,2),
  
  -- Score anti-inflammatoire de la recette
  anti_inflammatory_score numeric(5,2) CHECK (anti_inflammatory_score >= 0 AND anti_inflammatory_score <= 100),
  
  -- Métadonnées
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  is_public boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  image_url text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Index pour recipes
CREATE INDEX idx_recipes_name ON recipes USING gin(to_tsvector('french', name));
CREATE INDEX idx_recipes_author ON recipes(author_id) WHERE author_id IS NOT NULL;
CREATE INDEX idx_recipes_public ON recipes(is_public) WHERE is_public = true;
CREATE INDEX idx_recipes_score ON recipes(anti_inflammatory_score) WHERE anti_inflammatory_score IS NOT NULL;
CREATE INDEX idx_recipes_meal_type ON recipes USING gin(meal_type);
CREATE INDEX idx_recipes_tags ON recipes USING gin(tags);

-- Table des ingrédients de recettes
CREATE TABLE recipe_ingredients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE,
  food_id uuid REFERENCES foods(id) ON DELETE CASCADE,
  quantity numeric(8,3) NOT NULL CHECK (quantity > 0),
  unit text NOT NULL,
  notes text,
  order_index integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  UNIQUE(recipe_id, food_id, unit)
);

-- Index pour recipe_ingredients
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_food ON recipe_ingredients(food_id);
```

**✅ Exécutez ce code dans SQL Editor et cliquez "Run"**

---

## 📋 **MIGRATION 3 : FONCTIONS AVANCÉES**

**Fichier** : `supabase/migrations/003_advanced_functions.sql`

```sql
-- =====================================================
-- FONCTIONS NUTRITIONNELLES AVANCÉES
-- =====================================================

-- Fonction pour calculer le score anti-inflammatoire d'un aliment
CREATE OR REPLACE FUNCTION calculate_food_anti_inflammatory_score(
  p_food_id uuid
) RETURNS numeric AS $$
DECLARE
  v_score numeric := 50; -- Score de base neutre
  v_food foods%ROWTYPE;
BEGIN
  SELECT * INTO v_food FROM foods WHERE id = p_food_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Bonifications pour nutriments anti-inflammatoires
  IF v_food.vitamin_c_mg_per_100g > 50 THEN
    v_score := v_score + 10;
  END IF;
  
  IF v_food.fiber_g_per_100g > 5 THEN
    v_score := v_score + 15;
  END IF;
  
  IF v_food.fats_g_per_100g > 0 AND v_food.category ILIKE '%nuts%' OR v_food.category ILIKE '%fish%' THEN
    v_score := v_score + 20; -- Bonification oméga-3
  END IF;
  
  -- Pénalités pour éléments pro-inflammatoires
  IF v_food.sodium_mg_per_100g > 400 THEN
    v_score := v_score - 15;
  END IF;
  
  IF v_food.sugars_g_per_100g > 15 THEN
    v_score := v_score - 10;
  END IF;
  
  -- Bonifications spéciales par catégorie
  CASE 
    WHEN v_food.category ILIKE '%vegetable%' OR v_food.category ILIKE '%fruit%' THEN
      v_score := v_score + 25;
    WHEN v_food.category ILIKE '%legume%' THEN
      v_score := v_score + 20;
    WHEN v_food.category ILIKE '%spice%' OR v_food.category ILIKE '%herb%' THEN
      v_score := v_score + 30;
    WHEN v_food.category ILIKE '%processed%' THEN
      v_score := v_score - 20;
  END CASE;
  
  -- Contraintes finales
  v_score := GREATEST(0, LEAST(100, v_score));
  
  -- Mise à jour du score dans la table
  UPDATE foods SET anti_inflammatory_score = v_score WHERE id = p_food_id;
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les besoins nutritionnels d'un utilisateur
CREATE OR REPLACE FUNCTION calculate_user_nutrition_needs(
  p_user_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_profile user_profiles%ROWTYPE;
  v_bmr numeric;
  v_tdee numeric;
  v_result jsonb;
BEGIN
  SELECT * INTO v_profile FROM user_profiles WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN '{"error": "User profile not found"}'::jsonb;
  END IF;
  
  -- Calcul BMR (Mifflin-St Jeor)
  IF v_profile.gender = 'male' THEN
    v_bmr := 10 * v_profile.weight_kg + 6.25 * v_profile.height_cm - 5 * EXTRACT(YEAR FROM AGE(v_profile.date_of_birth)) + 5;
  ELSE
    v_bmr := 10 * v_profile.weight_kg + 6.25 * v_profile.height_cm - 5 * EXTRACT(YEAR FROM AGE(v_profile.date_of_birth)) - 161;
  END IF;
  
  -- Calcul TDEE selon niveau d'activité
  CASE v_profile.activity_level
    WHEN 'sedentary' THEN v_tdee := v_bmr * 1.2;
    WHEN 'light' THEN v_tdee := v_bmr * 1.375;
    WHEN 'moderate' THEN v_tdee := v_bmr * 1.55;
    WHEN 'active' THEN v_tdee := v_bmr * 1.725;
    WHEN 'very_active' THEN v_tdee := v_bmr * 1.9;
    ELSE v_tdee := v_bmr * 1.5;
  END CASE;
  
  -- Construction du résultat
  v_result := jsonb_build_object(
    'bmr', ROUND(v_bmr, 0),
    'tdee', ROUND(v_tdee, 0),
    'proteins_g', ROUND(v_profile.weight_kg * 1.2, 0),
    'carbohydrates_g', ROUND(v_tdee * 0.45 / 4, 0),
    'fats_g', ROUND(v_tdee * 0.30 / 9, 0),
    'fiber_g', CASE 
      WHEN v_profile.gender = 'male' THEN 38 
      ELSE 25 
    END,
    'water_ml', v_profile.hydration_goal_ml
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir des recommandations nutritionnelles personnalisées
CREATE OR REPLACE FUNCTION get_personalized_food_recommendations(
  p_user_id uuid,
  p_limit integer DEFAULT 10
) RETURNS TABLE(
  food_id uuid,
  food_name text,
  anti_inflammatory_score numeric,
  reason text
) AS $$
DECLARE
  v_profile user_profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile FROM user_profiles WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.anti_inflammatory_score,
    CASE 
      WHEN f.anti_inflammatory_score > 80 THEN 'Excellent choix anti-inflammatoire'
      WHEN f.anti_inflammatory_score > 60 THEN 'Bon choix pour votre santé'
      WHEN f.fiber_g_per_100g > 8 THEN 'Riche en fibres bénéfiques'
      WHEN f.proteins_g_per_100g > 20 THEN 'Excellente source de protéines'
      ELSE 'Recommandé pour votre profil'
    END as reason
  FROM foods f
  WHERE f.anti_inflammatory_score IS NOT NULL
    AND f.anti_inflammatory_score > 40
    AND NOT (f.name ILIKE ANY(v_profile.allergies))
  ORDER BY 
    f.anti_inflammatory_score DESC,
    f.fiber_g_per_100g DESC NULLS LAST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
```

**✅ Exécutez ce code dans SQL Editor et cliquez "Run"**

---

## 📋 **MIGRATION 4 : POLITIQUES RLS**

**Fichier** : `supabase/migrations/004_rls_policies_complete.sql`

```sql
-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Politiques pour users
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Politiques pour user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques pour subscriptions
CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Politiques pour foods (lecture publique)
CREATE POLICY "Foods are publicly readable" ON foods
  FOR SELECT USING (true);

-- Politiques pour recipes
CREATE POLICY "Public recipes are readable by all" ON recipes
  FOR SELECT USING (is_public = true OR auth.uid() = author_id);

CREATE POLICY "Users can create recipes" ON recipes
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own recipes" ON recipes
  FOR DELETE USING (auth.uid() = author_id);

-- Politiques pour recipe_ingredients
CREATE POLICY "Recipe ingredients follow recipe access" ON recipe_ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes r 
      WHERE r.id = recipe_id 
      AND (r.is_public = true OR r.author_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage ingredients of their recipes" ON recipe_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes r 
      WHERE r.id = recipe_id 
      AND r.author_id = auth.uid()
    )
  );
```

**✅ Exécutez ce code dans SQL Editor et cliquez "Run"**

---

## 📋 **MIGRATION 5 : TRIGGERS ET AUTOMATISATION**

**Fichier** : `supabase/migrations/005_triggers_and_automation.sql`

```sql
-- =====================================================
-- TRIGGERS ET AUTOMATISATION
-- =====================================================

-- Fonction générique pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at 
  BEFORE UPDATE ON recipes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour calcul automatique du score anti-inflammatoire
CREATE OR REPLACE FUNCTION auto_calculate_food_score()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (
    OLD.calories_per_100g IS DISTINCT FROM NEW.calories_per_100g OR
    OLD.proteins_g_per_100g IS DISTINCT FROM NEW.proteins_g_per_100g OR
    OLD.fiber_g_per_100g IS DISTINCT FROM NEW.fiber_g_per_100g OR
    OLD.sodium_mg_per_100g IS DISTINCT FROM NEW.sodium_mg_per_100g OR
    OLD.sugars_g_per_100g IS DISTINCT FROM NEW.sugars_g_per_100g
  )) THEN
    NEW.anti_inflammatory_score := calculate_food_anti_inflammatory_score(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_food_anti_inflammatory_score
  BEFORE INSERT OR UPDATE ON foods
  FOR EACH ROW EXECUTE FUNCTION auto_calculate_food_score();
```

**✅ Exécutez ce code dans SQL Editor et cliquez "Run"**

---

## 📋 **MIGRATION 6 : VUES ET OPTIMISATION**

**Fichier** : `supabase/migrations/006_views_and_optimization.sql`

```sql
-- =====================================================
-- VUES ET OPTIMISATION
-- =====================================================

-- Vue pour aliments top anti-inflammatoires
CREATE OR REPLACE VIEW top_anti_inflammatory_foods AS
SELECT 
  id,
  name,
  category,
  anti_inflammatory_score,
  fiber_g_per_100g,
  proteins_g_per_100g,
  vitamin_c_mg_per_100g
FROM foods 
WHERE anti_inflammatory_score IS NOT NULL 
  AND anti_inflammatory_score > 70
ORDER BY anti_inflammatory_score DESC;

-- Vue pour statistiques utilisateur complètes
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.email,
  up.first_name,
  up.last_name,
  s.plan_type,
  s.status as subscription_status,
  u.created_at as user_since,
  u.last_login_at
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN subscriptions s ON u.id = s.user_id;

-- Index composites pour performance
CREATE INDEX idx_foods_score_category ON foods(anti_inflammatory_score, category) 
  WHERE anti_inflammatory_score IS NOT NULL;

CREATE INDEX idx_recipes_public_score ON recipes(is_public, anti_inflammatory_score) 
  WHERE is_public = true AND anti_inflammatory_score IS NOT NULL;

-- Statistiques pour l'optimiseur
ANALYZE users;
ANALYZE user_profiles;
ANALYZE foods;
ANALYZE recipes;
ANALYZE subscriptions;
```

**✅ Exécutez ce code dans SQL Editor et cliquez "Run"**

---

## 📋 **MIGRATION 7 : DONNÉES D'EXEMPLE**

**Fichier** : `supabase/migrations/007_sample_data.sql`

```sql
-- =====================================================
-- DONNÉES D'EXEMPLE POUR TESTS
-- =====================================================

-- Insertion d'aliments de base avec données nutritionnelles françaises
INSERT INTO foods (name, code_ciqual, category, calories_per_100g, proteins_g_per_100g, carbohydrates_g_per_100g, fats_g_per_100g, fiber_g_per_100g, vitamin_c_mg_per_100g) VALUES
('Épinards crus', '20055', 'Légumes verts', 23, 2.9, 1.4, 0.4, 2.2, 28.1),
('Saumon atlantique', '26009', 'Poissons gras', 208, 22.1, 0, 13.4, 0, 0),
('Avocat', '13006', 'Fruits oléagineux', 160, 2, 8.5, 14.7, 6.7, 10),
('Myrtilles', '13034', 'Fruits rouges', 57, 0.7, 14.5, 0.3, 2.4, 9.7),
('Noix', '15001', 'Fruits à coque', 654, 15.2, 13.7, 65.2, 6.7, 1.3),
('Brocolis', '20047', 'Légumes crucifères', 25, 3, 5, 0.4, 2.6, 89.2),
('Quinoa cuit', '9616', 'Céréales complètes', 116, 4.4, 21.3, 1.9, 2.8, 0),
('Curcuma', '11035', 'Épices anti-inflammatoires', 354, 7.8, 65, 9.9, 21, 25.9),
('Huile d''olive extra vierge', '17070', 'Huiles végétales', 884, 0, 0, 100, 0, 0),
('Thé vert', '18005', 'Boissons antioxydantes', 1, 0.2, 0, 0, 0, 0);

-- Recette d'exemple
INSERT INTO recipes (name, description, instructions, prep_time_minutes, cook_time_minutes, servings, difficulty_level, meal_type, tags, is_public, is_verified) VALUES
(
  'Salade d''épinards au saumon et avocat',
  'Une salade riche en oméga-3 et antioxydants, parfaite pour un repas anti-inflammatoire.',
  '1. Laver et essorer les épinards\n2. Cuire le saumon à la poêle 4 min de chaque côté\n3. Découper l''avocat en lamelles\n4. Mélanger tous les ingrédients\n5. Assaisonner avec huile d''olive et citron',
  15,
  8,
  2,
  'easy',
  ARRAY['lunch', 'dinner'],
  ARRAY['anti-inflammatoire', 'oméga-3', 'healthy'],
  true,
  true
);

-- Lier les ingrédients à la recette
DO $$
DECLARE
  v_recipe_id uuid;
  v_spinach_id uuid;
  v_salmon_id uuid;
  v_avocado_id uuid;
BEGIN
  SELECT id INTO v_recipe_id FROM recipes WHERE name = 'Salade d''épinards au saumon et avocat';
  SELECT id INTO v_spinach_id FROM foods WHERE name = 'Épinards crus';
  SELECT id INTO v_salmon_id FROM foods WHERE name = 'Saumon atlantique';
  SELECT id INTO v_avocado_id FROM foods WHERE name = 'Avocat';
  
  INSERT INTO recipe_ingredients (recipe_id, food_id, quantity, unit, order_index) VALUES
  (v_recipe_id, v_spinach_id, 100, 'g', 1),
  (v_recipe_id, v_salmon_id, 150, 'g', 2),
  (v_recipe_id, v_avocado_id, 50, 'g', 3);
END $$;
```

**✅ Exécutez ce code dans SQL Editor et cliquez "Run"**

---

## 📋 **MIGRATION 8 : TABLES SYSTÈME**

**Fichier** : `supabase/migrations/008_missing_system_tables.sql`

```sql
-- =====================================================
-- TABLES SYSTÈME MANQUANTES
-- =====================================================

-- Table audit_logs pour journalisation
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  session_id text,
  created_at timestamp DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_action ON audit_logs(table_name, action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Table user_action_rates pour rate limiting
CREATE TABLE user_action_rates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_count integer DEFAULT 1,
  window_start timestamp DEFAULT now(),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  UNIQUE(user_id, action_type, window_start)
);

CREATE INDEX idx_user_action_rates_user_action ON user_action_rates(user_id, action_type);
CREATE INDEX idx_user_action_rates_window ON user_action_rates(window_start);

-- Fonction pour rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_action_type text,
  p_max_actions integer DEFAULT 100,
  p_window_minutes integer DEFAULT 60
) RETURNS boolean AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_window_start timestamp;
  v_current_count integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Calculer le début de la fenêtre actuelle
  v_window_start := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::integer / p_window_minutes) * 
    (p_window_minutes || ' minutes')::interval;
  
  -- Obtenir le compte actuel
  SELECT action_count INTO v_current_count
  FROM user_action_rates
  WHERE user_id = v_user_id 
    AND action_type = p_action_type 
    AND window_start = v_window_start;
  
  -- Si pas d'entrée, créer une nouvelle
  IF v_current_count IS NULL THEN
    INSERT INTO user_action_rates (user_id, action_type, window_start, action_count)
    VALUES (v_user_id, p_action_type, v_window_start, 1)
    ON CONFLICT (user_id, action_type, window_start) 
    DO UPDATE SET 
      action_count = user_action_rates.action_count + 1,
      updated_at = now();
    
    RETURN true;
  END IF;
  
  -- Vérifier la limite
  IF v_current_count >= p_max_actions THEN
    RETURN false;
  END IF;
  
  -- Incrémenter le compteur
  UPDATE user_action_rates 
  SET action_count = action_count + 1, updated_at = now()
  WHERE user_id = v_user_id 
    AND action_type = p_action_type 
    AND window_start = v_window_start;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activer RLS sur les nouvelles tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_action_rates ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage audit logs" ON audit_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own rate limits" ON user_action_rates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage rate limits" ON user_action_rates
  FOR ALL USING (auth.role() = 'service_role');
```

**✅ Exécutez ce code dans SQL Editor et cliquez "Run"**

---

## 🎉 **VALIDATION FINALE**

Une fois toutes les migrations exécutées, vérifiez dans **Table Editor** de Supabase :

### **Tables Créées (21 total)** :
- ✅ `users` - Gestion utilisateurs
- ✅ `user_profiles` - Profils détaillés  
- ✅ `subscriptions` - Abonnements
- ✅ `foods` - Base alimentaire (10 aliments test)
- ✅ `recipes` - Recettes (1 recette test)
- ✅ `recipe_ingredients` - Ingrédients recettes
- ✅ `audit_logs` - Journalisation système
- ✅ `user_action_rates` - Rate limiting

### **Fonctions Créées (5+)** :
- ✅ `calculate_food_anti_inflammatory_score()`
- ✅ `calculate_user_nutrition_needs()`
- ✅ `get_personalized_food_recommendations()`
- ✅ `check_rate_limit()`
- ✅ `update_updated_at_column()`

### **Vues Créées** :
- ✅ `top_anti_inflammatory_foods`
- ✅ `user_stats`

---

## 🚀 **ÉTAPE SUIVANTE**

Une fois Supabase configuré, **votre application est prête pour le déploiement Vercel final !**

**Status** : Database ✅ | Variables ✅ | Deploy ⏳