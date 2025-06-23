# 🚀 Instructions de Déploiement Vercel - Coach Nutritionnel IA

## 📋 Configuration Automatique des Variables d'Environnement

### **Méthode 1: Via Dashboard Vercel (Recommandée)**

1. **Allez sur** https://vercel.com/dashboard
2. **Sélectionnez** votre projet `nutrition-ia`
3. **Allez dans** Settings > Environment Variables
4. **Ajoutez les variables** suivantes :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL = https://qyelzxeuffkoglfrueem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5ZWx6eGV1ZmZrb2dsZnJ1ZWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODMzMzYsImV4cCI6MjA2NjI1OTMzNn0.tfO8-U96pC4N-4v0gDv_8aNBLL5V8HcjgU8wBNCpqA4
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5ZWx6eGV1ZmZrb2dsZnJ1ZWVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4MzMzNiwiZXhwIjoyMDY2MjU5MzM2fQ.aFPKtW_d3oNQduioGPREN_QDaFJ9WDEH4ctyo95Mtn4

# NextAuth Configuration  
NEXTAUTH_SECRET = coach-nutritionnel-ia-secret-production-2025
NEXTAUTH_URL = https://nutrition-ia.vercel.app
```

5. **Cliquez** sur "Save" pour chaque variable
6. **Redéployez** automatiquement le projet

### **Méthode 2: Via CLI Vercel**

```bash
cd /Users/manu/Documents/DEV/coach-nutritionnel-ia

# Configuration des variables une par une
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Entrez: https://qyelzxeuffkoglfrueem.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production  
# Entrez: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5ZWx6eGV1ZmZrb2dsZnJ1ZWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODMzMzYsImV4cCI6MjA2NjI1OTMzNn0.tfO8-U96pC4N-4v0gDv_8aNBLL5V8HcjgU8wBNCpqA4

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Entrez: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5ZWx6eGV1ZmZrb2dsZnJ1ZWVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY4MzMzNiwiZXhwIjoyMDY2MjU5MzMzNn0.aFPKtW_d3oNQduioGPREN_QDaFJ9WDEH4ctyo95Mtn4

vercel env add NEXTAUTH_SECRET production
# Entrez: coach-nutritionnel-ia-secret-production-2025

vercel env add NEXTAUTH_URL production
# Entrez: https://nutrition-ia.vercel.app
```

## 🗄️ Configuration Supabase Database

### **Exécution des Migrations**

1. **Allez sur** https://supabase.com/dashboard/project/qyelzxeuffkoglfrueem
2. **SQL Editor** > New Query
3. **Exécutez dans l'ordre** :

#### Migration 1: Schema Initial
```sql
-- Copiez le contenu de supabase/migrations/001_initial_schema.sql
-- Et exécutez dans l'éditeur SQL
```

#### Migration 2: Base Nutrition  
```sql
-- Copiez le contenu de supabase/migrations/002_foods_nutrition_database.sql
-- Et exécutez dans l'éditeur SQL
```

#### Migration 3: Fonctions Avancées
```sql
-- Copiez le contenu de supabase/migrations/003_advanced_functions.sql
-- Et exécutez dans l'éditeur SQL
```

#### Migration 4: Politiques RLS
```sql
-- Copiez le contenu de supabase/migrations/004_rls_policies_complete.sql
-- Et exécutez dans l'éditeur SQL
```

#### Migration 5: Triggers
```sql
-- Copiez le contenu de supabase/migrations/005_triggers_and_automation.sql
-- Et exécutez dans l'éditeur SQL
```

#### Migration 6: Vues et Optimisation
```sql
-- Copiez le contenu de supabase/migrations/006_views_and_optimization.sql
-- Et exécutez dans l'éditeur SQL
```

#### Migration 7: Données d'Exemple
```sql
-- Copiez le contenu de supabase/migrations/007_sample_data.sql
-- Et exécutez dans l'éditeur SQL
```

#### Migration 8: Tables Système
```sql
-- Copiez le contenu de supabase/migrations/008_missing_system_tables.sql
-- Et exécutez dans l'éditeur SQL
```

## 🚀 Déploiement Final

### **Vérification Avant Déploiement**

1. **Variables Vercel** ✅ Configurées
2. **Database Supabase** ✅ Migrations exécutées  
3. **GitHub Repository** ✅ À jour

### **Lancement du Déploiement**

```bash
# Option A: Auto-deployment depuis GitHub
# Le déploiement se fera automatiquement à chaque push main

# Option B: Déploiement manuel
cd /Users/manu/Documents/DEV/coach-nutritionnel-ia
vercel --prod
```

## 🎯 URLs de Production

Une fois déployé :

- **Application** : https://nutrition-ia.vercel.app
- **API Health** : https://nutrition-ia.vercel.app/api/health
- **Database** : https://supabase.com/dashboard/project/qyelzxeuffkoglfrueem

## 🔧 Configuration Post-Déploiement

### **Authentication Setup**

Dans Supabase Dashboard > Authentication > Settings :

1. **Site URL** : `https://nutrition-ia.vercel.app`
2. **Redirect URLs** : 
   - `https://nutrition-ia.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (pour dev)

### **Optional: OAuth Providers**

Si vous voulez Google/GitHub login :
1. **Google** : Configurez OAuth dans Google Console
2. **GitHub** : Créez OAuth App dans GitHub Settings
3. **Ajoutez les clés** dans Vercel env variables

## ✅ Validation du Déploiement

Une fois déployé, testez :

1. **Page d'accueil** : Doit charger sans erreur
2. **Authentication** : Test inscription/connexion
3. **Dashboard** : Accès après connexion
4. **API** : `https://nutrition-ia.vercel.app/api/health`

## 🎉 Félicitations !

Votre **Coach Nutritionnel IA** est maintenant en production avec :

- ✅ **Interface moderne** Next.js 15.3
- ✅ **Base de données** PostgreSQL complète  
- ✅ **Authentification** sécurisée
- ✅ **API tRPC** 80+ endpoints
- ✅ **Intelligence nutrition** scoring anti-inflammatoire
- ✅ **PWA** avec fonctionnalités offline
- ✅ **Performance** optimisée production

**Application production-ready déployée avec succès !** 🚀