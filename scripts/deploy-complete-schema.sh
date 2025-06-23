#!/bin/bash

# =====================================================
# DÉPLOIEMENT AUTOMATISÉ DU SCHÉMA POSTGRESQL COMPLET
# =====================================================
# Coach Nutritionnel IA - Agent Database/Schema
# Version: 1.0
# Date: 2025-06-23

set -e # Arrêter en cas d'erreur

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_DIR="$PROJECT_DIR/supabase/migrations"
SCRIPTS_DIR="$PROJECT_DIR/scripts"

echo -e "${BLUE}🚀 DÉPLOIEMENT DU SCHÉMA POSTGRESQL COMPLET${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Erreur: Supabase CLI n'est pas installé${NC}"
    echo "Installation: npm install -g supabase"
    exit 1
fi

# Vérifier la configuration Supabase
if [ ! -f "$PROJECT_DIR/supabase/config.toml" ]; then
    echo -e "${RED}❌ Erreur: Configuration Supabase manquante${NC}"
    echo "Exécutez 'supabase init' dans le répertoire du projet"
    exit 1
fi

echo -e "${YELLOW}📋 Configuration du projet:${NC}"
echo "   Répertoire: $PROJECT_DIR"
echo "   Migrations: $MIGRATIONS_DIR"
echo "   Scripts: $SCRIPTS_DIR"
echo ""

# Vérifier que les migrations existent
MIGRATION_FILES=(
    "001_initial_schema.sql"
    "002_foods_nutrition_database.sql"
    "003_advanced_functions.sql"
    "004_rls_policies_complete.sql"
    "005_triggers_and_automation.sql"
    "006_views_and_optimization.sql"
    "007_sample_data.sql"
    "008_missing_system_tables.sql"
)

echo -e "${YELLOW}🔍 Vérification des fichiers de migration...${NC}"
for migration in "${MIGRATION_FILES[@]}"; do
    if [ -f "$MIGRATIONS_DIR/$migration" ]; then
        echo -e "   ✅ $migration"
    else
        echo -e "   ❌ $migration (manquant)"
        exit 1
    fi
done
echo ""

# Fonction pour demander confirmation
confirm() {
    read -p "$(echo -e ${YELLOW}$1${NC}) [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# Vérifier le statut de Supabase
echo -e "${YELLOW}🔌 Vérification de la connexion Supabase...${NC}"
if supabase status &> /dev/null; then
    echo -e "   ✅ Connexion établie"
else
    echo -e "   ⚠️ Supabase n'est pas démarré"
    if confirm "Démarrer Supabase localement ?"; then
        echo -e "${BLUE}🚀 Démarrage de Supabase...${NC}"
        supabase start
    else
        echo -e "${RED}❌ Annulation du déploiement${NC}"
        exit 1
    fi
fi
echo ""

# Option: Reset de la base de données
if confirm "Réinitialiser complètement la base de données ?"; then
    echo -e "${YELLOW}🔄 Réinitialisation de la base de données...${NC}"
    supabase db reset
    echo -e "   ✅ Base de données réinitialisée"
    echo ""
fi

# Déploiement des migrations
echo -e "${BLUE}📦 Déploiement des migrations...${NC}"
echo ""

for i in "${!MIGRATION_FILES[@]}"; do
    migration="${MIGRATION_FILES[$i]}"
    number=$((i + 1))
    
    echo -e "${YELLOW}[$number/8] Déploiement de $migration...${NC}"
    
    if supabase migration up --include-all 2>/dev/null; then
        echo -e "   ✅ Migration appliquée avec succès"
    else
        echo -e "   ${RED}❌ Erreur lors de l'application de la migration${NC}"
        echo -e "   ${YELLOW}Essayez d'appliquer manuellement:${NC}"
        echo -e "   supabase db push"
        exit 1
    fi
    
    sleep 1
done

echo ""
echo -e "${GREEN}✅ Toutes les migrations ont été appliquées avec succès !${NC}"
echo ""

# Validation du schéma
echo -e "${BLUE}🔍 Validation du schéma déployé...${NC}"
if [ -f "$SCRIPTS_DIR/validate-schema.sql" ]; then
    if supabase db push && psql "$(supabase status -o env | grep DATABASE_URL | cut -d= -f2-)" -f "$SCRIPTS_DIR/validate-schema.sql" &> /dev/null; then
        echo -e "   ✅ Validation réussie"
    else
        echo -e "   ⚠️ Problème détecté lors de la validation"
        echo -e "   ${YELLOW}Exécutez manuellement: psql ... -f scripts/validate-schema.sql${NC}"
    fi
else
    echo -e "   ⚠️ Script de validation manquant"
fi
echo ""

# Génération des types TypeScript
echo -e "${BLUE}📝 Génération des types TypeScript...${NC}"
if supabase gen types typescript --local > "$PROJECT_DIR/lib/supabase/types.ts"; then
    echo -e "   ✅ Types générés dans lib/supabase/types.ts"
else
    echo -e "   ${RED}❌ Erreur lors de la génération des types${NC}"
fi
echo ""

# Affichage des informations de connexion
echo -e "${GREEN}🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "${YELLOW}📊 Informations de connexion:${NC}"
supabase status | grep -E "(API URL|anon key|service_role key|DB URL)"
echo ""

echo -e "${YELLOW}🔧 Prochaines étapes recommandées:${NC}"
echo "   1. Vérifiez le dashboard Supabase: http://localhost:54323"
echo "   2. Testez l'API REST: http://localhost:54321/rest/v1/"
echo "   3. Configurez les variables d'environnement dans .env.local"
echo "   4. Démarrez l'application Next.js: npm run dev"
echo ""

echo -e "${YELLOW}📚 Documentation:${NC}"
echo "   - Architecture: DATABASE_ARCHITECTURE.md"
echo "   - Rapport complet: SCHEMA_COMPLETION_REPORT.md"
echo "   - Guide déploiement: DEPLOYMENT-GUIDE.md"
echo ""

echo -e "${BLUE}✨ Le schéma PostgreSQL est maintenant opérationnel !${NC}"