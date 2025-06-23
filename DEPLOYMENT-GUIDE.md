# 🚀 Guide de Déploiement - Coach Nutritionnel IA

## 📋 Prérequis de Déploiement

### 1. Vérifications Pre-Deploy
```bash
# Test de build local
npm run build

# Vérification des erreurs TypeScript
npm run lint

# Tests unitaires (si configurés)
npm test
```

### 2. Variables d'Environnement Requises

#### Vercel Dashboard > Settings > Environment Variables
```env
# Authentication
NEXTAUTH_SECRET=your-super-secret-key-32-chars-min
NEXTAUTH_URL=https://your-domain.vercel.app

# Database (Neon PostgreSQL recommandé)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Stripe (Paiements)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Optionnel - pour notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Analytics (Optionnel)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## 🛠️ Étapes de Déploiement Vercel

### Option 1: Déploiement depuis GitHub (Recommandé)

1. **Push vers GitHub**
```bash
git add .
git commit -m "feat: production ready NextJS 15.3 coach nutritionnel"
git push origin main
```

2. **Import dans Vercel**
- Allez sur [vercel.com](https://vercel.com)
- "New Project" > Import depuis GitHub
- Sélectionnez le repo `coach-nutritionnel-ia`
- Framework: **Next.js** (détecté automatiquement)

3. **Configuration Vercel**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Option 2: Déploiement Vercel CLI

```bash
# Installation Vercel CLI
npm i -g vercel

# Première configuration
vercel

# Déploiement production
vercel --prod
```

## 🗄️ Configuration Base de Données

### Neon PostgreSQL (Recommandé)

1. **Créer une DB sur [neon.tech](https://neon.tech)**
2. **Récupérer l'URL de connexion**
3. **Exécuter les migrations**

```sql
-- Schema de base (exécuter dans Neon SQL Editor)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  subscribed BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  difficulty VARCHAR(50),
  inflammatory_score INTEGER,
  nutrition JSONB,
  categories JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_meal_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  week_start_date DATE,
  meals JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_recipes_categories ON recipes USING GIN(categories);
CREATE INDEX idx_meal_plans_user_date ON user_meal_plans(user_id, week_start_date);
```

## 💳 Configuration Stripe

### 1. Configuration Produits Stripe
```bash
# Créer le produit d'abonnement
curl https://api.stripe.com/v1/products \
  -u sk_live_...: \
  -d name="Coach Nutritionnel Premium" \
  -d description="Accès complet au coaching nutritionnel anti-inflammatoire"

# Créer le prix mensuel
curl https://api.stripe.com/v1/prices \
  -u sk_live_...: \
  -d product=prod_... \
  -d "recurring[interval]"=month \
  -d "unit_amount"=599 \
  -d currency=eur
```

### 2. Webhook Configuration
- URL: `https://your-domain.vercel.app/api/stripe/webhook`
- Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

## 🔧 Optimisations Production

### 1. Performance Monitoring
```typescript
// next.config.ts - Analytics intégrés
const nextConfig = {
  // ... autres configs
  experimental: {
    instrumentationHook: true,
  },
  
  // Bundle analyzer en dev
  webpack: (config, { dev }) => {
    if (dev) {
      config.plugins.push(new BundleAnalyzerPlugin());
    }
    return config;
  }
};
```

### 2. Monitoring Sentry (Optionnel)
```bash
npm install @sentry/nextjs

# Configuration automatique
npx @sentry/wizard -i nextjs
```

### 3. Speed Optimizations
```typescript
// src/app/layout.tsx - Preload critical resources
export default function RootLayout() {
  return (
    <html>
      <head>
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.stripe.com" />
      </head>
      {/* ... */}
    </html>
  );
}
```

## 🛡️ Sécurité Production

### 1. Headers de Sécurité (Déjà configurés)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff  
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Content-Security-Policy configuré

### 2. Rate Limiting API
```typescript
// middleware.ts - Rate limiting
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
- ✅ Déjà configuré dans next.config.ts
- ✅ Core Web Vitals tracking
- ✅ Performance monitoring

### 2. Google Analytics (Optionnel)
```typescript
// src/app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  );
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Optionnel)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## ✅ Checklist Pre-Launch

### Technique
- [ ] Build sans erreurs
- [ ] TypeScript sans erreurs  
- [ ] Tests passent
- [ ] Performance Lighthouse > 90
- [ ] Responsive design testé
- [ ] Navigation fonctionnelle
- [ ] Formulaires validés
- [ ] API endpoints testées

### SEO & Marketing
- [ ] Meta tags configurés
- [ ] Sitemap.xml généré
- [ ] Robots.txt configuré
- [ ] Schema.org markup
- [ ] Images optimisées
- [ ] URLs clean et SEO-friendly

### Business
- [ ] Stripe configuration testée
- [ ] Emails transactionnels
- [ ] Politique de confidentialité
- [ ] CGU/CGV
- [ ] RGPD compliance
- [ ] Support client configuré

## 🚀 Go Live!

### Commandes Finales
```bash
# Build final
npm run build

# Deploy production
vercel --prod

# Vérifier le déploiement
curl -I https://your-domain.vercel.app
```

### Post-Launch
1. ✅ Vérifier toutes les pages
2. ✅ Tester le flux d'inscription/connexion
3. ✅ Vérifier les paiements Stripe
4. ✅ Monitoring erreurs
5. ✅ Performance Web Vitals
6. ✅ Analytics configurés

---

## 📞 Support

Pour toute question sur le déploiement :
- 📧 Email: support@coach-nutritionnel-ia.com  
- 📱 Documentation: [docs.vercel.com](https://vercel.com/docs)
- 🛠️ Stripe: [stripe.com/docs](https://stripe.com/docs)

**🎉 Félicitations ! Votre application Coach Nutritionnel IA est maintenant en production avec Next.js 15.3 !**