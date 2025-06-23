# 🎯 Guide de Configuration Supabase - Coach Nutritionnel IA

## 📋 Étapes de Configuration

### **1. Créer le Projet Supabase**

1. **Allez sur** https://supabase.com/dashboard
2. **Cliquez sur** "New Project"
3. **Configurez** :
   - Name: `Coach Nutritionnel IA`
   - Database Password: `[générez un mot de passe fort]`
   - Region: `Europe (eu-west-1)`
   - Pricing: `Free tier` (suffisant pour démarrer)

### **2. Configuration Automatique avec Script**

Une fois le projet créé :

```bash
# Dans le terminal
cd /Users/manu/Documents/DEV/coach-nutritionnel-ia

# Définir les variables (remplacez par vos valeurs)
export SUPABASE_PROJECT_REF="your_project_ref_from_url"
export SUPABASE_ACCESS_TOKEN="your_access_token"

# Exécuter le script de setup
./setup-supabase.sh
```

### **3. Configuration Manuelle Alternative**

Si vous préférez la configuration manuelle :

#### **A. Exécuter les Migrations SQL**

Dans **SQL Editor** de Supabase, exécutez dans l'ordre :

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_foods_nutrition_database.sql`
3. `supabase/migrations/003_advanced_functions.sql`
4. `supabase/migrations/004_rls_policies_complete.sql`
5. `supabase/migrations/005_triggers_and_automation.sql`
6. `supabase/migrations/006_views_and_optimization.sql`
7. `supabase/migrations/007_sample_data.sql`
8. `supabase/migrations/008_missing_system_tables.sql`

#### **B. Configurer l'Authentification**

Dans **Authentication > Settings** :

- ✅ **Enable email confirmation** : Activé
- ✅ **Enable phone confirmation** : Optionnel
- ✅ **Site URL** : `https://your-app.vercel.app`
- ✅ **Redirect URLs** : 
  - `https://your-app.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (pour dev)

#### **C. Configurer les Providers OAuth** (Optionnel)

Dans **Authentication > Providers** :

- **Google** : Configurez avec vos Client ID/Secret
- **GitHub** : Configurez avec vos credentials
- **Apple** : Pour iOS (optionnel)

### **4. Variables d'Environnement pour Vercel**

Une fois Supabase configuré, ajoutez dans **Vercel Dashboard > Settings > Environment Variables** :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY from Settings > API]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY from Settings > API]

# NextAuth Configuration  
NEXTAUTH_SECRET=[généré automatiquement par le script]
NEXTAUTH_URL=https://your-app.vercel.app

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### **5. Vérification de l'Installation**

#### **Tables Créées (21 au total)** :
- ✅ `users` - Gestion utilisateurs
- ✅ `user_profiles` - Profils détaillés
- ✅ `foods` - Base de données alimentaire
- ✅ `recipes` - Recettes nutritionnelles
- ✅ `meal_plans` - Plans de repas
- ✅ `user_progress` - Suivi progression
- ✅ `subscriptions` - Gestion abonnements
- ✅ `audit_logs` - Journalisation
- ✅ `user_action_rates` - Rate limiting
- ✅ Et 12 autres tables...

#### **Fonctions PostgreSQL (40+)** :
- ✅ Calculs nutritionnels
- ✅ Scoring anti-inflammatoire
- ✅ Recommandations IA
- ✅ Rate limiting
- ✅ Audit automatique

#### **Row Level Security** :
- ✅ Politiques de sécurité sur toutes les tables
- ✅ Isolation des données par utilisateur
- ✅ Permissions granulaires

### **6. Tests de Fonctionnement**

Une fois configuré, testez :

1. **Connexion** : `supabase status`
2. **Base de données** : Vérifiez les tables dans l'onglet "Table Editor"
3. **API** : Testez avec l'onglet "API Docs"
4. **Auth** : Créez un utilisateur test

### **🚀 Déploiement Final**

Une fois Supabase configuré :

1. **Variables Vercel** ajoutées ✅
2. **GitHub repository** prêt ✅
3. **Deploy Vercel** : Le déploiement se fera automatiquement

### **📞 Support**

Si vous rencontrez des problèmes :

1. **Logs Supabase** : Consultez l'onglet "Logs"
2. **Documentation** : https://supabase.com/docs
3. **Discord Supabase** : Support communautaire

---

## 🎉 Résultat Final

Votre application **Coach Nutritionnel IA** sera complètement opérationnelle avec :

- ✅ **Base de données** PostgreSQL complète
- ✅ **Authentification** sécurisée
- ✅ **API tRPC** 80+ endpoints
- ✅ **Intelligence nutrition** scoring anti-inflammatoire
- ✅ **Monitoring** et audit complet
- ✅ **Performance** optimisée production

**Production ready en quelques clics !** 🚀