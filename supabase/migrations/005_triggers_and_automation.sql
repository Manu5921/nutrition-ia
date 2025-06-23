-- =====================================================
-- COACH NUTRITIONNEL IA - TRIGGERS ET AUTOMATISATION
-- =====================================================
-- Version: 1.0
-- Date: 2025-06-23
-- Description: Triggers pour automatisation et business logic

-- =====================================================
-- 1. TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Fonction générique pour mise à jour du timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour tous les tableaux avec updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at 
  BEFORE UPDATE ON recipes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_meal_plans_updated_at 
  BEFORE UPDATE ON weekly_meal_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_recipe_interactions_updated_at 
  BEFORE UPDATE ON user_recipe_interactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
  BEFORE UPDATE ON user_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_lists_updated_at 
  BEFORE UPDATE ON shopping_lists 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foods_updated_at 
  BEFORE UPDATE ON foods 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_combinations_updated_at 
  BEFORE UPDATE ON food_combinations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_nutrition_analysis_updated_at 
  BEFORE UPDATE ON meal_nutrition_analysis 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_goals_updated_at 
  BEFORE UPDATE ON nutrition_goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_nutrition_tracking_updated_at 
  BEFORE UPDATE ON daily_nutrition_tracking 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. TRIGGERS POUR CALCULS AUTOMATIQUES
-- =====================================================

-- Fonction pour calculer automatiquement les données nutritionnelles du profil
CREATE OR REPLACE FUNCTION calculate_user_nutrition_needs()
RETURNS TRIGGER AS $$
DECLARE
  user_age integer;
  calculated_bmr integer;
  calculated_daily_calories integer;
  calculated_protein_needs integer;
BEGIN
  -- Calculer l'âge si on a la date de naissance
  IF NEW.birth_date IS NOT NULL THEN
    user_age := calculate_age(NEW.birth_date);
    
    -- Calculer le BMR si on a les données nécessaires
    IF NEW.weight_kg IS NOT NULL AND NEW.height_cm IS NOT NULL AND NEW.gender IS NOT NULL THEN
      calculated_bmr := calculate_bmr(NEW.weight_kg, NEW.height_cm, user_age, NEW.gender);
      NEW.bmr_calories := calculated_bmr;
      
      -- Calculer les besoins caloriques quotidiens
      IF NEW.activity_level IS NOT NULL THEN
        calculated_daily_calories := calculate_daily_calories(calculated_bmr, NEW.activity_level);
        NEW.daily_calorie_needs := calculated_daily_calories;
        
        -- Calculer les besoins en protéines (1.2-2.0g par kg selon objectifs)
        calculated_protein_needs := CASE 
          WHEN 'perte_poids' = ANY(NEW.health_goals) THEN ROUND(NEW.weight_kg * 1.6)
          WHEN 'gain_muscle' = ANY(NEW.health_goals) THEN ROUND(NEW.weight_kg * 2.0)
          ELSE ROUND(NEW.weight_kg * 1.2)
        END;
        NEW.protein_needs_g := calculated_protein_needs;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_user_nutrition_needs_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_user_nutrition_needs();

-- =====================================================
-- 3. TRIGGERS POUR MISE À JOUR DES STATISTIQUES
-- =====================================================

-- Fonction pour mettre à jour les statistiques des recettes lors d'interactions
CREATE OR REPLACE FUNCTION update_recipe_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Mise à jour du compteur de likes
  IF (TG_OP = 'INSERT' AND NEW.is_liked = true) OR 
     (TG_OP = 'UPDATE' AND OLD.is_liked = false AND NEW.is_liked = true) THEN
    UPDATE recipes 
    SET like_count = like_count + 1 
    WHERE id = NEW.recipe_id;
  ELSIF (TG_OP = 'UPDATE' AND OLD.is_liked = true AND NEW.is_liked = false) OR
        (TG_OP = 'DELETE' AND OLD.is_liked = true) THEN
    UPDATE recipes 
    SET like_count = GREATEST(0, like_count - 1) 
    WHERE id = COALESCE(NEW.recipe_id, OLD.recipe_id);
  END IF;
  
  -- Mise à jour de la moyenne des ratings
  IF (TG_OP = 'INSERT' AND NEW.rating IS NOT NULL) OR
     (TG_OP = 'UPDATE' AND OLD.rating IS DISTINCT FROM NEW.rating) OR
     (TG_OP = 'DELETE' AND OLD.rating IS NOT NULL) THEN
    
    UPDATE recipes 
    SET 
      rating_avg = (
        SELECT AVG(rating)::decimal(3,2)
        FROM user_recipe_interactions
        WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id) 
          AND rating IS NOT NULL
      ),
      rating_count = (
        SELECT COUNT(*)
        FROM user_recipe_interactions
        WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id) 
          AND rating IS NOT NULL
      )
    WHERE id = COALESCE(NEW.recipe_id, OLD.recipe_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipe_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_recipe_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_recipe_stats();

-- =====================================================
-- 4. TRIGGERS POUR GÉNÉRATION AUTOMATIQUE DE LISTES
-- =====================================================

-- Fonction pour générer automatiquement la liste de courses lors de la création d'un plan
CREATE OR REPLACE FUNCTION auto_generate_shopping_list()
RETURNS TRIGGER AS $$
DECLARE
  generated_list jsonb;
  total_cost decimal;
BEGIN
  -- Générer la liste de courses seulement si elle n'existe pas déjà
  IF NEW.shopping_list IS NULL OR NEW.shopping_list = '[]'::jsonb THEN
    generated_list := generate_shopping_list(NEW.id);
    NEW.shopping_list := generated_list;
    
    -- Calculer le coût total estimé
    SELECT SUM((item->>'estimated_cost')::decimal)
    INTO total_cost
    FROM jsonb_array_elements(generated_list) AS item;
    
    NEW.total_estimated_cost_euro := COALESCE(total_cost, 0);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_shopping_list_trigger
  BEFORE INSERT OR UPDATE ON weekly_meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_shopping_list();

-- =====================================================
-- 5. TRIGGERS POUR VALIDATION ET BUSINESS RULES
-- =====================================================

-- Fonction pour valider les données du profil utilisateur
CREATE OR REPLACE FUNCTION validate_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Validation de l'âge (doit être entre 16 et 120 ans)
  IF NEW.birth_date IS NOT NULL THEN
    IF calculate_age(NEW.birth_date) < 16 OR calculate_age(NEW.birth_date) > 120 THEN
      RAISE EXCEPTION 'Âge invalide: doit être entre 16 et 120 ans';
    END IF;
  END IF;
  
  -- Validation du poids cible par rapport au poids actuel
  IF NEW.weight_kg IS NOT NULL AND NEW.target_weight_kg IS NOT NULL THEN
    IF ABS(NEW.target_weight_kg - NEW.weight_kg) > NEW.weight_kg * 0.3 THEN
      RAISE EXCEPTION 'Objectif de poids trop extrême: maximum 30%% du poids actuel';
    END IF;
  END IF;
  
  -- Validation de la cohérence des données physiques
  IF NEW.weight_kg IS NOT NULL AND NEW.height_cm IS NOT NULL THEN
    DECLARE
      bmi decimal := NEW.weight_kg / POWER(NEW.height_cm / 100.0, 2);
    BEGIN
      IF bmi < 10 OR bmi > 60 THEN
        RAISE EXCEPTION 'Données physiques incohérentes (BMI: %)', ROUND(bmi, 1);
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_user_profile_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_profile();

-- =====================================================
-- 6. TRIGGERS POUR AUDIT ET LOGGING
-- =====================================================

-- Fonction pour auditer les changements sensibles
CREATE OR REPLACE FUNCTION audit_sensitive_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Auditer les changements de statut d'abonnement
  IF TG_TABLE_NAME = 'subscriptions' AND 
     (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN
    PERFORM create_audit_log(
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
      to_jsonb(NEW)
    );
  END IF;
  
  -- Auditer les changements de données utilisateur critiques
  IF TG_TABLE_NAME = 'users' AND TG_OP = 'UPDATE' AND 
     (OLD.email IS DISTINCT FROM NEW.email OR 
      OLD.is_active IS DISTINCT FROM NEW.is_active OR
      OLD.metadata IS DISTINCT FROM NEW.metadata) THEN
    PERFORM create_audit_log(
      'UPDATE_CRITICAL',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_subscriptions_trigger
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION audit_sensitive_changes();

CREATE TRIGGER audit_users_trigger
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION audit_sensitive_changes();

-- =====================================================
-- 7. TRIGGERS POUR MISE À JOUR DES OBJECTIFS NUTRITIONNELS
-- =====================================================

-- Fonction pour créer automatiquement des objectifs nutritionnels lors de la création d'un profil
CREATE OR REPLACE FUNCTION create_default_nutrition_goals()
RETURNS TRIGGER AS $$
DECLARE
  daily_calories integer;
  protein_target decimal;
  carbs_target decimal;
  fat_target decimal;
BEGIN
  -- Créer des objectifs par défaut seulement si le profil est complet
  IF NEW.daily_calorie_needs IS NOT NULL AND NEW.protein_needs_g IS NOT NULL THEN
    daily_calories := NEW.daily_calorie_needs;
    protein_target := NEW.protein_needs_g;
    
    -- Calculer les macros selon les recommandations (50% glucides, 20% protéines, 30% lipides)
    carbs_target := (daily_calories * 0.50) / 4; -- 4 kcal par gramme de glucides
    fat_target := (daily_calories * 0.30) / 9;   -- 9 kcal par gramme de lipides
    
    INSERT INTO nutrition_goals (
      user_id,
      daily_calories_target,
      daily_calories_min,
      daily_calories_max,
      protein_target_g,
      carbs_target_g,
      fat_target_g,
      fiber_target_g,
      sodium_limit_mg,
      sugar_limit_g,
      goal_reason,
      is_active
    ) VALUES (
      NEW.user_id,
      daily_calories,
      ROUND(daily_calories * 0.8),
      ROUND(daily_calories * 1.2),
      protein_target,
      carbs_target,
      fat_target,
      25, -- 25g de fibres recommandés
      2300, -- Limite sodium (mg)
      50, -- Limite sucre (g)
      'objectif_initial',
      true
    ) ON CONFLICT (user_id, valid_from) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_default_nutrition_goals_trigger
  AFTER INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  WHEN (NEW.daily_calorie_needs IS NOT NULL AND NEW.protein_needs_g IS NOT NULL)
  EXECUTE FUNCTION create_default_nutrition_goals();

-- =====================================================
-- 8. TRIGGERS POUR NETTOYAGE AUTOMATIQUE
-- =====================================================

-- Fonction pour nettoyer les données temporaires anciennes
CREATE OR REPLACE FUNCTION cleanup_temporary_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Nettoyer les anciens rate limiting (garde seulement 7 jours)
  DELETE FROM user_action_rates 
  WHERE window_start < (CURRENT_TIMESTAMP - INTERVAL '7 days');
  
  -- Nettoyer les anciennes analyses nutritionnelles (garde seulement 1 an)
  DELETE FROM meal_nutrition_analysis 
  WHERE analysis_date < (CURRENT_DATE - INTERVAL '1 year');
  
  RETURN NULL; -- Trigger AFTER, peu importe le retour
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger qui se déclenche quotidiennement (via cron job ou fonction programmée)
-- Ce trigger sera appelé par une tâche cron externe

-- =====================================================
-- 9. TRIGGERS POUR VALIDATION DES PLANS ALIMENTAIRES
-- =====================================================

-- Fonction pour valider un plan alimentaire avant insertion/modification
CREATE OR REPLACE FUNCTION validate_meal_plan_data()
RETURNS TRIGGER AS $$
DECLARE
  validation_result jsonb;
BEGIN
  -- Valider le plan alimentaire
  validation_result := validate_meal_plan(NEW.meals, NEW.user_id);
  
  -- Si des erreurs critiques sont détectées, empêcher l'insertion
  IF (validation_result->>'valid')::boolean = false AND 
     jsonb_array_length(validation_result->'errors') > 0 THEN
    RAISE EXCEPTION 'Plan alimentaire invalide: %', validation_result->'errors';
  END IF;
  
  -- Calculer le score anti-inflammatoire moyen
  IF NEW.anti_inflammatory_score_avg IS NULL THEN
    -- Extraire les recipe_ids et calculer le score
    WITH recipe_list AS (
      SELECT (jsonb_path_query_array(NEW.meals, '$.**."recipe_id"'))::text::uuid[] as recipe_ids
    )
    SELECT calculate_meal_anti_inflammatory_score(recipe_ids)
    INTO NEW.anti_inflammatory_score_avg
    FROM recipe_list;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_meal_plan_data_trigger
  BEFORE INSERT OR UPDATE ON weekly_meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION validate_meal_plan_data();

-- =====================================================
-- 10. COMMENTAIRES DE DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION update_updated_at_column() IS 'Met à jour automatiquement le timestamp updated_at';
COMMENT ON FUNCTION calculate_user_nutrition_needs() IS 'Calcule automatiquement BMR, calories et besoins nutritionnels';
COMMENT ON FUNCTION update_recipe_stats() IS 'Met à jour les statistiques des recettes (likes, ratings)';
COMMENT ON FUNCTION auto_generate_shopping_list() IS 'Génère automatiquement la liste de courses pour un plan alimentaire';
COMMENT ON FUNCTION validate_user_profile() IS 'Valide la cohérence des données du profil utilisateur';
COMMENT ON FUNCTION audit_sensitive_changes() IS 'Crée des logs d\'audit pour les changements sensibles';
COMMENT ON FUNCTION create_default_nutrition_goals() IS 'Crée automatiquement des objectifs nutritionnels par défaut';
COMMENT ON FUNCTION cleanup_temporary_data() IS 'Nettoie automatiquement les données temporaires anciennes';
COMMENT ON FUNCTION validate_meal_plan_data() IS 'Valide les données d\'un plan alimentaire avant sauvegarde';