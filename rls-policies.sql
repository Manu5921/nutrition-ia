-- =====================================================
-- COACH NUTRITIONNEL IA - ROW LEVEL SECURITY POLICIES
-- =====================================================
-- Version: 1.0
-- Date: 2025-06-23
-- Description: Politiques de sécurité strictes pour protéger les données utilisateurs

-- =====================================================
-- 1. ACTIVATION RLS SUR TOUTES LES TABLES
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

-- =====================================================
-- 2. FONCTION HELPER - RÉCUPÉRER L'USER ID COURANT
-- =====================================================

-- Fonction pour récupérer l'ID utilisateur depuis le JWT Supabase
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS uuid 
LANGUAGE sql 
STABLE
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

-- Fonction pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'user_metadata')::jsonb ->> 'is_admin',
    'false'
  )::boolean
$$;

-- =====================================================
-- 3. POLICIES POUR TABLE USERS
-- =====================================================

-- Les utilisateurs peuvent voir et modifier leurs propres données
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.user_id());

CREATE POLICY "users_update_own" ON users  
  FOR UPDATE USING (id = auth.user_id());

-- Les utilisateurs peuvent s'inscrire (INSERT via Supabase Auth)
CREATE POLICY "users_insert_own" ON users
  FOR INSERT WITH CHECK (id = auth.user_id());

-- Seuls les admins peuvent voir tous les utilisateurs
CREATE POLICY "users_admin_all" ON users
  FOR ALL USING (auth.is_admin());

-- Empêcher la suppression directe (soft delete via is_active)
CREATE POLICY "users_no_delete" ON users
  FOR DELETE USING (false);

-- =====================================================
-- 4. POLICIES POUR TABLE USER_PROFILES
-- =====================================================

-- Les utilisateurs peuvent CRUD leurs propres profils
CREATE POLICY "user_profiles_select_own" ON user_profiles
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "user_profiles_insert_own" ON user_profiles
  FOR INSERT WITH CHECK (user_id = auth.user_id());

CREATE POLICY "user_profiles_update_own" ON user_profiles
  FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY "user_profiles_delete_own" ON user_profiles
  FOR DELETE USING (user_id = auth.user_id());

-- Les admins peuvent tout voir/modifier
CREATE POLICY "user_profiles_admin_all" ON user_profiles
  FOR ALL USING (auth.is_admin());

-- =====================================================
-- 5. POLICIES POUR TABLE RECIPES
-- =====================================================

-- Tout le monde peut voir les recettes publiées
CREATE POLICY "recipes_select_published" ON recipes
  FOR SELECT USING (is_published = true);

-- Seuls les admins peuvent créer/modifier/supprimer des recettes
CREATE POLICY "recipes_admin_insert" ON recipes
  FOR INSERT WITH CHECK (auth.is_admin());

CREATE POLICY "recipes_admin_update" ON recipes
  FOR UPDATE USING (auth.is_admin());

CREATE POLICY "recipes_admin_delete" ON recipes
  FOR DELETE USING (auth.is_admin());

-- Les admins peuvent voir toutes les recettes (même non publiées)
CREATE POLICY "recipes_admin_select_all" ON recipes
  FOR SELECT USING (auth.is_admin());

-- =====================================================
-- 6. POLICIES POUR TABLE WEEKLY_MEAL_PLANS
-- =====================================================

-- Les utilisateurs peuvent CRUD leurs propres plans
CREATE POLICY "weekly_meal_plans_select_own" ON weekly_meal_plans
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "weekly_meal_plans_insert_own" ON weekly_meal_plans
  FOR INSERT WITH CHECK (user_id = auth.user_id());

CREATE POLICY "weekly_meal_plans_update_own" ON weekly_meal_plans
  FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY "weekly_meal_plans_delete_own" ON weekly_meal_plans
  FOR DELETE USING (user_id = auth.user_id());

-- Les admins peuvent tout voir
CREATE POLICY "weekly_meal_plans_admin_all" ON weekly_meal_plans
  FOR ALL USING (auth.is_admin());

-- =====================================================
-- 7. POLICIES POUR TABLE USER_PREFERENCES
-- =====================================================

-- Les utilisateurs peuvent CRUD leurs propres préférences
CREATE POLICY "user_preferences_select_own" ON user_preferences
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "user_preferences_insert_own" ON user_preferences
  FOR INSERT WITH CHECK (user_id = auth.user_id());

CREATE POLICY "user_preferences_update_own" ON user_preferences
  FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY "user_preferences_delete_own" ON user_preferences
  FOR DELETE USING (user_id = auth.user_id());

-- Les admins peuvent tout voir (pour support client)
CREATE POLICY "user_preferences_admin_all" ON user_preferences
  FOR ALL USING (auth.is_admin());

-- =====================================================
-- 8. POLICIES POUR TABLE SUBSCRIPTIONS
-- =====================================================

-- Les utilisateurs peuvent voir leurs propres abonnements
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (user_id = auth.user_id());

-- Seuls les admins et le système peuvent créer/modifier des abonnements
-- (les webhooks Stripe utilisent un service role)
CREATE POLICY "subscriptions_admin_insert" ON subscriptions
  FOR INSERT WITH CHECK (auth.is_admin() OR current_setting('role') = 'service_role');

CREATE POLICY "subscriptions_admin_update" ON subscriptions
  FOR UPDATE USING (auth.is_admin() OR current_setting('role') = 'service_role');

-- Aucune suppression d'abonnement (historique important)
CREATE POLICY "subscriptions_no_delete" ON subscriptions
  FOR DELETE USING (false);

-- Les admins peuvent tout voir
CREATE POLICY "subscriptions_admin_select_all" ON subscriptions
  FOR SELECT USING (auth.is_admin());

-- =====================================================
-- 9. POLICIES POUR TABLE USER_RECIPE_INTERACTIONS
-- =====================================================

-- Les utilisateurs peuvent CRUD leurs propres interactions
CREATE POLICY "user_recipe_interactions_select_own" ON user_recipe_interactions
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "user_recipe_interactions_insert_own" ON user_recipe_interactions
  FOR INSERT WITH CHECK (user_id = auth.user_id());

CREATE POLICY "user_recipe_interactions_update_own" ON user_recipe_interactions
  FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY "user_recipe_interactions_delete_own" ON user_recipe_interactions
  FOR DELETE USING (user_id = auth.user_id());

-- Les admins peuvent tout voir (pour analytics)
CREATE POLICY "user_recipe_interactions_admin_all" ON user_recipe_interactions
  FOR ALL USING (auth.is_admin());

-- =====================================================
-- 10. POLICIES POUR TABLE USER_PROGRESS
-- =====================================================

-- Les utilisateurs peuvent CRUD leurs propres données de progression
CREATE POLICY "user_progress_select_own" ON user_progress
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "user_progress_insert_own" ON user_progress
  FOR INSERT WITH CHECK (user_id = auth.user_id());

CREATE POLICY "user_progress_update_own" ON user_progress
  FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY "user_progress_delete_own" ON user_progress
  FOR DELETE USING (user_id = auth.user_id());

-- Les admins peuvent tout voir (pour support et analytics)
CREATE POLICY "user_progress_admin_all" ON user_progress
  FOR ALL USING (auth.is_admin());

-- =====================================================
-- 11. POLICIES POUR TABLE SHOPPING_LISTS
-- =====================================================

-- Les utilisateurs peuvent CRUD leurs propres listes
CREATE POLICY "shopping_lists_select_own" ON shopping_lists
  FOR SELECT USING (user_id = auth.user_id());

CREATE POLICY "shopping_lists_insert_own" ON shopping_lists
  FOR INSERT WITH CHECK (user_id = auth.user_id());

CREATE POLICY "shopping_lists_update_own" ON shopping_lists
  FOR UPDATE USING (user_id = auth.user_id());

CREATE POLICY "shopping_lists_delete_own" ON shopping_lists
  FOR DELETE USING (user_id = auth.user_id());

-- Les admins peuvent tout voir
CREATE POLICY "shopping_lists_admin_all" ON shopping_lists
  FOR ALL USING (auth.is_admin());

-- =====================================================
-- 12. POLICIES POUR LES VUES
-- =====================================================

-- La vue active_subscribers est accessible aux admins seulement
CREATE POLICY "active_subscribers_admin_only" ON active_subscribers
  FOR SELECT USING (auth.is_admin());

-- La vue recipe_stats est accessible à tous (données publiques agrégées)
-- Pas de RLS nécessaire car c'est basé sur des recettes publiques

-- =====================================================
-- 13. FONCTION DE VÉRIFICATION D'ABONNEMENT ACTIF
-- =====================================================

-- Fonction pour vérifier si un utilisateur a un abonnement actif
CREATE OR REPLACE FUNCTION has_active_subscription(user_uuid uuid DEFAULT auth.user_id())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM subscriptions 
    WHERE user_id = user_uuid 
      AND status = 'active' 
      AND current_period_end > now()
  );
$$;

-- Fonction pour vérifier si un utilisateur peut accéder aux fonctionnalités premium
CREATE OR REPLACE FUNCTION can_access_premium_features(user_uuid uuid DEFAULT auth.user_id())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT has_active_subscription(user_uuid) OR auth.is_admin();
$$;

-- =====================================================
-- 14. POLICIES POUR FONCTIONNALITÉS PREMIUM
-- =====================================================

-- Exemple: Limiter l'accès aux plans alimentaires pour les abonnés seulement
-- (Cette policy remplace weekly_meal_plans_select_own pour ajouter la vérification d'abonnement)

DROP POLICY IF EXISTS "weekly_meal_plans_select_own" ON weekly_meal_plans;

CREATE POLICY "weekly_meal_plans_select_own_premium" ON weekly_meal_plans
  FOR SELECT USING (
    user_id = auth.user_id() 
    AND can_access_premium_features(user_id)
  );

-- Les utilisateurs non-abonnés peuvent seulement voir un plan de démonstration
CREATE POLICY "weekly_meal_plans_select_demo" ON weekly_meal_plans
  FOR SELECT USING (
    user_id = auth.user_id() 
    AND NOT can_access_premium_features(user_id)
    AND created_at >= (now() - interval '7 days') -- Seulement les 7 derniers jours
    LIMIT 1
  );

-- =====================================================
-- 15. AUDIT ET LOGGING
-- =====================================================

-- Table pour audit des actions sensibles
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp DEFAULT now()
);

-- Enable RLS pour les logs d'audit
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent voir les logs d'audit
CREATE POLICY "audit_logs_admin_only" ON audit_logs
  FOR ALL USING (auth.is_admin());

-- Fonction pour créer un log d'audit
CREATE OR REPLACE FUNCTION create_audit_log(
  p_action text,
  p_table_name text,
  p_record_id uuid,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    auth.user_id(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values,
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb ->> 'user-agent'
  );
END;
$$;

-- =====================================================
-- 16. CONTRAINTES DE SÉCURITÉ SUPPLÉMENTAIRES
-- =====================================================

-- Empêcher les utilisateurs de se donner le rôle admin
CREATE OR REPLACE FUNCTION prevent_admin_escalation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Vérifier si un utilisateur non-admin essaie de se donner des privilèges admin
  IF NOT auth.is_admin() AND 
     (NEW.metadata ->> 'is_admin')::boolean = true AND
     (OLD.metadata ->> 'is_admin')::boolean IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Tentative non autorisée d''escalade de privilèges';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_admin_escalation_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_admin_escalation();

-- =====================================================
-- 17. POLICIES DE RATE LIMITING
-- =====================================================

-- Table pour tracker les actions par utilisateur (rate limiting)
CREATE TABLE IF NOT EXISTS user_action_rates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_count integer DEFAULT 1,
  window_start timestamp DEFAULT now(),
  UNIQUE(user_id, action_type, window_start)
);

ALTER TABLE user_action_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_action_rates_own" ON user_action_rates
  FOR ALL USING (user_id = auth.user_id() OR auth.is_admin());

-- Fonction pour vérifier les limites de taux
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_action_type text,
  p_max_actions integer,
  p_window_minutes integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count integer;
  window_start timestamp;
BEGIN
  window_start := date_trunc('hour', now()) + (extract(minute from now())::integer / p_window_minutes) * interval '1 minute' * p_window_minutes;
  
  SELECT action_count INTO current_count
  FROM user_action_rates
  WHERE user_id = auth.user_id()
    AND action_type = p_action_type
    AND window_start = window_start;
  
  IF current_count IS NULL THEN
    INSERT INTO user_action_rates (user_id, action_type, action_count, window_start)
    VALUES (auth.user_id(), p_action_type, 1, window_start);
    RETURN true;
  ELSIF current_count < p_max_actions THEN
    UPDATE user_action_rates 
    SET action_count = action_count + 1
    WHERE user_id = auth.user_id()
      AND action_type = p_action_type
      AND window_start = window_start;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- =====================================================
-- COMMENTAIRES DE DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION auth.user_id() IS 'Récupère l''ID de l''utilisateur connecté depuis le JWT Supabase';
COMMENT ON FUNCTION auth.is_admin() IS 'Vérifie si l''utilisateur connecté a les privilèges administrateur';
COMMENT ON FUNCTION has_active_subscription(uuid) IS 'Vérifie si un utilisateur a un abonnement actif';
COMMENT ON FUNCTION can_access_premium_features(uuid) IS 'Vérifie si un utilisateur peut accéder aux fonctionnalités premium';
COMMENT ON FUNCTION check_rate_limit(text, integer, integer) IS 'Système de rate limiting pour prévenir les abus';

-- =====================================================
-- FIN DES POLICIES RLS
-- =====================================================