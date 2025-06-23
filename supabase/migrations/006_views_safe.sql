-- =====================================================
-- COACH NUTRITIONNEL IA - VUES ET OPTIMISATION (SAFE)
-- =====================================================
-- Version: 1.0 Safe
-- Date: 2025-06-23
-- Description: Vues avec nettoyage préalable pour éviter les conflits

-- =====================================================
-- 1. NETTOYAGE DES VUES EXISTANTES
-- =====================================================

-- Supprimer les vues dans l'ordre de dépendance (dépendantes d'abord)
DROP VIEW IF EXISTS feature_usage_report CASCADE;
DROP VIEW IF EXISTS api_recipes_complete CASCADE;
DROP VIEW IF EXISTS ingredient_popularity CASCADE;
DROP VIEW IF EXISTS user_engagement_analytics CASCADE;
DROP VIEW IF EXISTS user_dashboard_summary CASCADE;
DROP VIEW IF EXISTS recipe_stats CASCADE;
DROP VIEW IF EXISTS active_subscribers CASCADE;

-- Supprimer les vues matérialisées
DROP MATERIALIZED VIEW IF EXISTS nutrition_insights_mv CASCADE;
DROP MATERIALIZED VIEW IF EXISTS popular_recipes_mv CASCADE;

-- Supprimer les fonctions si elles existent
DROP FUNCTION IF EXISTS refresh_materialized_views() CASCADE;
DROP FUNCTION IF EXISTS refresh_materialized_view(text) CASCADE;
DROP FUNCTION IF EXISTS analyze_database_performance() CASCADE;

-- =====================================================
-- 2. VUES POUR FACILITER LES REQUÊTES
-- =====================================================

-- Vue pour les utilisateurs actifs avec abonnement
CREATE VIEW active_subscribers AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.last_login_at,
  s.status as subscription_status,
  s.current_period_start,
  s.current_period_end,
  s.amount_euro,
  s.interval_type,
  up.first_name,
  up.last_name
FROM users u
INNER JOIN subscriptions s ON u.id = s.user_id
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.is_active = true 
  AND s.status = 'active'
  AND s.current_period_end > now();

-- Vue pour les statistiques des recettes
CREATE VIEW recipe_stats AS
SELECT 
  r.id,
  r.name,
  r.slug,
  r.anti_inflammatory_score,
  r.difficulty_level,
  r.total_time_minutes,
  r.cost_per_serving_euro,
  r.meal_type,
  r.diet_tags,
  r.is_featured,
  COUNT(uri.id) as interaction_count,
  COUNT(CASE WHEN uri.is_liked THEN 1 END) as like_count,
  COUNT(CASE WHEN uri.is_saved THEN 1 END) as saved_count,
  COUNT(CASE WHEN uri.is_cooked THEN 1 END) as cooked_count,
  AVG(uri.rating)::decimal(3,2) as avg_rating,
  COUNT(CASE WHEN uri.rating IS NOT NULL THEN 1 END) as rating_count,
  r.view_count,
  r.created_at,
  r.updated_at
FROM recipes r
LEFT JOIN user_recipe_interactions uri ON r.id = uri.recipe_id
WHERE r.is_published = true
GROUP BY r.id, r.name, r.slug, r.anti_inflammatory_score, r.difficulty_level, 
         r.total_time_minutes, r.cost_per_serving_euro, r.meal_type, r.diet_tags,
         r.is_featured, r.view_count, r.created_at, r.updated_at;

-- Vue pour le tableau de bord utilisateur
CREATE VIEW user_dashboard_summary AS
SELECT 
  u.id as user_id,
  u.email,
  up.first_name,
  up.last_name,
  up.weight_kg,
  up.daily_calorie_needs,
  up.health_goals,
  -- Statistiques d'interaction avec les recettes
  COUNT(CASE WHEN uri.is_liked THEN 1 END) as recipes_liked,
  COUNT(CASE WHEN uri.is_saved THEN 1 END) as recipes_saved,
  COUNT(CASE WHEN uri.is_cooked THEN 1 END) as recipes_cooked,
  -- Plans alimentaires
  COUNT(DISTINCT wmp.id) as meal_plans_created,
  COUNT(CASE WHEN wmp.status = 'active' THEN 1 END) as active_meal_plans,
  -- Progression récente
  (SELECT weight_kg FROM user_progress WHERE user_id = u.id ORDER BY recorded_date DESC LIMIT 1) as latest_weight,
  (SELECT recorded_date FROM user_progress WHERE user_id = u.id ORDER BY recorded_date DESC LIMIT 1) as latest_progress_date,
  -- Score anti-inflammatoire moyen
  AVG(r.anti_inflammatory_score) as avg_anti_inflammatory_score,
  -- Abonnement
  s.status as subscription_status,
  s.current_period_end
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_recipe_interactions uri ON u.id = uri.user_id
LEFT JOIN recipes r ON uri.recipe_id = r.id AND uri.is_cooked = true
LEFT JOIN weekly_meal_plans wmp ON u.id = wmp.user_id
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
WHERE u.is_active = true
GROUP BY u.id, u.email, up.first_name, up.last_name, up.weight_kg, 
         up.daily_calorie_needs, up.health_goals, s.status, s.current_period_end;

-- =====================================================
-- 3. VUES MATÉRIALISÉES POUR PERFORMANCE
-- =====================================================

-- Vue matérialisée pour les recommandations populaires
CREATE MATERIALIZED VIEW popular_recipes_mv AS
SELECT 
  r.id,
  r.name,
  r.slug,
  r.short_description,
  r.image_url,
  r.anti_inflammatory_score,
  r.difficulty_level,
  r.total_time_minutes,
  r.meal_type,
  r.diet_tags,
  r.cost_per_serving_euro,
  rs.like_count,
  rs.cooked_count,
  rs.avg_rating,
  rs.rating_count,
  -- Score de popularité composite
  (rs.like_count * 0.3 + rs.cooked_count * 0.4 + COALESCE(rs.avg_rating * rs.rating_count, 0) * 0.3) as popularity_score,
  r.created_at
FROM recipes r
JOIN recipe_stats rs ON r.id = rs.id
WHERE r.is_published = true
ORDER BY popularity_score DESC;

-- Index sur la vue matérialisée
CREATE INDEX idx_popular_recipes_mv_popularity ON popular_recipes_mv(popularity_score DESC);
CREATE INDEX idx_popular_recipes_mv_meal_type ON popular_recipes_mv USING GIN(meal_type);
CREATE INDEX idx_popular_recipes_mv_diet_tags ON popular_recipes_mv USING GIN(diet_tags);

-- Vue matérialisée pour les analyses nutritionnelles agrégées
CREATE MATERIALIZED VIEW nutrition_insights_mv AS
SELECT 
  date_trunc('month', dnt.tracking_date) as month,
  COUNT(DISTINCT dnt.user_id) as active_users,
  AVG(dnt.calories_consumed) as avg_calories_consumed,
  AVG(dnt.daily_anti_inflammatory_score) as avg_anti_inflammatory_score,
  AVG(dnt.nutrition_quality_score) as avg_nutrition_quality,
  AVG(dnt.diet_adherence_score) as avg_diet_adherence,
  AVG(dnt.energy_level) as avg_energy_level,
  AVG(dnt.hunger_satisfaction) as avg_hunger_satisfaction,
  -- Répartition des objectifs nutritionnels
  COUNT(CASE WHEN dnt.protein_goal_percentage >= 100 THEN 1 END) * 100.0 / COUNT(*) as protein_goal_achievement_rate,
  COUNT(CASE WHEN dnt.carbs_goal_percentage >= 100 THEN 1 END) * 100.0 / COUNT(*) as carbs_goal_achievement_rate,
  COUNT(CASE WHEN dnt.fat_goal_percentage >= 100 THEN 1 END) * 100.0 / COUNT(*) as fat_goal_achievement_rate
FROM daily_nutrition_tracking dnt
WHERE dnt.tracking_date >= (CURRENT_DATE - INTERVAL '12 months')
GROUP BY date_trunc('month', dnt.tracking_date)
ORDER BY month DESC;

-- =====================================================
-- 4. INDEX COMPOSITES POUR OPTIMISATION
-- =====================================================

-- Index composites pour les requêtes de recommandation
DROP INDEX IF EXISTS idx_recipes_recommendation;
CREATE INDEX idx_recipes_recommendation ON recipes(
  is_published, anti_inflammatory_score DESC, total_time_minutes
) WHERE is_published = true;

-- Index pour les recherches de recettes par type de repas et difficulté
DROP INDEX IF EXISTS idx_recipes_meal_difficulty;
CREATE INDEX idx_recipes_meal_difficulty ON recipes(
  difficulty_level, total_time_minutes
) WHERE is_published = true;

-- Index pour les plans alimentaires par utilisateur et période
DROP INDEX IF EXISTS idx_meal_plans_user_period;
CREATE INDEX idx_meal_plans_user_period ON weekly_meal_plans(
  user_id, week_start_date DESC, status
);

-- Index pour les interactions utilisateur-recette
DROP INDEX IF EXISTS idx_user_interactions_composite;
CREATE INDEX idx_user_interactions_composite ON user_recipe_interactions(
  user_id, last_viewed_at DESC, is_liked, is_saved
);

-- Index pour le suivi nutritionnel quotidien
DROP INDEX IF EXISTS idx_daily_tracking_composite;
CREATE INDEX idx_daily_tracking_composite ON daily_nutrition_tracking(
  user_id, tracking_date DESC, nutrition_quality_score DESC
);

-- =====================================================
-- 5. FONCTIONS POUR RAFRAÎCHISSEMENT DES VUES MATÉRIALISÉES
-- =====================================================

-- Fonction pour rafraîchir toutes les vues matérialisées
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  -- Rafraîchir les vues matérialisées
  REFRESH MATERIALIZED VIEW popular_recipes_mv;
  REFRESH MATERIALIZED VIEW nutrition_insights_mv;
  
  -- Mettre à jour les statistiques des tables
  ANALYZE recipes;
  ANALYZE user_recipe_interactions;
  ANALYZE weekly_meal_plans;
  ANALYZE daily_nutrition_tracking;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. VUES POUR LES API
-- =====================================================

-- Vue pour l'API des recettes avec toutes les données nécessaires
CREATE VIEW api_recipes_complete AS
SELECT 
  r.id,
  r.name,
  r.slug,
  r.description,
  r.short_description,
  r.ingredients,
  r.instructions,
  r.tips,
  r.nutrition_facts,
  r.anti_inflammatory_score,
  r.servings,
  r.prep_time_minutes,
  r.cook_time_minutes,
  r.total_time_minutes,
  r.difficulty_level,
  r.meal_type,
  r.diet_tags,
  r.season,
  r.cost_per_serving_euro,
  r.cost_category,
  r.image_url,
  r.images_urls,
  r.video_url,
  r.is_featured,
  -- Statistiques dynamiques depuis recipe_stats
  rst.like_count,
  rst.saved_count,
  rst.cooked_count,
  rst.avg_rating,
  rst.rating_count,
  -- Score de popularité depuis la vue matérialisée
  COALESCE(rs.popularity_score, 0) as popularity_score,
  r.created_at,
  r.updated_at
FROM recipes r
LEFT JOIN recipe_stats rst ON r.id = rst.id
LEFT JOIN popular_recipes_mv rs ON r.id = rs.id
WHERE r.is_published = true;

-- =====================================================
-- 7. COMMENTAIRES DE DOCUMENTATION
-- =====================================================

COMMENT ON VIEW active_subscribers IS 'Vue des utilisateurs avec abonnement actif et leurs informations';
COMMENT ON VIEW recipe_stats IS 'Statistiques complètes des recettes avec interactions utilisateurs';
COMMENT ON VIEW user_dashboard_summary IS 'Résumé pour tableau de bord utilisateur avec toutes les métriques';
COMMENT ON MATERIALIZED VIEW popular_recipes_mv IS 'Vue matérialisée des recettes populaires avec score composite';
COMMENT ON MATERIALIZED VIEW nutrition_insights_mv IS 'Analyses nutritionnelles agrégées par mois';
COMMENT ON VIEW api_recipes_complete IS 'Vue complète des recettes pour API avec toutes les données';
COMMENT ON FUNCTION refresh_materialized_views() IS 'Rafraîchit toutes les vues matérialisées en une fois';