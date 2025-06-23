-- =====================================================
-- COACH NUTRITIONNEL IA - FONCTIONS POSTGRESQL AVANCÉES
-- =====================================================
-- Version: 1.0
-- Date: 2025-06-23
-- Description: Fonctions avancées pour calculs nutritionnels, scoring et recommandations

-- =====================================================
-- 1. FONCTIONS UTILITAIRES DE BASE
-- =====================================================

-- Fonction pour mise à jour du timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer l'âge à partir de la date de naissance
CREATE OR REPLACE FUNCTION calculate_age(birth_date date) 
RETURNS integer AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM age(birth_date));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour calculer le BMR (Métabolisme de base)
CREATE OR REPLACE FUNCTION calculate_bmr(
  weight_kg decimal,
  height_cm integer,
  age_years integer,
  gender text
) RETURNS integer AS $$
BEGIN
  -- Formule de Mifflin-St Jeor
  IF gender = 'homme' THEN
    RETURN ROUND(10 * weight_kg + 6.25 * height_cm - 5 * age_years + 5);
  ELSIF gender = 'femme' THEN
    RETURN ROUND(10 * weight_kg + 6.25 * height_cm - 5 * age_years - 161);
  ELSE
    -- Moyenne pour autres genres
    RETURN ROUND(10 * weight_kg + 6.25 * height_cm - 5 * age_years - 78);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour calculer les besoins caloriques journaliers
CREATE OR REPLACE FUNCTION calculate_daily_calories(
  bmr integer,
  activity_level text
) RETURNS integer AS $$
BEGIN
  RETURN CASE activity_level
    WHEN 'sedentaire' THEN ROUND(bmr * 1.2)
    WHEN 'leger' THEN ROUND(bmr * 1.375)
    WHEN 'modere' THEN ROUND(bmr * 1.55)
    WHEN 'intense' THEN ROUND(bmr * 1.725)
    WHEN 'tres_intense' THEN ROUND(bmr * 1.9)
    ELSE ROUND(bmr * 1.55) -- Défaut: modéré
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 2. FONCTIONS DE SCORING NUTRITIONNEL
-- =====================================================

-- Fonction pour calculer le score anti-inflammatoire d'un repas
CREATE OR REPLACE FUNCTION calculate_meal_anti_inflammatory_score(
  recipe_ids uuid[],
  portions decimal[] DEFAULT NULL
) RETURNS decimal AS $$
DECLARE
  total_score decimal := 0;
  recipe_count integer := 0;
  recipe_id uuid;
  portion decimal;
  recipe_score integer;
BEGIN
  -- Vérifier que les arrays ont la même longueur
  IF portions IS NOT NULL AND array_length(recipe_ids, 1) != array_length(portions, 1) THEN
    RAISE EXCEPTION 'Les arrays recipe_ids et portions doivent avoir la même longueur';
  END IF;
  
  -- Parcourir chaque recette
  FOR i IN 1..array_length(recipe_ids, 1) LOOP
    recipe_id := recipe_ids[i];
    portion := COALESCE(portions[i], 1.0);
    
    -- Récupérer le score de la recette
    SELECT anti_inflammatory_score INTO recipe_score
    FROM recipes
    WHERE id = recipe_id AND is_published = true;
    
    IF recipe_score IS NOT NULL THEN
      total_score := total_score + (recipe_score * portion);
      recipe_count := recipe_count + 1;
    END IF;
  END LOOP;
  
  -- Retourner la moyenne pondérée
  IF recipe_count > 0 THEN
    RETURN ROUND(total_score / recipe_count, 2);
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour calculer le score de compatibilité alimentaire
CREATE OR REPLACE FUNCTION calculate_diet_compatibility_score(
  recipe_id uuid,
  user_id_param uuid
) RETURNS decimal AS $$
DECLARE
  score decimal := 10.0;
  user_restrictions text[];
  user_allergies text[];
  user_preferences text[];
  recipe_ingredients jsonb;
  recipe_diet_tags text[];
  ingredient jsonb;
BEGIN
  -- Récupérer les données utilisateur
  SELECT 
    up.food_restrictions,
    up.allergies,
    upr.favorite_cuisines
  INTO 
    user_restrictions,
    user_allergies,
    user_preferences
  FROM user_profiles up
  LEFT JOIN user_preferences upr ON up.user_id = upr.user_id
  WHERE up.user_id = user_id_param;
  
  -- Récupérer les données de la recette
  SELECT ingredients, diet_tags
  INTO recipe_ingredients, recipe_diet_tags
  FROM recipes
  WHERE id = recipe_id;
  
  -- Vérifier les allergies (critique)
  FOR ingredient IN SELECT * FROM jsonb_array_elements(recipe_ingredients) LOOP
    IF user_allergies IS NOT NULL AND 
       (ingredient->>'name') = ANY(user_allergies) THEN
      RETURN 0; -- Score zéro si allergène détecté
    END IF;
  END LOOP;
  
  -- Vérifier les restrictions alimentaires
  IF user_restrictions IS NOT NULL THEN
    FOR ingredient IN SELECT * FROM jsonb_array_elements(recipe_ingredients) LOOP
      IF (ingredient->>'name') = ANY(user_restrictions) THEN
        score := score - 2.0;
      END IF;
    END LOOP;
  END IF;
  
  -- Bonus pour les préférences
  IF user_preferences IS NOT NULL AND recipe_diet_tags IS NOT NULL THEN
    IF recipe_diet_tags && user_preferences THEN
      score := score + 1.0;
    END IF;
  END IF;
  
  RETURN GREATEST(0, LEAST(10, score));
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 3. FONCTIONS DE RECOMMANDATION
-- =====================================================

-- Fonction pour obtenir des recommandations de recettes personnalisées
CREATE OR REPLACE FUNCTION get_personalized_recipe_recommendations(
  user_id_param uuid,
  meal_type_filter text DEFAULT NULL,
  limit_count integer DEFAULT 10
) RETURNS TABLE (
  recipe_id uuid,
  recipe_name text,
  anti_inflammatory_score integer,
  compatibility_score decimal,
  total_score decimal,
  difficulty_level text,
  total_time_minutes integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.anti_inflammatory_score,
    calculate_diet_compatibility_score(r.id, user_id_param) as compatibility_score,
    (r.anti_inflammatory_score * 0.6 + calculate_diet_compatibility_score(r.id, user_id_param) * 0.4) as total_score,
    r.difficulty_level,
    r.total_time_minutes
  FROM recipes r
  WHERE r.is_published = true
    AND (meal_type_filter IS NULL OR meal_type_filter = ANY(r.meal_type))
  ORDER BY total_score DESC, r.rating_avg DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fonction pour générer une liste de courses optimisée
CREATE OR REPLACE FUNCTION generate_shopping_list(
  meal_plan_id uuid
) RETURNS jsonb AS $$
DECLARE
  shopping_list jsonb := '[]'::jsonb;
  meal_data jsonb;
  recipe_ids uuid[];
  recipe_id uuid;
  ingredients jsonb;
  ingredient jsonb;
  consolidated_items jsonb := '{}'::jsonb;
  item_key text;
  item_data jsonb;
BEGIN
  -- Récupérer les données du plan de repas
  SELECT meals INTO meal_data
  FROM weekly_meal_plans
  WHERE id = meal_plan_id;
  
  -- Extraire tous les recipe_ids du plan
  WITH RECURSIVE extract_recipes AS (
    SELECT jsonb_array_elements(
      jsonb_path_query_array(meal_data, '$.**."recipe_id"')
    )::text::uuid as recipe_id
  )
  SELECT array_agg(recipe_id) INTO recipe_ids
  FROM extract_recipes;
  
  -- Consolider les ingrédients
  FOR recipe_id IN SELECT unnest(recipe_ids) LOOP
    SELECT r.ingredients INTO ingredients
    FROM recipes r
    WHERE r.id = recipe_id;
    
    FOR ingredient IN SELECT * FROM jsonb_array_elements(ingredients) LOOP
      item_key := ingredient->>'name';
      
      IF consolidated_items ? item_key THEN
        -- Additionner les quantités (simplification: on suppose même unité)
        item_data := consolidated_items->item_key;
        consolidated_items := consolidated_items || 
          jsonb_build_object(
            item_key,
            item_data || jsonb_build_object(
              'quantity', 
              COALESCE((item_data->>'quantity')::decimal, 0) + 
              COALESCE((ingredient->>'quantity')::decimal, 0)
            )
          );
      ELSE
        consolidated_items := consolidated_items || 
          jsonb_build_object(item_key, ingredient);
      END IF;
    END LOOP;
  END LOOP;
  
  -- Convertir en array pour la liste de courses
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', key,
      'quantity', value->>'quantity',
      'unit', value->>'unit',
      'category', COALESCE(f.category, 'autre'),
      'estimated_cost', COALESCE(f.average_price_per_kg * (value->>'quantity')::decimal / 1000, 0)
    )
  ) INTO shopping_list
  FROM jsonb_each(consolidated_items) je(key, value)
  LEFT JOIN foods f ON f.name_fr ILIKE '%' || key || '%';
  
  RETURN COALESCE(shopping_list, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 4. FONCTIONS D'ANALYSE NUTRITIONNELLE
-- =====================================================

-- Fonction pour analyser la nutrition d'une recette
CREATE OR REPLACE FUNCTION analyze_recipe_nutrition(
  recipe_id_param uuid,
  serving_size decimal DEFAULT 1.0
) RETURNS jsonb AS $$
DECLARE
  nutrition_summary jsonb := '{}'::jsonb;
  recipe_ingredients jsonb;
  ingredient jsonb;
  food_nutrition jsonb;
  ingredient_name text;
  ingredient_quantity decimal;
  total_calories decimal := 0;
  total_protein decimal := 0;
  total_carbs decimal := 0;
  total_fat decimal := 0;
  total_fiber decimal := 0;
BEGIN
  -- Récupérer les ingrédients de la recette
  SELECT ingredients INTO recipe_ingredients
  FROM recipes
  WHERE id = recipe_id_param;
  
  -- Analyser chaque ingrédient
  FOR ingredient IN SELECT * FROM jsonb_array_elements(recipe_ingredients) LOOP
    ingredient_name := ingredient->>'name';
    ingredient_quantity := COALESCE((ingredient->>'quantity')::decimal, 0) * serving_size;
    
    -- Récupérer les données nutritionnelles de l'aliment
    SELECT nutrition_per_100g INTO food_nutrition
    FROM foods
    WHERE name_fr ILIKE '%' || ingredient_name || '%'
    LIMIT 1;
    
    IF food_nutrition IS NOT NULL THEN
      -- Calculer la contribution nutritionnelle (proportion sur 100g)
      total_calories := total_calories + 
        COALESCE((food_nutrition->>'energy_kcal')::decimal, 0) * ingredient_quantity / 100;
      total_protein := total_protein + 
        COALESCE((food_nutrition->>'protein_g')::decimal, 0) * ingredient_quantity / 100;
      total_carbs := total_carbs + 
        COALESCE((food_nutrition->>'carbohydrate_g')::decimal, 0) * ingredient_quantity / 100;
      total_fat := total_fat + 
        COALESCE((food_nutrition->>'fat_total_g')::decimal, 0) * ingredient_quantity / 100;
      total_fiber := total_fiber + 
        COALESCE((food_nutrition->>'fiber_g')::decimal, 0) * ingredient_quantity / 100;
    END IF;
  END LOOP;
  
  -- Construire le résumé nutritionnel
  nutrition_summary := jsonb_build_object(
    'calories', ROUND(total_calories, 1),
    'protein_g', ROUND(total_protein, 1),
    'carbohydrate_g', ROUND(total_carbs, 1),
    'fat_g', ROUND(total_fat, 1),
    'fiber_g', ROUND(total_fiber, 1),
    'protein_percentage', ROUND((total_protein * 4 * 100) / GREATEST(total_calories, 1), 1),
    'carbs_percentage', ROUND((total_carbs * 4 * 100) / GREATEST(total_calories, 1), 1),
    'fat_percentage', ROUND((total_fat * 9 * 100) / GREATEST(total_calories, 1), 1)
  );
  
  RETURN nutrition_summary;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 5. FONCTIONS DE VALIDATION ET CONTRAINTES
-- =====================================================

-- Fonction pour valider un plan alimentaire
CREATE OR REPLACE FUNCTION validate_meal_plan(
  meal_plan_data jsonb,
  user_id_param uuid
) RETURNS jsonb AS $$
DECLARE
  validation_result jsonb := '{"valid": true, "warnings": [], "errors": []}'::jsonb;
  day_data jsonb;
  meal_data jsonb;
  recipe_id uuid;
  compatibility_score decimal;
  warnings jsonb := '[]'::jsonb;
  errors jsonb := '[]'::jsonb;
BEGIN
  -- Valider chaque jour de la semaine
  FOR day_data IN SELECT * FROM jsonb_each(meal_plan_data) LOOP
    -- Valider chaque repas du jour
    FOR meal_data IN SELECT * FROM jsonb_each(day_data.value) LOOP
      recipe_id := (meal_data.value->>'recipe_id')::uuid;
      
      -- Vérifier la compatibilité alimentaire
      compatibility_score := calculate_diet_compatibility_score(recipe_id, user_id_param);
      
      IF compatibility_score = 0 THEN
        errors := errors || jsonb_build_array(
          jsonb_build_object(
            'day', day_data.key,
            'meal', meal_data.key,
            'recipe_id', recipe_id,
            'error', 'Allergène détecté'
          )
        );
      ELSIF compatibility_score < 5 THEN
        warnings := warnings || jsonb_build_array(
          jsonb_build_object(
            'day', day_data.key,
            'meal', meal_data.key,
            'recipe_id', recipe_id,
            'warning', 'Faible compatibilité alimentaire'
          )
        );
      END IF;
    END LOOP;
  END LOOP;
  
  -- Construire le résultat
  validation_result := jsonb_build_object(
    'valid', jsonb_array_length(errors) = 0,
    'warnings', warnings,
    'errors', errors
  );
  
  RETURN validation_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 6. FONCTIONS D'OPTIMISATION ET PERFORMANCE
-- =====================================================

-- Fonction pour rafraîchir les statistiques des recettes
CREATE OR REPLACE FUNCTION refresh_recipe_statistics()
RETURNS void AS $$
BEGIN
  -- Mettre à jour les compteurs de likes
  UPDATE recipes SET like_count = (
    SELECT COUNT(*)
    FROM user_recipe_interactions
    WHERE recipe_id = recipes.id AND is_liked = true
  );
  
  -- Mettre à jour les moyennes de rating
  UPDATE recipes SET 
    rating_avg = (
      SELECT AVG(rating)::decimal(3,2)
      FROM user_recipe_interactions
      WHERE recipe_id = recipes.id AND rating IS NOT NULL
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM user_recipe_interactions
      WHERE recipe_id = recipes.id AND rating IS NOT NULL
    );
  
  -- Mettre à jour les compteurs de vues
  UPDATE recipes SET view_count = (
    SELECT COUNT(*)
    FROM user_recipe_interactions
    WHERE recipe_id = recipes.id
  );
  
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les données anciennes
CREATE OR REPLACE FUNCTION cleanup_old_data(
  retention_days integer DEFAULT 365
) RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Supprimer les anciennes analyses nutritionnelles
  DELETE FROM meal_nutrition_analysis
  WHERE analysis_date < (CURRENT_DATE - retention_days * INTERVAL '1 day');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Supprimer les anciens logs d'audit
  DELETE FROM audit_logs
  WHERE created_at < (CURRENT_TIMESTAMP - retention_days * INTERVAL '1 day');
  
  -- Nettoyer les données de rate limiting anciennes
  DELETE FROM user_action_rates
  WHERE window_start < (CURRENT_TIMESTAMP - INTERVAL '7 days');
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. COMMENTAIRES DE DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION calculate_meal_anti_inflammatory_score IS 'Calcule le score anti-inflammatoire moyen d''un repas à partir des recettes';
COMMENT ON FUNCTION calculate_diet_compatibility_score IS 'Évalue la compatibilité d''une recette avec les restrictions et préférences utilisateur';
COMMENT ON FUNCTION get_personalized_recipe_recommendations IS 'Génère des recommandations de recettes personnalisées';
COMMENT ON FUNCTION generate_shopping_list IS 'Génère une liste de courses optimisée à partir d''un plan de repas';
COMMENT ON FUNCTION analyze_recipe_nutrition IS 'Analyse nutritionnelle détaillée d''une recette';
COMMENT ON FUNCTION validate_meal_plan IS 'Valide un plan alimentaire contre les contraintes utilisateur';
COMMENT ON FUNCTION refresh_recipe_statistics IS 'Met à jour les statistiques calculées des recettes';
COMMENT ON FUNCTION cleanup_old_data IS 'Nettoie les données anciennes pour optimiser les performances';