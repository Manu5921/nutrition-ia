# 🗃️ ARCHITECTURE BASE DE DONNÉES - COACH NUTRITIONNEL IA

## 📋 Vue d'ensemble

Cette documentation décrit l'architecture PostgreSQL complète pour l'application Coach Nutritionnel IA, un système de coaching nutritionnel anti-inflammatoire avec abonnement premium.

## 🏗️ Architecture générale

### Stack technique
- **Base de données** : PostgreSQL 15+ avec Supabase
- **Extensions** : uuid-ossp, pg_trgm, btree_gin
- **Sécurité** : Row Level Security (RLS) complet
- **Performance** : Index composites, vues matérialisées
- **Backup** : Fonctions automatisées de sauvegarde

### Modèle de données
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USERS       │────│  USER_PROFILES  │────│ USER_PREFERENCES │
│                 │    │                 │    │                 │
│ - Authentication│    │ - Health data   │    │ - Food prefs    │
│ - Subscriptions │    │ - Physical data │    │ - Notifications │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │ NUTRITION_GOALS │              │
         │              │                 │              │
         │              │ - Daily targets │              │
         │              │ - Macro ratios  │              │
         │              └─────────────────┘              │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│WEEKLY_MEAL_PLANS│    │USER_PROGRESS    │    │RECIPE_INTERACTIONS│
│                 │    │                 │    │                 │
│ - 7-day plans   │    │ - Weight tracking│    │ - Likes/Saves   │
│ - Shopping lists│    │ - Wellness scores│    │ - Ratings       │
│ - AI generated  │    │ - Progress photos│    │ - Cook history  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  SHOPPING_LISTS │    │DAILY_NUTRITION  │    │    RECIPES      │
│                 │    │   _TRACKING     │    │                 │
│ - Auto-generated│    │                 │    │ - Anti-inflam   │
│ - Cost estimates│    │ - Daily intake  │    │ - Instructions  │
│ - Categories    │    │ - Goal progress │    │ - Nutrition     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │     FOODS       │    │FOOD_COMBINATIONS│
                       │                 │    │                 │
                       │ - Nutrition DB  │    │ - Synergies     │
                       │ - Anti-inflam   │    │ - Compatibilities│
                       │ - Seasonality   │    │ - Science refs  │
                       └─────────────────┘    └─────────────────┘
```

## 📁 Structure des migrations

### `/supabase/migrations/`

1. **001_initial_schema.sql** - Schema de base complet
2. **002_foods_nutrition_database.sql** - Base de données alimentaire
3. **003_advanced_functions.sql** - Fonctions PostgreSQL avancées
4. **004_rls_policies_complete.sql** - Politiques de sécurité RLS
5. **005_triggers_and_automation.sql** - Triggers et automatisation
6. **006_views_and_optimization.sql** - Vues et optimisations
7. **007_sample_data.sql** - Données d'exemple pour développement

### `/supabase/functions/`

- **backup_and_maintenance.sql** - Fonctions de sauvegarde et maintenance

## 🗂️ Tables principales

### 👤 Gestion des utilisateurs

#### `users`
Table principale d'authentification Supabase.
```sql
- id (uuid, PK)
- email (text, unique)
- phone (text)
- email_verified_at (timestamp)
- is_active (boolean)
- metadata (jsonb)
```

#### `user_profiles`
Profils détaillés avec données physiques et objectifs.
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- first_name, last_name (text)
- birth_date (date)
- gender (enum)
- weight_kg, height_cm (numeric)
- activity_level (enum)
- health_goals (text[])
- food_restrictions, allergies (text[])
- bmr_calories, daily_calorie_needs (integer, calculés automatiquement)
```

#### `user_preferences`
Préférences alimentaires et personnalisation.
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- favorite_cuisines (text[])
- preferred_cooking_methods (text[])
- meal_times (jsonb)
- notification_preferences (jsonb)
- ai_personalization_data (jsonb)
```

### 🍽️ Système nutritionnel

#### `foods`
Base de données alimentaire complète.
```sql
- id (uuid, PK)
- name_fr (text)
- category, subcategory (text)
- nutrition_per_100g (jsonb) -- Valeurs nutritionnelles complètes
- anti_inflammatory_score (1-10)
- inflammatory_potential (enum)
- allergens, diet_compatibility (text[])
- season_availability (text[])
- average_price_per_kg (decimal)
```

#### `recipes`
Recettes anti-inflammatoires avec scoring.
```sql
- id (uuid, PK)
- name, slug (text)
- description (text)
- ingredients (jsonb) -- Structure : [{"name", "quantity", "unit", "notes"}]
- instructions (text[])
- nutrition_facts (jsonb)
- anti_inflammatory_score (1-10)
- servings, prep_time_minutes, cook_time_minutes (integer)
- difficulty_level (enum)
- meal_type, diet_tags, season (text[])
- cost_per_serving_euro (decimal)
- is_featured, is_published (boolean)
- rating_avg, rating_count (calculated)
```

#### `food_combinations`
Synergies et interactions entre aliments.
```sql
- id (uuid, PK)
- food_1_id, food_2_id (uuid, FK)
- combination_type (enum: synergique, complementaire, antagoniste)
- nutritional_benefits (text[])
- synergy_score (1-10)
- scientific_explanation (text)
```

### 📅 Plans alimentaires

#### `weekly_meal_plans`
Plans alimentaires hebdomadaires générés par IA.
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- week_start_date (date)
- meals (jsonb) -- Structure : {"lundi": {"petit_dejeuner": {"recipe_id", "servings"}}}
- shopping_list (jsonb, auto-générée)
- total_estimated_cost_euro (decimal)
- anti_inflammatory_score_avg (decimal)
- status (enum: draft, active, completed, cancelled)
- is_custom (boolean)
- generation_prompt (text)
```

#### `shopping_lists`
Listes de courses optimisées.
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- name, description (text)
- items (jsonb) -- [{"name", "quantity", "unit", "category", "estimated_cost"}]
- total_estimated_cost_euro (decimal)
- status (enum)
- source_meal_plan_id (uuid, FK)
- is_auto_generated (boolean)
```

### 📊 Suivi et analyse

#### `nutrition_goals`
Objectifs nutritionnels personnalisés.
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- daily_calories_target (integer)
- protein_target_g, carbs_target_g, fat_target_g (decimal)
- anti_inflammatory_foods_per_day (integer)
- sodium_limit_mg, sugar_limit_g (decimal)
- valid_from, valid_until (date)
- is_active (boolean)
```

#### `daily_nutrition_tracking`
Suivi quotidien de la nutrition.
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- tracking_date (date)
- consumed_nutrition (jsonb)
- daily_targets (jsonb)
- calories_consumed (integer)
- protein_goal_percentage, carbs_goal_percentage, fat_goal_percentage (decimal)
- daily_anti_inflammatory_score (decimal)
- nutrition_quality_score (decimal)
- energy_level, hunger_satisfaction (1-10)
```

#### `user_progress`
Suivi des progrès physiques et bien-être.
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- recorded_date (date)
- weight_kg, body_fat_percentage (decimal)
- energy_level, sleep_quality, mood_score, inflammation_feeling (1-10)
- meals_followed_percentage (decimal)
- progress_photos_urls (text[])
- notes (text)
```

### 💳 Abonnements

#### `subscriptions`
Gestion des abonnements Stripe.
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- stripe_customer_id, stripe_subscription_id (text)
- status (enum: active, past_due, canceled, etc.)
- current_period_start, current_period_end (timestamp)
- amount_euro (decimal, default 5.99)
- cancel_at_period_end (boolean)
- metadata (jsonb)
```

### 🔗 Interactions

#### `user_recipe_interactions`
Interactions utilisateur-recette.
```sql
- id (uuid, PK)
- user_id, recipe_id (uuid, FK)
- is_liked, is_saved, is_cooked (boolean)
- rating (1-5)
- review_text, personal_notes (text)
- ingredient_modifications (jsonb)
- cooked_count (integer)
- times_cooked (timestamp[])
```

## 🔧 Fonctions PostgreSQL

### Calculs nutritionnels

#### `calculate_bmr(weight, height, age, gender)`
Calcule le métabolisme de base selon la formule Mifflin-St Jeor.

#### `calculate_daily_calories(bmr, activity_level)`
Calcule les besoins caloriques quotidiens selon l'activité.

#### `calculate_meal_anti_inflammatory_score(recipe_ids[], portions[])`
Calcule le score anti-inflammatoire d'un repas.

### Recommandations

#### `get_personalized_recipe_recommendations(user_id, meal_type, limit)`
Génère des recommandations personnalisées basées sur :
- Score anti-inflammatoire
- Compatibilité alimentaire
- Préférences utilisateur
- Historique des interactions

#### `calculate_diet_compatibility_score(recipe_id, user_id)`
Évalue la compatibilité d'une recette avec :
- Allergies (score 0 si allergène détecté)
- Restrictions alimentaires
- Préférences culinaires

### Analyse nutritionnelle

#### `analyze_recipe_nutrition(recipe_id, serving_size)`
Analyse nutritionnelle complète d'une recette :
- Calories totales
- Répartition des macronutriments
- Pourcentages par macro

#### `generate_shopping_list(meal_plan_id)`
Génère automatiquement une liste de courses :
- Consolidation des ingrédients
- Estimation des coûts
- Catégorisation automatique

#### `validate_meal_plan(meal_plan_data, user_id)`
Valide un plan alimentaire :
- Vérification des allergènes
- Compatibilité alimentaire
- Équilibre nutritionnel

## 🔒 Sécurité (RLS)

### Politiques principales

#### Utilisateurs
```sql
-- Accès aux propres données seulement
users_select_own: id = auth.user_id()
users_update_own: id = auth.user_id()
```

#### Fonctionnalités Premium
```sql
-- Plans alimentaires réservés aux abonnés
weekly_meal_plans_select_own_premium: 
  user_id = auth.user_id() AND can_access_premium_features(user_id)
```

#### Données publiques
```sql
-- Recettes accessibles à tous
recipes_select_published: is_published = true
-- Base alimentaire en lecture seule
foods_select_all: true
```

### Fonctions de sécurité

#### `has_active_subscription(user_id)`
Vérifie si un utilisateur a un abonnement actif.

#### `can_access_premium_features(user_id)`
Vérifie l'accès aux fonctionnalités premium (abonnés + admins).

#### `check_rate_limit(action_type, max_actions, window_minutes)`
Système de rate limiting pour prévenir les abus.

## 🚀 Performance et optimisation

### Index principaux

#### Index composites
```sql
-- Recommandations de recettes
idx_recipes_recommendation: (is_published, anti_inflammatory_score DESC, total_time_minutes)

-- Plans par utilisateur et période
idx_meal_plans_user_period: (user_id, week_start_date DESC, status)

-- Interactions utilisateur
idx_user_interactions_composite: (user_id, last_viewed_at DESC, is_liked, is_saved)
```

#### Index de recherche
```sql
-- Recherche full-text des recettes
idx_recipes_search: GIN(to_tsvector('french', name || description))

-- Recherche d'aliments
idx_foods_search: GIN(to_tsvector('french', name_fr || common_names))
```

### Vues matérialisées

#### `popular_recipes_mv`
Recettes populaires avec score composite.
```sql
popularity_score = like_count * 0.3 + cooked_count * 0.4 + avg_rating * rating_count * 0.3
```

#### `nutrition_insights_mv`
Analyses nutritionnelles agrégées par mois pour analytics.

### Vues utilitaires

#### `user_dashboard_summary`
Résumé complet pour tableau de bord utilisateur.

#### `active_subscribers`
Utilisateurs avec abonnement actif et leurs informations.

#### `ingredient_popularity`
Popularité des ingrédients basée sur l'usage dans les recettes.

## 🔄 Triggers et automatisation

### Calculs automatiques

#### `calculate_user_nutrition_needs_trigger`
Calcule automatiquement BMR, calories et protéines lors de la mise à jour du profil.

#### `auto_generate_shopping_list_trigger`
Génère automatiquement la liste de courses lors de la création d'un plan alimentaire.

### Mise à jour des statistiques

#### `update_recipe_stats_trigger`
Met à jour les compteurs de likes, ratings et moyennes en temps réel.

### Validation

#### `validate_user_profile_trigger`
Valide la cohérence des données (âge, BMI, objectifs).

#### `validate_meal_plan_data_trigger`
Valide les plans alimentaires et calcule le score anti-inflammatoire.

### Audit et sécurité

#### `audit_sensitive_changes_trigger`
Crée des logs d'audit pour les changements critiques.

#### `prevent_admin_escalation_trigger`
Empêche l'escalade non autorisée de privilèges.

## 🛠️ Maintenance et backup

### Fonctions de maintenance

#### `daily_maintenance()`
- Nettoyage rate limiting (7 jours)
- Suppression analyses anciennes (1 an)
- Mise à jour statistiques recettes
- Rafraîchissement vues matérialisées
- Analyse des tables

#### `weekly_maintenance()`
- Nettoyage logs d'audit (3 mois)
- Suppression plans brouillon anciens (30 jours)
- Optimisation des index
- Recalcul scores popularité

### Fonctions de backup

#### `create_user_backup(user_id)`
Backup complet des données utilisateur :
- Profil et préférences
- Interactions avec recettes
- Progression et suivi
- Plans alimentaires
- Objectifs nutritionnels

#### `create_full_backup()`
Backup complet de la base :
- Aliments et combinaisons
- Recettes publiées
- Statistiques générales

### Monitoring

#### `get_database_health_metrics()`
Métriques de performance :
- Taille base de données
- Connexions actives
- Statistiques des tables
- Utilisateurs actifs

#### `detect_performance_issues()`
Détection automatique :
- Tables avec trop de scans séquentiels
- Tables volumineuses
- Vues matérialisées obsolètes

## 📈 Analytics et rapports

### Métriques utilisateurs

#### `user_engagement_analytics`
- Niveau d'engagement (0-5)
- Utilisation des fonctionnalités
- Rétention et activité

#### `feature_usage_report`
- Usage des fonctionnalités principales
- Nombre d'utilisateurs uniques
- Fréquence d'utilisation

### Métriques nutritionnelles

#### `nutrition_insights_mv`
- Moyennes par mois
- Taux d'atteinte des objectifs
- Scores anti-inflammatoires

#### `ingredient_popularity`
- Ingrédients les plus utilisés
- Score de popularité composite
- Corrélation avec recettes populaires

## 🚀 Déploiement

### Variables d'environnement requises

```env
# Supabase
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Base de données
DATABASE_URL=postgresql://...
```

### Scripts de migration

```bash
# Appliquer toutes les migrations
supabase migration up

# Générer les types TypeScript
supabase gen types typescript --local > lib/supabase/types.ts

# Rafraîchir les vues matérialisées
psql -c "SELECT refresh_materialized_views();"
```

### Tâches CRON recommandées

```bash
# Maintenance quotidienne (2h du matin)
0 2 * * * psql -c "SELECT daily_maintenance();"

# Maintenance hebdomadaire (dimanche 3h)
0 3 * * 0 psql -c "SELECT weekly_maintenance();"

# Backup utilisateurs (quotidien 4h)
0 4 * * * /scripts/backup_users.sh

# Monitoring performances (toutes les heures)
0 * * * * psql -c "SELECT get_database_health_metrics();" | /scripts/check_alerts.sh
```

## 📝 Notes de développement

### Bonnes pratiques

1. **Toujours utiliser les fonctions RLS** - Jamais de bypass en production
2. **Valider les données côté serveur** - Les triggers assurent l'intégrité
3. **Monitorer les performances** - Utiliser les fonctions de monitoring
4. **Tester les migrations** - Sur une copie de prod avant déploiement
5. **Documenter les changements** - Commenter le code SQL

### Tests recommandés

1. **Tests unitaires** des fonctions PostgreSQL
2. **Tests d'intégration** des triggers
3. **Tests de performance** des vues matérialisées
4. **Tests de sécurité** des politiques RLS
5. **Tests de backup/restore**

### Extensions futures

1. **Partitioning** des grandes tables (user_progress, daily_tracking)
2. **Cache Redis** pour les recommandations fréquentes  
3. **Full-text search** avancé avec PostgreSQL FTS
4. **Machine Learning** intégré avec pg_vector
5. **API GraphQL** automatique avec PostgREST

---

Cette architecture PostgreSQL offre une base solide, sécurisée et performante pour l'application Coach Nutritionnel IA, avec tous les outils nécessaires pour la production et la maintenance.