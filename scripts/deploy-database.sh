#!/bin/bash

# =====================================================
# SCRIPT DE DÉPLOIEMENT BASE DE DONNÉES - COACH NUTRITIONNEL IA
# =====================================================
# Version: 1.0
# Date: 2025-06-23
# Description: Script automatisé pour déployer l'architecture PostgreSQL complète

set -e  # Arrêt en cas d'erreur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUPABASE_DIR="$PROJECT_ROOT/supabase"
MIGRATIONS_DIR="$SUPABASE_DIR/migrations"
FUNCTIONS_DIR="$SUPABASE_DIR/functions"

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier si Supabase CLI est installé
    if ! command -v supabase &> /dev/null; then
        error "Supabase CLI n'est pas installé"
        error "Installez-le avec: npm install -g supabase"
        exit 1
    fi
    
    # Vérifier si psql est installé
    if ! command -v psql &> /dev/null; then
        warning "psql n'est pas installé - certaines fonctions de maintenance ne seront pas disponibles"
    fi
    
    # Vérifier la structure des dossiers
    if [[ ! -d "$MIGRATIONS_DIR" ]]; then
        error "Dossier migrations non trouvé: $MIGRATIONS_DIR"
        exit 1
    fi
    
    if [[ ! -d "$FUNCTIONS_DIR" ]]; then
        error "Dossier functions non trouvé: $FUNCTIONS_DIR"
        exit 1
    fi
    
    success "Prérequis vérifiés"
}

# Vérification des variables d'environnement
check_environment() {
    log "Vérification des variables d'environnement..."
    
    if [[ -z "$SUPABASE_PROJECT_REF" ]]; then
        warning "SUPABASE_PROJECT_REF non défini - utilisation du projet local"
    fi
    
    if [[ -z "$DATABASE_URL" && -z "$SUPABASE_DB_PASSWORD" ]]; then
        warning "Variables de base de données non définies"
        warning "Assurez-vous d'avoir configuré Supabase correctement"
    fi
    
    success "Variables d'environnement vérifiées"
}

# Démarrage du projet Supabase local (si nécessaire)
start_supabase_local() {
    log "Démarrage de Supabase en local..."
    
    if supabase status | grep -q "API URL"; then
        success "Supabase déjà démarré"
    else
        log "Initialisation de Supabase..."
        cd "$PROJECT_ROOT"
        
        if [[ ! -f "supabase/config.toml" ]]; then
            log "Initialisation du projet Supabase..."
            supabase init
        fi
        
        log "Démarrage des services Supabase..."
        supabase start
        success "Supabase démarré avec succès"
    fi
}

# Application des migrations
apply_migrations() {
    log "Application des migrations..."
    
    cd "$PROJECT_ROOT"
    
    # Vérifier que les fichiers de migration existent
    migration_files=(
        "001_initial_schema.sql"
        "002_foods_nutrition_database.sql"
        "003_advanced_functions.sql"
        "004_rls_policies_complete.sql"
        "005_triggers_and_automation.sql"
        "006_views_and_optimization.sql"
        "007_sample_data.sql"
    )
    
    for file in "${migration_files[@]}"; do
        if [[ ! -f "$MIGRATIONS_DIR/$file" ]]; then
            error "Fichier de migration manquant: $file"
            exit 1
        fi
    done
    
    # Appliquer les migrations
    log "Application des migrations de base de données..."
    if supabase db push; then
        success "Migrations appliquées avec succès"
    else
        error "Échec de l'application des migrations"
        exit 1
    fi
}

# Déploiement des fonctions
deploy_functions() {
    log "Déploiement des fonctions..."
    
    # Les fonctions de backup et maintenance sont dans les migrations
    # mais on peut les exécuter séparément si nécessaire
    
    if [[ -f "$FUNCTIONS_DIR/backup_and_maintenance.sql" ]]; then
        log "Déploiement des fonctions de maintenance..."
        supabase db execute --file "$FUNCTIONS_DIR/backup_and_maintenance.sql"
        success "Fonctions de maintenance déployées"
    fi
}

# Génération des types TypeScript
generate_types() {
    log "Génération des types TypeScript..."
    
    cd "$PROJECT_ROOT"
    
    # Créer le dossier lib/supabase s'il n'existe pas
    mkdir -p "lib/supabase"
    
    # Générer les types
    if supabase gen types typescript --local > "lib/supabase/types.generated.ts"; then
        success "Types TypeScript générés dans lib/supabase/types.generated.ts"
    else
        warning "Échec de la génération des types TypeScript"
    fi
}

# Rafraîchissement des vues matérialisées
refresh_materialized_views() {
    log "Rafraîchissement des vues matérialisées..."
    
    cd "$PROJECT_ROOT"
    
    # Exécuter la fonction de rafraîchissement
    if supabase db execute --command "SELECT refresh_materialized_views();"; then
        success "Vues matérialisées rafraîchies"
    else
        warning "Impossible de rafraîchir les vues matérialisées"
    fi
}

# Test de l'installation
test_installation() {
    log "Test de l'installation..."
    
    cd "$PROJECT_ROOT"
    
    # Test des tables principales
    tables_to_check=(
        "users"
        "user_profiles" 
        "recipes"
        "foods"
        "weekly_meal_plans"
        "subscriptions"
    )
    
    for table in "${tables_to_check[@]}"; do
        if supabase db execute --command "SELECT 1 FROM $table LIMIT 1;" &>/dev/null; then
            success "Table $table: OK"
        else
            error "Table $table: ERREUR"
        fi
    done
    
    # Test des fonctions
    functions_to_check=(
        "calculate_bmr"
        "calculate_daily_calories"
        "get_personalized_recipe_recommendations"
        "generate_shopping_list"
    )
    
    for func in "${functions_to_check[@]}"; do
        if supabase db execute --command "SELECT prokind FROM pg_proc WHERE proname = '$func';" | grep -q "f"; then
            success "Fonction $func: OK"
        else
            warning "Fonction $func: Non trouvée"
        fi
    done
    
    # Test des vues matérialisées
    views_to_check=(
        "popular_recipes_mv"
        "nutrition_insights_mv"
    )
    
    for view in "${views_to_check[@]}"; do
        if supabase db execute --command "SELECT 1 FROM $view LIMIT 1;" &>/dev/null; then
            success "Vue matérialisée $view: OK"
        else
            warning "Vue matérialisée $view: Erreur ou vide"
        fi
    done
}

# Affichage des informations de connexion
show_connection_info() {
    log "Informations de connexion:"
    
    # Récupérer les informations de Supabase
    supabase status
    
    echo ""
    log "URLs importantes:"
    echo "• Studio: $(supabase status | grep "Studio URL" | awk '{print $3}')"
    echo "• API: $(supabase status | grep "API URL" | awk '{print $3}')"
    echo "• DB: $(supabase status | grep "DB URL" | awk '{print $3}')"
    echo ""
    
    success "Installation terminée avec succès!"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Consultez DATABASE_ARCHITECTURE.md pour la documentation complète"
    echo "2. Configurez vos variables d'environnement dans .env.local"
    echo "3. Lancez votre application Next.js avec: npm run dev"
    echo "4. Programmez les tâches de maintenance avec les scripts fournis"
}

# Configuration des tâches CRON (optionnel)
setup_cron_jobs() {
    if [[ "$1" == "--setup-cron" ]]; then
        log "Configuration des tâches CRON..."
        
        # Créer un script de maintenance
        cat > "$PROJECT_ROOT/scripts/daily_maintenance.sh" << 'EOF'
#!/bin/bash
# Maintenance quotidienne automatique
cd "$(dirname "$0")/.."
supabase db execute --command "SELECT daily_maintenance();" >> logs/maintenance.log 2>&1
EOF
        
        cat > "$PROJECT_ROOT/scripts/weekly_maintenance.sh" << 'EOF'
#!/bin/bash
# Maintenance hebdomadaire automatique  
cd "$(dirname "$0")/.."
supabase db execute --command "SELECT weekly_maintenance();" >> logs/maintenance.log 2>&1
EOF
        
        chmod +x "$PROJECT_ROOT/scripts/daily_maintenance.sh"
        chmod +x "$PROJECT_ROOT/scripts/weekly_maintenance.sh"
        
        mkdir -p "$PROJECT_ROOT/logs"
        
        success "Scripts de maintenance créés"
        echo "Pour activer les tâches CRON, ajoutez à votre crontab:"
        echo "0 2 * * * $PROJECT_ROOT/scripts/daily_maintenance.sh"
        echo "0 3 * * 0 $PROJECT_ROOT/scripts/weekly_maintenance.sh"
    fi
}

# Fonction principale
main() {
    echo "🚀 DÉPLOIEMENT BASE DE DONNÉES - COACH NUTRITIONNEL IA"
    echo "========================================================"
    echo ""
    
    check_prerequisites
    check_environment
    start_supabase_local
    apply_migrations
    deploy_functions
    generate_types
    refresh_materialized_views
    test_installation
    setup_cron_jobs "$@"
    show_connection_info
}

# Gestion des arguments
case "${1:-}" in
    "--help"|"-h")
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h         Afficher cette aide"
        echo "  --setup-cron       Configurer les scripts de maintenance CRON"
        echo "  --local-only       Déployer uniquement en local"
        echo "  --production       Déployer en production (nécessite SUPABASE_PROJECT_REF)"
        echo ""
        echo "Exemples:"
        echo "  $0                 # Déploiement standard en local"
        echo "  $0 --setup-cron    # Déploiement avec configuration CRON"
        echo "  $0 --production    # Déploiement en production"
        exit 0
        ;;
    "--production")
        if [[ -z "$SUPABASE_PROJECT_REF" ]]; then
            error "SUPABASE_PROJECT_REF requis pour le déploiement en production"
            exit 1
        fi
        log "Mode production activé"
        main "$@"
        ;;
    *)
        main "$@"
        ;;
esac