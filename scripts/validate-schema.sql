-- =====================================================
-- VALIDATION DU SCHÉMA POSTGRESQL COMPLET
-- =====================================================
-- Script de validation pour vérifier que toutes les tables,
-- fonctions, triggers et politiques RLS sont correctement créées

-- =====================================================
-- 1. VÉRIFICATION DES TABLES PRINCIPALES
-- =====================================================

DO $$
DECLARE
  missing_tables text[] := '{}';
  table_name text;
  required_tables text[] := ARRAY[
    'users',
    'user_profiles', 
    'user_preferences',
    'user_progress',
    'user_recipe_interactions',
    'recipes',
    'weekly_meal_plans',
    'shopping_lists',
    'subscriptions',
    'foods',
    'food_combinations',
    'meal_nutrition_analysis',
    'nutrition_goals',
    'daily_nutrition_tracking',
    'audit_logs',
    'user_action_rates'
  ];
BEGIN
  RAISE NOTICE '🔍 Vérification des tables principales...';
  
  FOREACH table_name IN ARRAY required_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = table_name
    ) THEN
      missing_tables := array_append(missing_tables, table_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION '❌ Tables manquantes: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE '✅ Toutes les tables principales sont présentes (%)', array_length(required_tables, 1);
  END IF;
END $$;

-- =====================================================
-- 2. VÉRIFICATION DES FONCTIONS CRITIQUES
-- =====================================================

DO $$
DECLARE
  missing_functions text[] := '{}';
  function_name text;
  required_functions text[] := ARRAY[
    'calculate_bmr',
    'calculate_daily_calories',
    'calculate_age',
    'has_active_subscription',
    'can_access_premium_features',
    'check_rate_limit',
    'create_audit_log',
    'calculate_meal_anti_inflammatory_score',
    'calculate_diet_compatibility_score'
  ];
BEGIN
  RAISE NOTICE '🔍 Vérification des fonctions critiques...';
  
  FOREACH function_name IN ARRAY required_functions LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' AND routine_name = function_name
    ) THEN
      missing_functions := array_append(missing_functions, function_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_functions, 1) > 0 THEN
    RAISE EXCEPTION '❌ Fonctions manquantes: %', array_to_string(missing_functions, ', ');
  ELSE
    RAISE NOTICE '✅ Toutes les fonctions critiques sont présentes (%)', array_length(required_functions, 1);
  END IF;
END $$;

-- =====================================================
-- 3. VÉRIFICATION DES POLITIQUES RLS
-- =====================================================

DO $$
DECLARE
  tables_without_rls text[] := '{}';
  table_rec record;
BEGIN
  RAISE NOTICE '🔍 Vérification des politiques RLS...';
  
  FOR table_rec IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE '_pg_%'
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public' 
        AND c.relname = table_rec.tablename
        AND c.relrowsecurity = true
    ) THEN
      tables_without_rls := array_append(tables_without_rls, table_rec.tablename);
    END IF;
  END LOOP;
  
  IF array_length(tables_without_rls, 1) > 0 THEN
    RAISE WARNING '⚠️ Tables sans RLS: %', array_to_string(tables_without_rls, ', ');
  ELSE
    RAISE NOTICE '✅ RLS activé sur toutes les tables';
  END IF;
END $$;

-- =====================================================
-- 4. VÉRIFICATION DES INDEX CRITIQUES
-- =====================================================

DO $$
DECLARE
  index_count integer;
  total_tables integer;
BEGIN
  RAISE NOTICE '🔍 Vérification des index...';
  
  SELECT count(*) INTO total_tables
  FROM information_schema.tables 
  WHERE table_schema = 'public';
  
  SELECT count(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public';
  
  RAISE NOTICE '✅ % index créés sur % tables', index_count, total_tables;
  
  IF index_count < total_tables * 2 THEN
    RAISE WARNING '⚠️ Nombre d''index potentiellement insuffisant';
  END IF;
END $$;

-- =====================================================
-- 5. VÉRIFICATION DES TRIGGERS
-- =====================================================

DO $$
DECLARE
  trigger_count integer;
  tables_with_updated_at integer;
BEGIN
  RAISE NOTICE '🔍 Vérification des triggers...';
  
  SELECT count(*) INTO trigger_count
  FROM information_schema.triggers 
  WHERE trigger_schema = 'public';
  
  SELECT count(*) INTO tables_with_updated_at
  FROM information_schema.columns
  WHERE table_schema = 'public' AND column_name = 'updated_at';
  
  RAISE NOTICE '✅ % triggers créés, % tables avec updated_at', trigger_count, tables_with_updated_at;
END $$;

-- =====================================================
-- 6. VÉRIFICATION DES CONTRAINTES
-- =====================================================

DO $$
DECLARE
  fk_count integer;
  check_count integer;
  unique_count integer;
BEGIN
  RAISE NOTICE '🔍 Vérification des contraintes...';
  
  SELECT count(*) INTO fk_count
  FROM information_schema.table_constraints 
  WHERE constraint_schema = 'public' AND constraint_type = 'FOREIGN KEY';
  
  SELECT count(*) INTO check_count
  FROM information_schema.table_constraints 
  WHERE constraint_schema = 'public' AND constraint_type = 'CHECK';
  
  SELECT count(*) INTO unique_count
  FROM information_schema.table_constraints 
  WHERE constraint_schema = 'public' AND constraint_type = 'UNIQUE';
  
  RAISE NOTICE '✅ Contraintes: % FK, % CHECK, % UNIQUE', fk_count, check_count, unique_count;
END $$;

-- =====================================================
-- 7. VÉRIFICATION DES VUES
-- =====================================================

DO $$
DECLARE
  view_count integer;
  materialized_view_count integer;
BEGIN
  RAISE NOTICE '🔍 Vérification des vues...';
  
  SELECT count(*) INTO view_count
  FROM information_schema.views 
  WHERE table_schema = 'public';
  
  SELECT count(*) INTO materialized_view_count
  FROM pg_matviews 
  WHERE schemaname = 'public';
  
  RAISE NOTICE '✅ % vues normales, % vues matérialisées', view_count, materialized_view_count;
END $$;

-- =====================================================
-- 8. TEST DES FONCTIONS CRITIQUES
-- =====================================================

DO $$
DECLARE
  test_bmr integer;
  test_calories integer;
  test_age integer;
BEGIN
  RAISE NOTICE '🔍 Test des fonctions de calcul...';
  
  -- Test calcul BMR
  SELECT calculate_bmr(70, 175, 30, 'homme') INTO test_bmr;
  IF test_bmr BETWEEN 1600 AND 2000 THEN
    RAISE NOTICE '✅ calculate_bmr fonctionne correctement: %', test_bmr;
  ELSE
    RAISE EXCEPTION '❌ calculate_bmr retourne une valeur incorrecte: %', test_bmr;
  END IF;
  
  -- Test calcul calories
  SELECT calculate_daily_calories(1700, 'modere') INTO test_calories;
  IF test_calories BETWEEN 2000 AND 3000 THEN
    RAISE NOTICE '✅ calculate_daily_calories fonctionne correctement: %', test_calories;
  ELSE
    RAISE EXCEPTION '❌ calculate_daily_calories retourne une valeur incorrecte: %', test_calories;
  END IF;
  
  -- Test calcul âge
  SELECT calculate_age('1990-01-01'::date) INTO test_age;
  IF test_age BETWEEN 30 AND 40 THEN
    RAISE NOTICE '✅ calculate_age fonctionne correctement: %', test_age;
  ELSE
    RAISE EXCEPTION '❌ calculate_age retourne une valeur incorrecte: %', test_age;
  END IF;
END $$;

-- =====================================================
-- 9. RÉSUMÉ FINAL
-- =====================================================

DO $$
DECLARE
  total_tables integer;
  total_functions integer;
  total_triggers integer;
  total_policies integer;
BEGIN
  SELECT count(*) INTO total_tables FROM information_schema.tables WHERE table_schema = 'public';
  SELECT count(*) INTO total_functions FROM information_schema.routines WHERE routine_schema = 'public';
  SELECT count(*) INTO total_triggers FROM information_schema.triggers WHERE trigger_schema = 'public';
  SELECT count(*) INTO total_policies FROM pg_policies WHERE schemaname = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 ===== RÉSUMÉ DE VALIDATION =====';
  RAISE NOTICE '📊 Tables créées: %', total_tables;
  RAISE NOTICE '⚙️ Fonctions créées: %', total_functions;
  RAISE NOTICE '🔄 Triggers créés: %', total_triggers;
  RAISE NOTICE '🛡️ Politiques RLS: %', total_policies;
  RAISE NOTICE '';
  
  IF total_tables >= 16 AND total_functions >= 15 AND total_triggers >= 10 THEN
    RAISE NOTICE '✅ LE SCHÉMA POSTGRESQL EST COMPLET ET OPÉRATIONNEL !';
  ELSE
    RAISE NOTICE '⚠️ Le schéma nécessite encore quelques ajustements';
  END IF;
  
  RAISE NOTICE '=====================================';
END $$;