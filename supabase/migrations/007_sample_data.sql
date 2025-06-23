-- =====================================================
-- COACH NUTRITIONNEL IA - DONNÉES D'EXEMPLE ET SEED
-- =====================================================
-- Version: 1.0
-- Date: 2025-06-23
-- Description: Données d'exemple pour développement et démonstration

-- =====================================================
-- 1. ALIMENTS DE BASE (FOODS)
-- =====================================================

INSERT INTO foods (name_fr, category, subcategory, nutrition_per_100g, anti_inflammatory_score, inflammatory_potential, allergens, diet_compatibility, season_availability, average_price_per_kg, price_category) VALUES

-- Légumes anti-inflammatoires
('Épinards', 'legume', 'legume_vert', '{
  "energy_kcal": 23, "protein_g": 2.9, "carbohydrate_g": 3.6, "fat_total_g": 0.4,
  "fiber_g": 2.2, "vitamin_c_mg": 28, "iron_mg": 2.7, "calcium_mg": 99
}'::jsonb, 9, 'anti_inflammatoire', ARRAY[]::text[], ARRAY['vegetarien', 'vegan', 'sans_gluten', 'paleo'], ARRAY['printemps', 'automne', 'hiver'], 3.50, 'economique'),

('Brocolis', 'legume', 'crucifere', '{
  "energy_kcal": 34, "protein_g": 2.8, "carbohydrate_g": 7, "fat_total_g": 0.4,
  "fiber_g": 2.6, "vitamin_c_mg": 89, "vitamin_k_ug": 102
}'::jsonb, 9, 'anti_inflammatoire', ARRAY[]::text[], ARRAY['vegetarien', 'vegan', 'sans_gluten', 'paleo'], ARRAY['automne', 'hiver'], 4.20, 'economique'),

('Avocat', 'legume', 'fruit_legume', '{
  "energy_kcal": 160, "protein_g": 2, "carbohydrate_g": 9, "fat_total_g": 15,
  "fiber_g": 7, "vitamin_k_ug": 21, "potassium_mg": 485
}'::jsonb, 8, 'anti_inflammatoire', ARRAY[]::text[], ARRAY['vegetarien', 'vegan', 'sans_gluten', 'paleo', 'cetogene'], ARRAY['printemps', 'ete', 'automne'], 8.90, 'premium'),

-- Fruits anti-inflammatoires
('Myrtilles', 'fruit', 'baie', '{
  "energy_kcal": 57, "protein_g": 0.7, "carbohydrate_g": 14, "fat_total_g": 0.3,
  "fiber_g": 2.4, "vitamin_c_mg": 10, "vitamin_k_ug": 19
}'::jsonb, 10, 'anti_inflammatoire', ARRAY[]::text[], ARRAY['vegetarien', 'vegan', 'sans_gluten', 'paleo'], ARRAY['ete'], 12.50, 'premium'),

('Cerises', 'fruit', 'drupe', '{
  "energy_kcal": 63, "protein_g": 1.1, "carbohydrate_g": 16, "fat_total_g": 0.2,
  "fiber_g": 2.1, "vitamin_c_mg": 7, "potassium_mg": 222
}'::jsonb, 9, 'anti_inflammatoire', ARRAY[]::text[], ARRAY['vegetarien', 'vegan', 'sans_gluten', 'paleo'], ARRAY['ete'], 8.90, 'moyen'),

-- Protéines
('Saumon atlantique', 'proteine', 'poisson_gras', '{
  "energy_kcal": 208, "protein_g": 25, "carbohydrate_g": 0, "fat_total_g": 12,
  "omega3_g": 2.3, "vitamin_d_ug": 11
}'::jsonb, 9, 'anti_inflammatoire', ARRAY['poisson'], ARRAY['sans_gluten', 'paleo', 'cetogene'], ARRAY['printemps', 'ete', 'automne', 'hiver'], 25.90, 'premium'),

('Quinoa', 'cereale', 'pseudo_cereale', '{
  "energy_kcal": 368, "protein_g": 14, "carbohydrate_g": 64, "fat_total_g": 6,
  "fiber_g": 7, "iron_mg": 4.6, "magnesium_mg": 197
}'::jsonb, 7, 'anti_inflammatoire', ARRAY[]::text[], ARRAY['vegetarien', 'vegan', 'sans_gluten'], ARRAY['printemps', 'ete', 'automne', 'hiver'], 8.50, 'moyen'),

-- Noix et graines
('Noix', 'oleagineux', 'noix', '{
  "energy_kcal": 654, "protein_g": 15, "carbohydrate_g": 14, "fat_total_g": 65,
  "fiber_g": 7, "omega3_g": 9.1, "vitamin_e_mg": 2.9
}'::jsonb, 8, 'anti_inflammatoire', ARRAY['fruits_a_coque'], ARRAY['vegetarien', 'vegan', 'sans_gluten', 'paleo', 'cetogene'], ARRAY['automne'], 18.90, 'premium'),

('Graines de chia', 'oleagineux', 'graine', '{
  "energy_kcal": 486, "protein_g": 17, "carbohydrate_g": 42, "fat_total_g": 31,
  "fiber_g": 34, "omega3_g": 17.8, "calcium_mg": 631
}'::jsonb, 9, 'anti_inflammatoire', ARRAY[]::text[], ARRAY['vegetarien', 'vegan', 'sans_gluten', 'paleo'], ARRAY['printemps', 'ete', 'automne', 'hiver'], 15.90, 'premium'),

-- Épices et aromates
('Curcuma', 'epice', 'rhizome', '{
  "energy_kcal": 354, "protein_g": 8, "carbohydrate_g": 65, "fat_total_g": 10,
  "fiber_g": 21, "iron_mg": 41
}'::jsonb, 10, 'anti_inflammatoire', ARRAY[]::text[], ARRAY['vegetarien', 'vegan', 'sans_gluten', 'paleo'], ARRAY['printemps', 'ete', 'automne', 'hiver'], 45.00, 'premium'),

('Gingembre', 'epice', 'rhizome', '{
  "energy_kcal": 80, "protein_g": 2, "carbohydrate_g": 18, "fat_total_g": 1,
  "fiber_g": 2, "vitamin_c_mg": 5
}'::jsonb, 9, 'anti_inflammatoire', ARRAY[]::text[], ARRAY['vegetarien', 'vegan', 'sans_gluten', 'paleo'], ARRAY['printemps', 'ete', 'automne', 'hiver'], 12.90, 'moyen');

-- =====================================================
-- 2. COMBINAISONS ALIMENTAIRES
-- =====================================================

INSERT INTO food_combinations (food_1_id, food_2_id, combination_type, nutritional_benefits, synergy_score, scientific_explanation) VALUES

((SELECT id FROM foods WHERE name_fr = 'Curcuma'), 
 (SELECT id FROM foods WHERE name_fr = 'Gingembre'), 
 'synergique', 
 ARRAY['anti_inflammatoire_puissant', 'digestion_amelioree'],
 9,
 'La curcumine et les gingérols agissent en synergie pour potentialiser les effets anti-inflammatoires'),

((SELECT id FROM foods WHERE name_fr = 'Épinards'), 
 (SELECT id FROM foods WHERE name_fr = 'Avocat'), 
 'synergique', 
 ARRAY['absorption_vitamines_liposolubles', 'antioxydants_renforces'],
 8,
 'Les graisses saines de l''avocat améliorent l''absorption des vitamines A, D, E, K des épinards'),

((SELECT id FROM foods WHERE name_fr = 'Quinoa'), 
 (SELECT id FROM foods WHERE name_fr = 'Noix'), 
 'complementaire', 
 ARRAY['proteine_complete', 'omega3_equilibre'],
 7,
 'Combinaison d''acides aminés complémentaires et équilibre oméga-3/oméga-6');

-- =====================================================
-- 3. RECETTES D'EXEMPLE
-- =====================================================

INSERT INTO recipes (name, slug, description, short_description, ingredients, instructions, nutrition_facts, anti_inflammatory_score, servings, prep_time_minutes, cook_time_minutes, difficulty_level, meal_type, diet_tags, season, cost_per_serving_euro, cost_category, image_url, is_featured, is_published) VALUES

('Bowl anti-inflammatoire au saumon et quinoa', 'bowl-anti-inflammatoire-saumon-quinoa', 
 'Un bowl nutritif et coloré, riche en oméga-3 et antioxydants, parfait pour réduire l''inflammation et nourrir votre corps avec des ingrédients de qualité.',
 'Bowl nutritif au saumon, quinoa et légumes colorés',
 '[
   {"name": "Saumon atlantique", "quantity": "150", "unit": "g", "notes": "Frais, sans peau"},
   {"name": "Quinoa", "quantity": "80", "unit": "g", "notes": "Rincé"},
   {"name": "Épinards", "quantity": "100", "unit": "g", "notes": "Frais, lavés"},
   {"name": "Avocat", "quantity": "1/2", "unit": "pièce", "notes": "Mûr"},
   {"name": "Myrtilles", "quantity": "50", "unit": "g", "notes": "Fraîches ou surgelées"},
   {"name": "Graines de chia", "quantity": "1", "unit": "cuillère à soupe", "notes": ""},
   {"name": "Huile d''olive", "quantity": "1", "unit": "cuillère à soupe", "notes": "Extra vierge"},
   {"name": "Citron", "quantity": "1/2", "unit": "pièce", "notes": "Bio de préférence"}
 ]'::jsonb,
 ARRAY['Cuire le quinoa dans 200ml d''eau bouillante salée pendant 15 minutes', 'Pendant ce temps, cuire le saumon à la poêle 3-4 minutes de chaque côté', 'Laver et essorer les épinards', 'Couper l''avocat en lamelles', 'Dans un bol, disposer le quinoa en base', 'Ajouter les épinards, le saumon émietté, l''avocat', 'Parsemer de myrtilles et graines de chia', 'Assaisonner avec huile d''olive et jus de citron'],
 '{"calories": 520, "protein_g": 35, "carbohydrate_g": 45, "fat_g": 22, "fiber_g": 12, "omega3_g": 2.8}'::jsonb,
 9, 2, 15, 20, 'facile', ARRAY['dejeuner', 'diner'], ARRAY['sans_gluten', 'paleo'], ARRAY['printemps', 'ete'], 8.50, 'premium', NULL, true, true),

('Smoothie vert anti-inflammatoire', 'smoothie-vert-anti-inflammatoire',
 'Un smoothie onctueux et rafraîchissant, gorgé d''antioxydants et de nutriments anti-inflammatoires pour bien commencer la journée.',
 'Smoothie aux épinards, avocat et myrtilles',
 '[
   {"name": "Épinards", "quantity": "50", "unit": "g", "notes": "Frais"},
   {"name": "Avocat", "quantity": "1/2", "unit": "pièce", "notes": "Mûr"},
   {"name": "Myrtilles", "quantity": "100", "unit": "g", "notes": "Surgelées"},
   {"name": "Gingembre", "quantity": "1", "unit": "cm", "notes": "Frais, pelé"},
   {"name": "Lait d''amande", "quantity": "200", "unit": "ml", "notes": "Non sucré"},
   {"name": "Graines de chia", "quantity": "1", "unit": "cuillère à soupe", "notes": ""},
   {"name": "Miel", "quantity": "1", "unit": "cuillère à café", "notes": "Optionnel"}
 ]'::jsonb,
 ARRAY['Laver les épinards', 'Peler et couper le gingembre', 'Dans un blender, mettre tous les ingrédients', 'Mixer jusqu''à obtenir une texture lisse', 'Ajouter de l''eau si nécessaire pour la consistance', 'Servir immédiatement'],
 '{"calories": 180, "protein_g": 6, "carbohydrate_g": 25, "fat_g": 8, "fiber_g": 9, "vitamin_c_mg": 45}'::jsonb,
 9, 1, 5, 0, 'facile', ARRAY['petit_dejeuner', 'collation'], ARRAY['vegetarien', 'vegan', 'sans_gluten'], ARRAY['printemps', 'ete', 'automne'], 3.20, 'economique', NULL, true, true),

('Salade de quinoa aux légumes grillés', 'salade-quinoa-legumes-grilles',
 'Une salade copieuse et colorée avec quinoa, légumes grillés et vinaigrette au curcuma, riche en fibres et antioxydants.',
 'Salade nutritive au quinoa et légumes de saison',
 '[
   {"name": "Quinoa", "quantity": "100", "unit": "g", "notes": "Tricolore"},
   {"name": "Brocolis", "quantity": "200", "unit": "g", "notes": "En bouquets"},
   {"name": "Courgette", "quantity": "1", "unit": "pièce", "notes": "Moyenne"},
   {"name": "Poivron rouge", "quantity": "1", "unit": "pièce", "notes": ""},
   {"name": "Noix", "quantity": "30", "unit": "g", "notes": "Concassées"},
   {"name": "Huile d''olive", "quantity": "3", "unit": "cuillères à soupe", "notes": ""},
   {"name": "Curcuma", "quantity": "1", "unit": "cuillère à café", "notes": "En poudre"},
   {"name": "Vinaigre balsamique", "quantity": "2", "unit": "cuillères à soupe", "notes": ""}
 ]'::jsonb,
 ARRAY['Cuire le quinoa 15 minutes dans de l''eau bouillante', 'Préchauffer le four à 200°C', 'Couper les légumes en morceaux', 'Mélanger les légumes avec 2 c.à.s d''huile d''olive', 'Enfourner 25 minutes', 'Préparer la vinaigrette : mélanger huile, vinaigre, curcuma', 'Mélanger quinoa refroidi, légumes grillés et vinaigrette', 'Parsemer de noix avant de servir'],
 '{"calories": 420, "protein_g": 16, "carbohydrate_g": 55, "fat_g": 18, "fiber_g": 10}'::jsonb,
 8, 3, 20, 25, 'moyen', ARRAY['dejeuner', 'diner'], ARRAY['vegetarien', 'vegan', 'sans_gluten'], ARRAY['ete', 'automne'], 4.80, 'economique', NULL, false, true);

-- =====================================================
-- 4. UTILISATEURS D'EXEMPLE (pour tests)
-- =====================================================

-- Note: En production, les utilisateurs seront créés via Supabase Auth
-- Ces données sont uniquement pour les tests de développement

INSERT INTO users (id, email, is_active, metadata) VALUES
('00000000-0000-0000-0000-000000000001', 'marie.dupont@example.com', true, '{"is_admin": false}'::jsonb),
('00000000-0000-0000-0000-000000000002', 'jean.martin@example.com', true, '{"is_admin": false}'::jsonb),
('00000000-0000-0000-0000-000000000003', 'admin@coach-nutritionnel.fr', true, '{"is_admin": true}'::jsonb);

-- Profils utilisateurs d'exemple
INSERT INTO user_profiles (user_id, first_name, last_name, birth_date, gender, weight_kg, height_cm, activity_level, health_goals, food_restrictions, allergies) VALUES
('00000000-0000-0000-0000-000000000001', 'Marie', 'Dupont', '1985-03-15', 'femme', 65.5, 168, 'modere', ARRAY['reduction_inflammation', 'energie_amelioree'], ARRAY[]::text[], ARRAY[]::text[]),
('00000000-0000-0000-0000-000000000002', 'Jean', 'Martin', '1978-11-22', 'homme', 78.2, 180, 'leger', ARRAY['perte_poids', 'reduction_inflammation'], ARRAY['gluten'], ARRAY['fruits_a_coque']);

-- Préférences utilisateurs
INSERT INTO user_preferences (user_id, favorite_cuisines, preferred_cooking_methods, meal_times) VALUES
('00000000-0000-0000-0000-000000000001', ARRAY['mediterraneenne', 'francaise'], ARRAY['vapeur', 'grille', 'saute'], '{"petit_dejeuner": "07:30", "dejeuner": "12:30", "diner": "19:30"}'::jsonb),
('00000000-0000-0000-0000-000000000002', ARRAY['asiatique', 'mediterraneenne'], ARRAY['wok', 'grille'], '{"petit_dejeuner": "08:00", "dejeuner": "13:00", "diner": "20:00"}'::jsonb);

-- Abonnements d'exemple
INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, status, current_period_start, current_period_end, amount_euro) VALUES
('00000000-0000-0000-0000-000000000001', 'cus_test_001', 'sub_test_001', 'price_test_001', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 month', 5.99),
('00000000-0000-0000-0000-000000000002', 'cus_test_002', 'sub_test_002', 'price_test_002', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 month', 5.99);

-- =====================================================
-- 5. INTERACTIONS AVEC LES RECETTES
-- =====================================================

INSERT INTO user_recipe_interactions (user_id, recipe_id, is_liked, is_saved, is_cooked, rating, personal_notes) VALUES
('00000000-0000-0000-0000-000000000001', (SELECT id FROM recipes WHERE slug = 'bowl-anti-inflammatoire-saumon-quinoa'), true, true, true, 5, 'Excellent! J''ai ajouté des graines de tournesol.'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM recipes WHERE slug = 'smoothie-vert-anti-inflammatoire'), true, true, true, 4, 'Très bon mais j''ai réduit le gingembre.'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM recipes WHERE slug = 'salade-quinoa-legumes-grilles'), true, false, true, 4, 'Parfait pour le déjeuner au bureau.');

-- =====================================================
-- 6. PLANS ALIMENTAIRES D'EXEMPLE
-- =====================================================

-- Insérer le plan alimentaire avec une construction JSON correcte
WITH recipe_ids AS (
  SELECT 
    (SELECT id FROM recipes WHERE slug = 'smoothie-vert-anti-inflammatoire') as smoothie_id,
    (SELECT id FROM recipes WHERE slug = 'bowl-anti-inflammatoire-saumon-quinoa') as bowl_id,
    (SELECT id FROM recipes WHERE slug = 'salade-quinoa-legumes-grilles') as salade_id
)
INSERT INTO weekly_meal_plans (user_id, week_start_date, meals, status, is_custom) 
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  CURRENT_DATE,
  jsonb_build_object(
    'lundi', jsonb_build_object(
      'petit_dejeuner', jsonb_build_object('recipe_id', smoothie_id, 'servings', 1),
      'dejeuner', jsonb_build_object('recipe_id', bowl_id, 'servings', 1),
      'diner', jsonb_build_object('recipe_id', salade_id, 'servings', 1)
    ),
    'mardi', jsonb_build_object(
      'petit_dejeuner', jsonb_build_object('recipe_id', smoothie_id, 'servings', 1),
      'dejeuner', jsonb_build_object('recipe_id', salade_id, 'servings', 1),
      'diner', jsonb_build_object('recipe_id', bowl_id, 'servings', 1)
    )
  ),
  'active',
  false
FROM recipe_ids;

-- =====================================================
-- 7. SUIVI DE PROGRESSION
-- =====================================================

INSERT INTO user_progress (user_id, recorded_date, weight_kg, energy_level, sleep_quality, mood_score, inflammation_feeling, meals_followed_percentage, notes) VALUES
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '7 days', 66.0, 6, 7, 7, 6, 85.0, 'Première semaine, quelques ajustements nécessaires'),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '3 days', 65.8, 7, 8, 8, 7, 92.0, 'Amélioration notable de l''énergie'),
('00000000-0000-0000-0000-000000000001', CURRENT_DATE, 65.5, 8, 8, 8, 8, 95.0, 'Excellent! Je me sens beaucoup mieux');

-- =====================================================
-- 8. RAFRAÎCHISSEMENT DES VUES MATÉRIALISÉES
-- =====================================================

-- Rafraîchir les vues matérialisées avec les nouvelles données
REFRESH MATERIALIZED VIEW popular_recipes_mv;
REFRESH MATERIALIZED VIEW nutrition_insights_mv;

-- =====================================================
-- 9. ANALYSE DES DONNÉES CRÉÉES
-- =====================================================

-- Vérification que tout fonctionne correctement
DO $$ 
DECLARE
  food_count integer;
  recipe_count integer;
  user_count integer;
BEGIN
  SELECT COUNT(*) INTO food_count FROM foods;
  SELECT COUNT(*) INTO recipe_count FROM recipes WHERE is_published = true;
  SELECT COUNT(*) INTO user_count FROM users WHERE is_active = true;
  
  RAISE NOTICE 'Données d''exemple créées avec succès:';
  RAISE NOTICE '- % aliments dans la base de données', food_count;
  RAISE NOTICE '- % recettes publiées', recipe_count;
  RAISE NOTICE '- % utilisateurs actifs', user_count;
  
  -- Vérifier que les calculs automatiques fonctionnent
  IF EXISTS (SELECT 1 FROM user_profiles WHERE bmr_calories IS NOT NULL) THEN
    RAISE NOTICE '✓ Calculs automatiques BMR fonctionnels';
  END IF;
  
  IF EXISTS (SELECT 1 FROM weekly_meal_plans WHERE shopping_list IS NOT NULL) THEN
    RAISE NOTICE '✓ Génération automatique des listes de courses fonctionnelle';
  END IF;
END $$;