-- =====================================================
-- COACH NUTRITIONNEL IA - VUES ET OPTIMISATION
-- =====================================================
-- Version: 1.0
-- Date: 2025-06-23
-- Description: Vues matérialisées, index de performance et optimisations

-- =====================================================
-- 1. VUES POUR FACILITER LES REQUÊTES
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
-- 2. VUES MATÉRIALISÉES POUR PERFORMANCE
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
  (rs.like_count * 0.3 + rs.cooked_count * 0.4 + rs.avg_rating * rs.rating_count * 0.3) as popularity_score,
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
-- 3. VUES POUR ANALYSES ET RAPPORTS
-- =====================================================

-- Vue pour l'analyse des tendances utilisateurs
CREATE VIEW user_engagement_analytics AS
SELECT 
  u.id as user_id,
  u.created_at as registration_date,
  EXTRACT(DAYS FROM (CURRENT_DATE - u.created_at::date)) as days_since_registration,
  up.health_goals,
  up.activity_level,
  s.status as subscription_status,
  -- Engagement avec les recettes
  COUNT(DISTINCT uri.recipe_id) as unique_recipes_viewed,
  COUNT(CASE WHEN uri.is_liked THEN 1 END) as total_likes,
  COUNT(CASE WHEN uri.is_cooked THEN 1 END) as total_recipes_cooked,
  -- Utilisation des plans alimentaires
  COUNT(DISTINCT wmp.id) as meal_plans_created,
  COUNT(CASE WHEN wmp.status = 'completed' THEN 1 END) as meal_plans_completed,
  -- Suivi de progression
  COUNT(DISTINCT prog.recorded_date) as progress_entries,
  -- Score d'engagement calculé
  CASE 
    WHEN COUNT(DISTINCT uri.recipe_id) = 0 THEN 0
    WHEN COUNT(DISTINCT uri.recipe_id) < 5 THEN 1
    WHEN COUNT(CASE WHEN uri.is_cooked THEN 1 END) = 0 THEN 2
    WHEN COUNT(DISTINCT wmp.id) = 0 THEN 3
    WHEN COUNT(DISTINCT prog.recorded_date) = 0 THEN 4
    ELSE 5
  END as engagement_level,
  -- Dernière activité
  GREATEST(
    COALESCE(MAX(uri.last_viewed_at), u.created_at),
    COALESCE(MAX(wmp.updated_at), u.created_at),
    COALESCE(MAX(prog.created_at), u.created_at)
  ) as last_activity_date
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
LEFT JOIN user_recipe_interactions uri ON u.id = uri.user_id
LEFT JOIN weekly_meal_plans wmp ON u.id = wmp.user_id
LEFT JOIN user_progress prog ON u.id = prog.user_id
WHERE u.is_active = true
GROUP BY u.id, u.created_at, up.health_goals, up.activity_level, s.status;

-- Vue pour l'analyse des aliments les plus utilisés
CREATE VIEW ingredient_popularity AS
WITH ingredient_usage AS (
  SELECT 
    ingredient->>'name' as ingredient_name,
    COUNT(*) as recipe_count,
    AVG(r.anti_inflammatory_score) as avg_anti_inflammatory_score,
    AVG(rs.popularity_score) as avg_recipe_popularity
  FROM recipes r
  CROSS JOIN jsonb_array_elements(r.ingredients) as ingredient
  JOIN popular_recipes_mv rs ON r.id = rs.id
  WHERE r.is_published = true
  GROUP BY ingredient->>'name'
)
SELECT 
  iu.ingredient_name,
  iu.recipe_count,
  iu.avg_anti_inflammatory_score,
  iu.avg_recipe_popularity,
  f.category as food_category,
  f.anti_inflammatory_score as food_anti_inflammatory_score,
  f.allergens,
  f.diet_compatibility,
  -- Score de popularité de l'ingrédient
  (iu.recipe_count * 0.4 + iu.avg_recipe_popularity * 0.6) as ingredient_popularity_score
FROM ingredient_usage iu
LEFT JOIN foods f ON f.name_fr ILIKE '%' || iu.ingredient_name || '%'
WHERE iu.recipe_count >= 3  -- Au moins 3 recettes utilisent cet ingrédient
ORDER BY ingredient_popularity_score DESC;

-- =====================================================
-- 4. INDEX COMPOSITES POUR OPTIMISATION
-- =====================================================

-- Index composites pour les requêtes de recommandation
CREATE INDEX idx_recipes_recommendation ON recipes(
  is_published, anti_inflammatory_score DESC, total_time_minutes
) WHERE is_published = true;

-- Index pour les recherches de recettes par type de repas et difficulté
CREATE INDEX idx_recipes_meal_difficulty ON recipes(
  difficulty_level, total_time_minutes
) WHERE is_published = true;

-- Index pour les plans alimentaires par utilisateur et période
CREATE INDEX idx_meal_plans_user_period ON weekly_meal_plans(
  user_id, week_start_date DESC, status
);

-- Index pour les interactions utilisateur-recette
CREATE INDEX idx_user_interactions_composite ON user_recipe_interactions(
  user_id, last_viewed_at DESC, is_liked, is_saved
);

-- Index pour le suivi nutritionnel quotidien
CREATE INDEX idx_daily_tracking_composite ON daily_nutrition_tracking(
  user_id, tracking_date DESC, nutrition_quality_score DESC
);

-- Index pour les recherches de foods
CREATE INDEX idx_foods_category_score ON foods(
  category, anti_inflammatory_score DESC
);

-- Index composite pour les abonnements actifs
CREATE INDEX idx_subscriptions_active_period ON subscriptions(
  status, current_period_end DESC
) WHERE status = 'active';

-- =====================================================
-- 5. INDEX PARTIAL POUR PERFORMANCE
-- =====================================================

-- Index pour les recettes featured uniquement
CREATE INDEX idx_recipes_featured_only ON recipes(
  anti_inflammatory_score DESC, created_at DESC
) WHERE is_featured = true AND is_published = true;

-- Index pour les utilisateurs actifs récents
CREATE INDEX idx_users_recent_active ON users(
  last_login_at DESC
) WHERE is_active = true AND last_login_at > (CURRENT_DATE - INTERVAL '30 days');

-- Index pour les plans alimentaires en cours
CREATE INDEX idx_meal_plans_current ON weekly_meal_plans(
  user_id, week_start_date
) WHERE status IN ('active', 'draft');

-- =====================================================
-- 6. FONCTIONS POUR RAFRAÎCHISSEMENT DES VUES MATÉRIALISÉES
-- =====================================================

-- Fonction pour rafraîchir toutes les vues matérialisées
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  -- Rafraîchir les vues matérialisées en parallèle si possible
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_recipes_mv;
  REFRESH MATERIALIZED VIEW CONCURRENTLY nutrition_insights_mv;
  
  -- Mettre à jour les statistiques des tables
  ANALYZE recipes;
  ANALYZE user_recipe_interactions;
  ANALYZE weekly_meal_plans;
  ANALYZE daily_nutrition_tracking;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour rafraîchir une vue matérialisée spécifique
CREATE OR REPLACE FUNCTION refresh_materialized_view(view_name text)
RETURNS void AS $$
BEGIN
  CASE view_name
    WHEN 'popular_recipes' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY popular_recipes_mv;
    WHEN 'nutrition_insights' THEN
      REFRESH MATERIALIZED VIEW CONCURRENTLY nutrition_insights_mv;
    ELSE
      RAISE EXCEPTION 'Vue matérialisée inconnue: %', view_name;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. VUES POUR LES API ET RAPPORTS
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
  -- Statistiques dynamiques
  rs.like_count,
  rs.saved_count,
  rs.cooked_count,
  rs.avg_rating,
  rs.rating_count,
  rs.popularity_score,
  r.created_at,
  r.updated_at
FROM recipes r
LEFT JOIN popular_recipes_mv rs ON r.id = rs.id
WHERE r.is_published = true;

-- Vue pour les rapports d'usage des fonctionnalités
CREATE VIEW feature_usage_report AS
SELECT 
  'Recettes vues' as feature_name,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_interactions,
  AVG(EXTRACT(EPOCH FROM (last_viewed_at - first_viewed_at))) as avg_session_duration
FROM user_recipe_interactions
WHERE last_viewed_at >= (CURRENT_DATE - INTERVAL '30 days')

UNION ALL

SELECT 
  'Plans alimentaires créés' as feature_name,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_interactions,
  NULL as avg_session_duration
FROM weekly_meal_plans
WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days')

UNION ALL

SELECT 
  'Suivi nutritionnel' as feature_name,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) as total_interactions,
  NULL as avg_session_duration
FROM daily_nutrition_tracking
WHERE tracking_date >= (CURRENT_DATE - INTERVAL '30 days');

-- =====================================================
-- 8. FONCTIONS D'OPTIMISATION ET MAINTENANCE
-- =====================================================

-- Fonction pour analyser les performances et suggérer des optimisations
CREATE OR REPLACE FUNCTION analyze_database_performance()
RETURNS TABLE(
  table_name text,
  table_size text,
  index_usage text,
  suggestions text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
    CASE 
      WHEN idx_scan > seq_scan THEN 'Index utilisé (' || idx_scan || ' vs ' || seq_scan || ')'
      ELSE 'Scan séquentiel fréquent (' || seq_scan || ' vs ' || idx_scan || ')'
    END as index_usage,
    CASE 
      WHEN seq_scan > idx_scan AND seq_scan > 1000 THEN 'Ajouter des index'
      WHEN pg_total_relation_size(schemaname||'.'||tablename) > 100000000 THEN 'Considérer le partitioning'
      ELSE 'Performance correcte'
    END as suggestions
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. COMMENTAIRES DE DOCUMENTATION
-- =====================================================

COMMENT ON VIEW active_subscribers IS 'Vue des utilisateurs avec abonnement actif et leurs informations';
COMMENT ON VIEW recipe_stats IS 'Statistiques complètes des recettes avec interactions utilisateurs';
COMMENT ON VIEW user_dashboard_summary IS 'Résumé pour tableau de bord utilisateur avec toutes les métriques';
COMMENT ON MATERIALIZED VIEW popular_recipes_mv IS 'Vue matérialisée des recettes populaires avec score composite';
COMMENT ON MATERIALIZED VIEW nutrition_insights_mv IS 'Analyses nutritionnelles agrégées par mois';
COMMENT ON VIEW user_engagement_analytics IS 'Analytics d''engagement utilisateur pour améliorer la rétention';
COMMENT ON VIEW ingredient_popularity IS 'Popularité des ingrédients basée sur l''usage dans les recettes';
COMMENT ON VIEW api_recipes_complete IS 'Vue complète des recettes pour API avec toutes les données';
COMMENT ON FUNCTION refresh_materialized_views() IS 'Rafraîchit toutes les vues matérialisées en une fois';
COMMENT ON FUNCTION analyze_database_performance() IS 'Analyse les performances et suggère des optimisations';