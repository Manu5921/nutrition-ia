-- =====================================================
-- COACH NUTRITIONNEL IA - FONCTIONS DE BACKUP ET MAINTENANCE
-- =====================================================
-- Version: 1.0
-- Date: 2025-06-23
-- Description: Fonctions pour backup, restore et maintenance de la base de données

-- =====================================================
-- 1. FONCTIONS DE BACKUP
-- =====================================================

-- Fonction pour créer un backup des données utilisateur
CREATE OR REPLACE FUNCTION create_user_backup(user_uuid uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  backup_data jsonb := '{}'::jsonb;
  user_data jsonb;
  profile_data jsonb;
  preferences_data jsonb;
  interactions_data jsonb;
  progress_data jsonb;
  meal_plans_data jsonb;
  nutrition_goals_data jsonb;
  tracking_data jsonb;
BEGIN
  -- Vérifier que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = user_uuid) THEN
    RAISE EXCEPTION 'Utilisateur non trouvé: %', user_uuid;
  END IF;
  
  -- Backup des données utilisateur
  SELECT to_jsonb(u.*) INTO user_data
  FROM users u
  WHERE u.id = user_uuid;
  
  -- Backup du profil
  SELECT to_jsonb(up.*) INTO profile_data
  FROM user_profiles up
  WHERE up.user_id = user_uuid;
  
  -- Backup des préférences
  SELECT to_jsonb(upr.*) INTO preferences_data
  FROM user_preferences upr
  WHERE upr.user_id = user_uuid;
  
  -- Backup des interactions avec les recettes
  SELECT jsonb_agg(to_jsonb(uri.*)) INTO interactions_data
  FROM user_recipe_interactions uri
  WHERE uri.user_id = user_uuid;
  
  -- Backup de la progression
  SELECT jsonb_agg(to_jsonb(up.*)) INTO progress_data
  FROM user_progress up
  WHERE up.user_id = user_uuid;
  
  -- Backup des plans alimentaires
  SELECT jsonb_agg(to_jsonb(wmp.*)) INTO meal_plans_data
  FROM weekly_meal_plans wmp
  WHERE wmp.user_id = user_uuid;
  
  -- Backup des objectifs nutritionnels
  SELECT jsonb_agg(to_jsonb(ng.*)) INTO nutrition_goals_data
  FROM nutrition_goals ng
  WHERE ng.user_id = user_uuid;
  
  -- Backup du suivi nutritionnel
  SELECT jsonb_agg(to_jsonb(dnt.*)) INTO tracking_data
  FROM daily_nutrition_tracking dnt
  WHERE dnt.user_id = user_uuid;
  
  -- Construire le backup complet
  backup_data := jsonb_build_object(
    'backup_date', CURRENT_TIMESTAMP,
    'user_id', user_uuid,
    'version', '1.0',
    'data', jsonb_build_object(
      'user', user_data,
      'profile', profile_data,
      'preferences', preferences_data,
      'recipe_interactions', COALESCE(interactions_data, '[]'::jsonb),
      'progress', COALESCE(progress_data, '[]'::jsonb),
      'meal_plans', COALESCE(meal_plans_data, '[]'::jsonb),
      'nutrition_goals', COALESCE(nutrition_goals_data, '[]'::jsonb),
      'nutrition_tracking', COALESCE(tracking_data, '[]'::jsonb)
    )
  );
  
  RETURN backup_data;
END;
$$;

-- Fonction pour créer un backup complet de la base
CREATE OR REPLACE FUNCTION create_full_backup()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  backup_data jsonb := '{}'::jsonb;
  foods_data jsonb;
  recipes_data jsonb;
  combinations_data jsonb;
  stats jsonb;
BEGIN
  -- Backup des aliments
  SELECT jsonb_agg(to_jsonb(f.*)) INTO foods_data
  FROM foods f;
  
  -- Backup des recettes
  SELECT jsonb_agg(to_jsonb(r.*)) INTO recipes_data
  FROM recipes r
  WHERE r.is_published = true;
  
  -- Backup des combinaisons alimentaires
  SELECT jsonb_agg(to_jsonb(fc.*)) INTO combinations_data
  FROM food_combinations fc;
  
  -- Statistiques générales
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM users WHERE is_active = true),
    'total_recipes', (SELECT COUNT(*) FROM recipes WHERE is_published = true),
    'total_foods', (SELECT COUNT(*) FROM foods),
    'active_subscriptions', (SELECT COUNT(*) FROM subscriptions WHERE status = 'active')
  ) INTO stats;
  
  backup_data := jsonb_build_object(
    'backup_date', CURRENT_TIMESTAMP,
    'backup_type', 'full',
    'version', '1.0',
    'statistics', stats,
    'data', jsonb_build_object(
      'foods', COALESCE(foods_data, '[]'::jsonb),
      'recipes', COALESCE(recipes_data, '[]'::jsonb),
      'food_combinations', COALESCE(combinations_data, '[]'::jsonb)
    )
  );
  
  RETURN backup_data;
END;
$$;

-- =====================================================
-- 2. FONCTIONS DE RESTORE
-- =====================================================

-- Fonction pour restaurer les données d'un utilisateur
CREATE OR REPLACE FUNCTION restore_user_data(backup_data jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_uuid uuid;
  data_section jsonb;
BEGIN
  -- Vérifier la structure du backup
  IF NOT (backup_data ? 'user_id' AND backup_data ? 'data') THEN
    RAISE EXCEPTION 'Format de backup invalide';
  END IF;
  
  user_uuid := (backup_data->>'user_id')::uuid;
  data_section := backup_data->'data';
  
  -- Restaurer dans une transaction
  BEGIN
    -- Restaurer le profil utilisateur si présent
    IF data_section ? 'profile' AND data_section->'profile' IS NOT NULL THEN
      INSERT INTO user_profiles SELECT * FROM jsonb_populate_record(null::user_profiles, data_section->'profile')
      ON CONFLICT (user_id) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        birth_date = EXCLUDED.birth_date,
        gender = EXCLUDED.gender,
        weight_kg = EXCLUDED.weight_kg,
        height_cm = EXCLUDED.height_cm,
        activity_level = EXCLUDED.activity_level,
        health_goals = EXCLUDED.health_goals,
        updated_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- Restaurer les préférences
    IF data_section ? 'preferences' AND data_section->'preferences' IS NOT NULL THEN
      INSERT INTO user_preferences SELECT * FROM jsonb_populate_record(null::user_preferences, data_section->'preferences')
      ON CONFLICT (user_id) DO UPDATE SET
        favorite_cuisines = EXCLUDED.favorite_cuisines,
        disliked_ingredients = EXCLUDED.disliked_ingredients,
        preferred_cooking_methods = EXCLUDED.preferred_cooking_methods,
        meal_times = EXCLUDED.meal_times,
        notification_preferences = EXCLUDED.notification_preferences,
        updated_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- Restaurer les objectifs nutritionnels
    IF data_section ? 'nutrition_goals' AND jsonb_array_length(data_section->'nutrition_goals') > 0 THEN
      INSERT INTO nutrition_goals 
      SELECT * FROM jsonb_populate_recordset(null::nutrition_goals, data_section->'nutrition_goals')
      ON CONFLICT (user_id, valid_from) DO NOTHING;
    END IF;
    
    RETURN true;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de la restauration: %', SQLERRM;
    RETURN false;
  END;
END;
$$;

-- =====================================================
-- 3. FONCTIONS DE MAINTENANCE
-- =====================================================

-- Fonction de maintenance quotidienne
CREATE OR REPLACE FUNCTION daily_maintenance()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  maintenance_log text := '';
  deleted_count integer;
  updated_count integer;
BEGIN
  maintenance_log := 'Maintenance quotidienne - ' || CURRENT_TIMESTAMP || E'\n';
  
  -- 1. Nettoyer les données de rate limiting anciennes
  DELETE FROM user_action_rates 
  WHERE window_start < (CURRENT_TIMESTAMP - INTERVAL '7 days');
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  maintenance_log := maintenance_log || '- Rate limiting: ' || deleted_count || ' entrées supprimées' || E'\n';
  
  -- 2. Nettoyer les analyses nutritionnelles anciennes (> 1 an)
  DELETE FROM meal_nutrition_analysis 
  WHERE analysis_date < (CURRENT_DATE - INTERVAL '365 days');
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  maintenance_log := maintenance_log || '- Analyses nutritionnelles: ' || deleted_count || ' entrées supprimées' || E'\n';
  
  -- 3. Mettre à jour les statistiques des recettes
  PERFORM refresh_recipe_statistics();
  maintenance_log := maintenance_log || '- Statistiques des recettes mises à jour' || E'\n';
  
  -- 4. Rafraîchir les vues matérialisées
  REFRESH MATERIALIZED VIEW CONCURRENTLY popular_recipes_mv;
  maintenance_log := maintenance_log || '- Vue des recettes populaires rafraîchie' || E'\n';
  
  -- 5. Analyser les tables principales pour optimiser les performances
  ANALYZE users, user_profiles, recipes, weekly_meal_plans, user_recipe_interactions;
  maintenance_log := maintenance_log || '- Statistiques des tables analysées' || E'\n';
  
  -- 6. Vérifier l'intégrité des données
  -- Compter les orphelins potentiels
  SELECT COUNT(*) INTO deleted_count
  FROM user_profiles up
  WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = up.user_id);
  
  IF deleted_count > 0 THEN
    maintenance_log := maintenance_log || '- ATTENTION: ' || deleted_count || ' profils orphelins détectés' || E'\n';
  END IF;
  
  maintenance_log := maintenance_log || 'Maintenance terminée avec succès';
  
  RETURN maintenance_log;
END;
$$;

-- Fonction de maintenance hebdomadaire
CREATE OR REPLACE FUNCTION weekly_maintenance()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  maintenance_log text := '';
  deleted_count integer;
BEGIN
  maintenance_log := 'Maintenance hebdomadaire - ' || CURRENT_TIMESTAMP || E'\n';
  
  -- 1. Nettoyer les logs d'audit anciens (> 3 mois)
  DELETE FROM audit_logs 
  WHERE created_at < (CURRENT_TIMESTAMP - INTERVAL '90 days');
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  maintenance_log := maintenance_log || '- Logs d''audit: ' || deleted_count || ' entrées supprimées' || E'\n';
  
  -- 2. Nettoyer les plans alimentaires très anciens et non complétés
  DELETE FROM weekly_meal_plans 
  WHERE status = 'draft' 
    AND created_at < (CURRENT_TIMESTAMP - INTERVAL '30 days');
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  maintenance_log := maintenance_log || '- Plans alimentaires en brouillon: ' || deleted_count || ' supprimés' || E'\n';
  
  -- 3. Rafraîchir toutes les vues matérialisées
  PERFORM refresh_materialized_views();
  maintenance_log := maintenance_log || '- Toutes les vues matérialisées rafraîchies' || E'\n';
  
  -- 4. Recalculer les scores de popularité
  UPDATE recipes SET view_count = (
    SELECT COUNT(*) FROM user_recipe_interactions 
    WHERE recipe_id = recipes.id
  );
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  maintenance_log := maintenance_log || '- Compteurs de vues mis à jour: ' || updated_count || ' recettes' || E'\n';
  
  -- 5. Optimiser les index
  REINDEX TABLE user_recipe_interactions;
  REINDEX TABLE weekly_meal_plans;
  maintenance_log := maintenance_log || '- Index optimisés' || E'\n';
  
  maintenance_log := maintenance_log || 'Maintenance hebdomadaire terminée';
  
  RETURN maintenance_log;
END;
$$;

-- =====================================================
-- 4. FONCTIONS DE MONITORING
-- =====================================================

-- Fonction pour obtenir les métriques de santé de la base
CREATE OR REPLACE FUNCTION get_database_health_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  metrics jsonb := '{}'::jsonb;
  db_size text;
  active_connections integer;
  table_stats jsonb;
BEGIN
  -- Taille de la base de données
  SELECT pg_size_pretty(pg_database_size(current_database())) INTO db_size;
  
  -- Connexions actives
  SELECT COUNT(*) INTO active_connections
  FROM pg_stat_activity
  WHERE state = 'active';
  
  -- Statistiques des tables principales
  SELECT jsonb_object_agg(
    tablename,
    jsonb_build_object(
      'size', pg_size_pretty(pg_total_relation_size(tablename)),
      'rows', n_tup_ins - n_tup_del,
      'seq_scans', seq_scan,
      'index_scans', idx_scan
    )
  ) INTO table_stats
  FROM pg_stat_user_tables
  WHERE tablename IN ('users', 'recipes', 'user_recipe_interactions', 'weekly_meal_plans');
  
  metrics := jsonb_build_object(
    'timestamp', CURRENT_TIMESTAMP,
    'database_size', db_size,
    'active_connections', active_connections,
    'table_statistics', table_stats,
    'materialized_views_count', (
      SELECT COUNT(*) FROM pg_matviews WHERE schemaname = 'public'
    ),
    'active_users_last_30_days', (
      SELECT COUNT(DISTINCT user_id)
      FROM user_recipe_interactions
      WHERE last_viewed_at > (CURRENT_TIMESTAMP - INTERVAL '30 days')
    ),
    'recipes_published', (
      SELECT COUNT(*) FROM recipes WHERE is_published = true
    ),
    'active_subscriptions', (
      SELECT COUNT(*) FROM subscriptions WHERE status = 'active'
    )
  );
  
  RETURN metrics;
END;
$$;

-- Fonction pour détecter les problèmes de performance
CREATE OR REPLACE FUNCTION detect_performance_issues()
RETURNS TABLE(
  issue_type text,
  description text,
  severity text,
  recommendation text
) 
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Tables avec beaucoup de scans séquentiels
  RETURN QUERY
  SELECT 
    'sequential_scans'::text,
    'Table ' || tablename || ' a ' || seq_scan || ' scans séquentiels vs ' || idx_scan || ' scans d''index'::text,
    CASE 
      WHEN seq_scan > idx_scan * 5 THEN 'high'
      WHEN seq_scan > idx_scan * 2 THEN 'medium'
      ELSE 'low'
    END::text,
    'Ajouter des index ou optimiser les requêtes'::text
  FROM pg_stat_user_tables
  WHERE seq_scan > 1000 AND seq_scan > idx_scan;
  
  -- Tables très volumineuses
  RETURN QUERY
  SELECT 
    'large_table'::text,
    'Table ' || tablename || ' : ' || pg_size_pretty(pg_total_relation_size(tablename))::text,
    CASE 
      WHEN pg_total_relation_size(tablename) > 1000000000 THEN 'high'
      WHEN pg_total_relation_size(tablename) > 100000000 THEN 'medium'
      ELSE 'low'
    END::text,
    'Considérer le partitioning ou l''archivage'::text
  FROM pg_stat_user_tables
  WHERE pg_total_relation_size(tablename) > 50000000;
  
  -- Vues matérialisées non rafraîchies récemment
  RETURN QUERY
  SELECT 
    'stale_materialized_view'::text,
    'Vue matérialisée ' || matviewname || ' potentiellement obsolète'::text,
    'medium'::text,
    'Rafraîchir la vue matérialisée'::text
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
    AND tablename LIKE '%_mv'
    AND last_analyze < (CURRENT_TIMESTAMP - INTERVAL '1 day');
END;
$$;

-- =====================================================
-- 5. FONCTIONS D'ARCHIVAGE
-- =====================================================

-- Fonction pour archiver les données anciennes d'un utilisateur
CREATE OR REPLACE FUNCTION archive_user_old_data(
  user_uuid uuid,
  archive_before_date date DEFAULT (CURRENT_DATE - INTERVAL '2 years')
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  archived_data jsonb := '{}'::jsonb;
  progress_archived integer;
  tracking_archived integer;
  interactions_archived integer;
BEGIN
  -- Archiver et supprimer les anciens progrès
  WITH archived_progress AS (
    DELETE FROM user_progress
    WHERE user_id = user_uuid 
      AND recorded_date < archive_before_date
    RETURNING *
  )
  SELECT jsonb_agg(to_jsonb(ap.*)), COUNT(*)
  INTO archived_data, progress_archived
  FROM archived_progress ap;
  
  -- Archiver le suivi nutritionnel ancien
  WITH archived_tracking AS (
    DELETE FROM daily_nutrition_tracking
    WHERE user_id = user_uuid 
      AND tracking_date < archive_before_date
    RETURNING *
  )
  SELECT COUNT(*) INTO tracking_archived
  FROM archived_tracking;
  
  -- Archiver les anciennes interactions (garder seulement les favoris)
  WITH archived_interactions AS (
    DELETE FROM user_recipe_interactions
    WHERE user_id = user_uuid 
      AND last_viewed_at < archive_before_date
      AND is_saved = false
      AND is_liked = false
    RETURNING *
  )
  SELECT COUNT(*) INTO interactions_archived
  FROM archived_interactions;
  
  RETURN jsonb_build_object(
    'archive_date', CURRENT_TIMESTAMP,
    'user_id', user_uuid,
    'archive_before_date', archive_before_date,
    'progress_entries_archived', progress_archived,
    'tracking_entries_archived', tracking_archived,
    'interactions_archived', interactions_archived,
    'archived_data', archived_data
  );
END;
$$;

-- =====================================================
-- 6. COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION create_user_backup(uuid) IS 'Crée un backup complet des données d''un utilisateur';
COMMENT ON FUNCTION create_full_backup() IS 'Crée un backup complet de la base de données (aliments, recettes, combinaisons)';
COMMENT ON FUNCTION restore_user_data(jsonb) IS 'Restaure les données d''un utilisateur à partir d''un backup';
COMMENT ON FUNCTION daily_maintenance() IS 'Maintenance quotidienne automatique (nettoyage, stats, optimisation)';
COMMENT ON FUNCTION weekly_maintenance() IS 'Maintenance hebdomadaire (archives, optimisations avancées)';
COMMENT ON FUNCTION get_database_health_metrics() IS 'Métriques de santé et performance de la base de données';
COMMENT ON FUNCTION detect_performance_issues() IS 'Détecte automatiquement les problèmes de performance';
COMMENT ON FUNCTION archive_user_old_data(uuid, date) IS 'Archive les données anciennes d''un utilisateur';