#!/bin/bash

# =====================================================
# COACH NUTRITIONNEL IA - SETUP SUPABASE COMPLET
# =====================================================

echo "🚀 Configuration automatique Supabase pour Coach Nutritionnel IA"
echo "=================================================="

# Vérifier si les variables sont définies
if [ -z "$SUPABASE_PROJECT_REF" ] || [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ Variables manquantes!"
    echo "Définissez :"
    echo "export SUPABASE_PROJECT_REF=your_project_ref"
    echo "export SUPABASE_ACCESS_TOKEN=your_access_token"
    exit 1
fi

echo "✅ Variables Supabase configurées"
echo "📁 Projet: $SUPABASE_PROJECT_REF"

# Se connecter au projet
echo "🔗 Connexion au projet Supabase..."
supabase link --project-ref "$SUPABASE_PROJECT_REF"

# Exécuter les migrations dans l'ordre
echo "📊 Exécution des migrations..."

echo "  → Migration 001: Schema initial..."
supabase db push --file supabase/migrations/001_initial_schema.sql

echo "  → Migration 002: Base nutrition..."
supabase db push --file supabase/migrations/002_foods_nutrition_database.sql

echo "  → Migration 003: Fonctions avancées..."
supabase db push --file supabase/migrations/003_advanced_functions.sql

echo "  → Migration 004: Politiques RLS..."
supabase db push --file supabase/migrations/004_rls_policies_complete.sql

echo "  → Migration 005: Triggers..."
supabase db push --file supabase/migrations/005_triggers_and_automation.sql

echo "  → Migration 006: Vues et optimisation..."
supabase db push --file supabase/migrations/006_views_and_optimization.sql

echo "  → Migration 007: Données de test..."
supabase db push --file supabase/migrations/007_sample_data.sql

echo "  → Migration 008: Tables système..."
supabase db push --file supabase/migrations/008_missing_system_tables.sql

# Générer les types TypeScript
echo "🔧 Génération des types TypeScript..."
supabase gen types typescript --local > src/lib/supabase/types.ts

# Récupérer les informations du projet
echo "📋 Informations de configuration:"
echo "=================================================="
supabase status

echo ""
echo "🎉 Configuration Supabase terminée!"
echo "📝 Copiez ces variables dans Vercel:"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=https://$SUPABASE_PROJECT_REF.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=[voir dans Settings > API]"
echo "SUPABASE_SERVICE_ROLE_KEY=[voir dans Settings > API]"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "NEXTAUTH_URL=https://your-app.vercel.app"
echo ""
echo "🔗 Dashboard Supabase: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_REF"