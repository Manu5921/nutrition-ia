-- =====================================================
-- COACH NUTRITIONNEL IA - ROW LEVEL SECURITY POLICIES (CLEAN)
-- =====================================================
-- Version: 1.0 Clean
-- Date: 2025-06-23
-- Description: Politiques RLS sans triggers problématiques

-- =====================================================
-- 1. ACTIVATION RLS SUR TOUTES LES TABLES EXISTANTES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recipe_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

-- Tables de nutrition (migration 2)
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_nutrition_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_nutrition_tracking ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. FONCTIONS HELPER SIMPLES
-- =====================================================

-- Fonction admin simple
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT (metadata->>'is_admin')::boolean 
     FROM users 
     WHERE id = auth.uid()), 
    false
  )
$$;

-- =====================================================
-- 3. POLICIES POUR TABLE USERS
-- =====================================================

CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_admin_all" ON users
  FOR ALL USING (is_admin_user());

-- =====================================================
-- 4. POLICIES POUR TABLE USER_PROFILES
-- =====================================================

CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_profiles_admin_all" ON user_profiles
  FOR ALL USING (is_admin_user());

-- =====================================================
-- 5. POLICIES POUR TABLE RECIPES
-- =====================================================

CREATE POLICY "recipes_select_published" ON recipes
  FOR SELECT USING (is_published = true OR author = auth.uid()::text);

CREATE POLICY "recipes_insert_authenticated" ON recipes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "recipes_update_author" ON recipes
  FOR UPDATE USING (author = auth.uid()::text);

CREATE POLICY "recipes_delete_author" ON recipes
  FOR DELETE USING (author = auth.uid()::text);

CREATE POLICY "recipes_admin_all" ON recipes
  FOR ALL USING (is_admin_user());

-- =====================================================
-- 6. POLICIES POUR TABLE WEEKLY_MEAL_PLANS
-- =====================================================

CREATE POLICY "weekly_meal_plans_own" ON weekly_meal_plans
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "weekly_meal_plans_admin_all" ON weekly_meal_plans
  FOR ALL USING (is_admin_user());

-- =====================================================
-- 7. POLICIES POUR TABLE USER_PREFERENCES
-- =====================================================

CREATE POLICY "user_preferences_own" ON user_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "user_preferences_admin_all" ON user_preferences
  FOR ALL USING (is_admin_user());

-- =====================================================
-- 8. POLICIES POUR TABLE SUBSCRIPTIONS
-- =====================================================

CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "subscriptions_admin_modify" ON subscriptions
  FOR INSERT WITH CHECK (is_admin_user());

CREATE POLICY "subscriptions_admin_update" ON subscriptions
  FOR UPDATE USING (is_admin_user());

CREATE POLICY "subscriptions_admin_all" ON subscriptions
  FOR ALL USING (is_admin_user());

-- =====================================================
-- 9. POLICIES POUR TABLE USER_RECIPE_INTERACTIONS
-- =====================================================

CREATE POLICY "user_recipe_interactions_own" ON user_recipe_interactions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "user_recipe_interactions_admin_all" ON user_recipe_interactions
  FOR ALL USING (is_admin_user());

-- =====================================================
-- 10. POLICIES POUR TABLE USER_PROGRESS
-- =====================================================

CREATE POLICY "user_progress_own" ON user_progress
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "user_progress_admin_all" ON user_progress
  FOR ALL USING (is_admin_user());

-- =====================================================
-- 11. POLICIES POUR TABLE SHOPPING_LISTS
-- =====================================================

CREATE POLICY "shopping_lists_own" ON shopping_lists
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "shopping_lists_admin_all" ON shopping_lists
  FOR ALL USING (is_admin_user());

-- =====================================================
-- 12. POLICIES POUR TABLES NUTRITION
-- =====================================================

-- Foods: lecture publique
CREATE POLICY "foods_public_read" ON foods
  FOR SELECT USING (true);

CREATE POLICY "foods_admin_modify" ON foods
  FOR ALL USING (is_admin_user());

-- Food combinations: lecture publique
CREATE POLICY "food_combinations_public_read" ON food_combinations
  FOR SELECT USING (true);

CREATE POLICY "food_combinations_admin_modify" ON food_combinations
  FOR ALL USING (is_admin_user());

-- Meal nutrition analysis: utilisateur propriétaire
CREATE POLICY "meal_nutrition_analysis_own" ON meal_nutrition_analysis
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "meal_nutrition_analysis_admin_all" ON meal_nutrition_analysis
  FOR ALL USING (is_admin_user());

-- Nutrition goals: utilisateur propriétaire
CREATE POLICY "nutrition_goals_own" ON nutrition_goals
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "nutrition_goals_admin_all" ON nutrition_goals
  FOR ALL USING (is_admin_user());

-- Daily nutrition tracking: utilisateur propriétaire
CREATE POLICY "daily_nutrition_tracking_own" ON daily_nutrition_tracking
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "daily_nutrition_tracking_admin_all" ON daily_nutrition_tracking
  FOR ALL USING (is_admin_user());

-- =====================================================
-- 13. COMMENTAIRES
-- =====================================================

COMMENT ON SCHEMA public IS 'Schema principal avec Row Level Security activé';
COMMENT ON FUNCTION is_admin_user() IS 'Vérifie si l''utilisateur actuel est administrateur';