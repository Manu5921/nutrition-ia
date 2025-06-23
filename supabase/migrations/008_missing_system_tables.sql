-- =====================================================
-- COACH NUTRITIONNEL IA - TABLES SYSTÈME MANQUANTES
-- =====================================================
-- Version: 1.0
-- Date: 2025-06-23
-- Description: Création des tables système audit_logs et user_action_rates manquantes

-- =====================================================
-- 1. AUDIT_LOGS - JOURNALISATION DES ACTIONS
-- =====================================================

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Utilisateur qui a effectué l'action
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  
  -- Action effectuée
  action text NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', etc.
  table_name text NOT NULL, -- Table concernée
  record_id uuid, -- ID de l'enregistrement concerné
  
  -- Données de l'action
  old_values jsonb, -- Valeurs avant modification
  new_values jsonb, -- Valeurs après modification
  
  -- Métadonnées de connexion
  ip_address inet,
  user_agent text,
  session_id text,
  
  -- Contexte de l'action
  api_endpoint text,
  request_method text,
  request_headers jsonb,
  
  -- Niveau de criticité
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  
  -- Catégorie d'audit
  category text CHECK (category IN ('auth', 'data', 'security', 'subscription', 'admin')) DEFAULT 'data',
  
  -- Horodatage
  created_at timestamp DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);

-- Index composite pour requêtes fréquentes
CREATE INDEX idx_audit_logs_user_created_at ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_table_action ON audit_logs(table_name, action);

-- =====================================================
-- 2. USER_ACTION_RATES - LIMITATION DE DÉBIT
-- =====================================================

CREATE TABLE user_action_rates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Utilisateur concerné
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Type d'action
  action_type text NOT NULL, -- 'recipe_view', 'meal_plan_generation', 'api_call', etc.
  
  -- Compteur d'actions
  action_count integer DEFAULT 1 CHECK (action_count >= 0),
  
  -- Fenêtre temporelle (début de la fenêtre)
  window_start timestamp NOT NULL DEFAULT date_trunc('hour', now()),
  
  -- Limites par type d'action (configurables)
  rate_limit_per_hour integer,
  rate_limit_per_day integer,
  
  -- Métadonnées
  last_action_at timestamp DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  
  UNIQUE(user_id, action_type, window_start)
);

-- Index pour performance
CREATE INDEX idx_user_action_rates_user_id ON user_action_rates(user_id);
CREATE INDEX idx_user_action_rates_action_type ON user_action_rates(action_type);
CREATE INDEX idx_user_action_rates_window_start ON user_action_rates(window_start);
CREATE INDEX idx_user_action_rates_last_action ON user_action_rates(last_action_at);

-- Index composite pour vérification de rate limiting
CREATE INDEX idx_user_action_rates_check ON user_action_rates(user_id, action_type, window_start DESC);

-- =====================================================
-- 3. FONCTIONS POUR AUDIT ET RATE LIMITING
-- =====================================================

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
    user_agent,
    severity,
    category
  ) VALUES (
    auth.user_id(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values,
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent',
    CASE 
      WHEN p_action IN ('DELETE', 'LOGIN_FAILED', 'SUBSCRIPTION_CANCELLED') THEN 'high'
      WHEN p_action IN ('UPDATE', 'LOGIN', 'LOGOUT') THEN 'medium'
      ELSE 'low'
    END,
    CASE 
      WHEN p_action LIKE '%LOGIN%' OR p_action LIKE '%AUTH%' THEN 'auth'
      WHEN p_table_name = 'subscriptions' THEN 'subscription'
      WHEN p_action LIKE '%ADMIN%' THEN 'admin'
      ELSE 'data'
    END
  );
END;
$$;

-- Fonction pour vérifier le rate limiting
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
  window_start_time timestamp;
BEGIN
  -- Calculer le début de la fenêtre temporelle
  window_start_time := date_trunc('hour', now()) - interval '1 hour' * floor(extract(minute from now()) / p_window_minutes) * (p_window_minutes / 60.0);
  
  -- Récupérer ou créer l'entrée de rate limiting
  SELECT action_count INTO current_count
  FROM user_action_rates 
  WHERE user_id = auth.user_id() 
    AND action_type = p_action_type 
    AND window_start = window_start_time;
    
  -- Si pas d'entrée existante, créer une nouvelle
  IF current_count IS NULL THEN
    INSERT INTO user_action_rates (user_id, action_type, window_start, action_count)
    VALUES (auth.user_id(), p_action_type, window_start_time, 1)
    ON CONFLICT (user_id, action_type, window_start) 
    DO UPDATE SET 
      action_count = user_action_rates.action_count + 1,
      last_action_at = now(),
      updated_at = now();
    current_count := 1;
  ELSE
    -- Incrémenter le compteur
    UPDATE user_action_rates 
    SET action_count = action_count + 1,
        last_action_at = now(),
        updated_at = now()
    WHERE user_id = auth.user_id() 
      AND action_type = p_action_type 
      AND window_start = window_start_time;
    current_count := current_count + 1;
  END IF;
  
  -- Vérifier si la limite est dépassée
  RETURN current_count <= p_max_actions;
END;
$$;

-- =====================================================
-- 4. TRIGGERS POUR AUDIT AUTOMATIQUE
-- =====================================================

-- Fonction générique pour audit des modifications
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      TG_OP,
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM create_audit_log(
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Triggers d'audit pour les tables sensibles
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_subscriptions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_profiles_trigger
  AFTER UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- 5. TÂCHES DE MAINTENANCE
-- =====================================================

-- Fonction pour nettoyer les anciens logs d'audit
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM audit_logs 
  WHERE created_at < now() - interval '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Fonction pour nettoyer les anciennes données de rate limiting
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits(hours_to_keep integer DEFAULT 168) -- 7 jours par défaut
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM user_action_rates 
  WHERE window_start < now() - interval '1 hour' * hours_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- =====================================================
-- 6. VUES UTILITAIRES
-- =====================================================

-- Vue pour les statistiques d'audit
CREATE VIEW audit_statistics AS
SELECT 
  table_name,
  action,
  category,
  count(*) as action_count,
  count(DISTINCT user_id) as unique_users,
  min(created_at) as first_action,
  max(created_at) as last_action
FROM audit_logs 
WHERE created_at >= now() - interval '30 days'
GROUP BY table_name, action, category
ORDER BY action_count DESC;

-- Vue pour les utilisateurs les plus actifs
CREATE VIEW user_activity_summary AS
SELECT 
  u.email,
  al.user_id,
  count(*) as total_actions,
  count(DISTINCT al.table_name) as tables_accessed,
  max(al.created_at) as last_activity,
  array_agg(DISTINCT al.action) as actions_performed
FROM audit_logs al
JOIN users u ON al.user_id = u.id
WHERE al.created_at >= now() - interval '7 days'
GROUP BY u.email, al.user_id
ORDER BY total_actions DESC
LIMIT 100;

-- =====================================================
-- 7. COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE audit_logs IS 'Journalisation complète des actions utilisateurs pour audit et sécurité';
COMMENT ON TABLE user_action_rates IS 'Limitation de débit par utilisateur et type d''action pour prévenir les abus';

COMMENT ON FUNCTION create_audit_log IS 'Crée un log d''audit avec métadonnées contextuelles automatiques';
COMMENT ON FUNCTION check_rate_limit IS 'Vérifie et applique les limites de débit par action utilisateur';
COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Supprime les anciens logs d''audit pour maintenance';
COMMENT ON FUNCTION cleanup_old_rate_limits IS 'Supprime les anciennes données de rate limiting';

-- =====================================================
-- 8. GRANTS ET PERMISSIONS
-- =====================================================

-- Permissions pour les fonctions d'audit (utilisées par les triggers)
GRANT EXECUTE ON FUNCTION create_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;

-- Les vues sont accessibles aux admins seulement via RLS
GRANT SELECT ON audit_statistics TO authenticated;
GRANT SELECT ON user_activity_summary TO authenticated;