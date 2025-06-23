# 🥗 Coach Nutritionnel IA - Next.js 15.3

> **Application de coaching nutritionnel personnalisé spécialisée dans l'alimentation anti-inflammatoire**

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com/)

## 🌟 Fonctionnalités Principales

### 🤖 Intelligence Artificielle
- **Coach IA personnalisé** adaptatif selon votre profil
- **Recommandations nutritionnelles** basées sur l'anti-inflammation
- **Analyse alimentaire** en temps réel avec scoring

### 🍽️ Nutrition Anti-Inflammatoire
- **1000+ recettes** scientifiquement validées
- **Plans de repas** personnalisés et adaptatifs
- **Score anti-inflammatoire** pour chaque aliment
- **Suivi nutritionnel** complet avec macros/micros

### 📊 Suivi & Progression
- **Dashboard interactif** avec métriques de bien-être
- **Tracking inflammation** et niveau d'énergie
- **Objectifs personnalisés** et gamification
- **Rapports détaillés** de progression

### 💼 Business Ready
- **Abonnement** 5,99€/mois via Stripe
- **Authentification** sécurisée NextAuth.js v5
- **PWA** installable sur mobile
- **SEO optimisé** pour le marché français

## 🚀 Stack Technique (2025)

### Core Framework
```json
{
  "framework": "Next.js 15.3",
  "router": "App Router",
  "react": "19.0.0",
  "typescript": "5.0+",
  "mode": "strict"
}
```

### Styling & UI
```json
{
  "css": "Tailwind CSS 4.0",
  "ui": "Radix UI + shadcn/ui",
  "fonts": "next/font (Inter + Playfair Display)",
  "icons": "Lucide React",
  "responsive": "Mobile-first"
}
```

### Backend & Data
```json
{
  "database": "PostgreSQL (Neon)",
  "orm": "Prisma",
  "auth": "NextAuth.js v5",
  "payments": "Stripe",
  "api": "REST + Server Actions"
}
```

### Performance & SEO
```json
{
  "bundler": "Turbopack",
  "images": "next/image (WebP/AVIF)",
  "seo": "Sitemap + Robots + Meta",
  "monitoring": "Vercel Analytics",
  "pwa": "Service Worker ready"
}
```

## 🛠️ Installation Rapide

### Prérequis
- Node.js 20+
- npm ou pnpm
- Git

### Setup Local
```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/coach-nutritionnel-ia.git
cd coach-nutritionnel-ia

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env.local

# 4. Démarrer en développement avec Turbopack
npm run dev

# 🎉 Ouvrir http://localhost:3000
```

### Variables d'Environnement
```env
# Authentication
NEXTAUTH_SECRET=your-super-secret-key-32-chars-min
NEXTAUTH_URL=http://localhost:3000

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional: Email & Analytics
SMTP_HOST=smtp.gmail.com
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## 📊 Architecture Next.js 15.3

### Structure App Router
```
src/app/
├── layout.tsx              # Root layout avec Meta SEO
├── page.tsx               # Homepage avec Suspense
├── loading.tsx            # Loading UI
├── error.tsx              # Error boundaries
├── not-found.tsx          # 404 personnalisée
├── globals.css            # Tailwind imports
├── manifest.ts            # PWA manifest
├── robots.ts              # SEO robots
├── sitemap.ts             # SEO sitemap
│
├── dashboard/             # Protected routes
│   ├── layout.tsx         # Dashboard layout
│   ├── page.tsx           # Dashboard home
│   ├── recettes/          # Recipes module
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── suivi/            # Progress tracking
│       └── page.tsx
│
├── blog/                 # Public blog
│   ├── layout.tsx
│   ├── page.tsx
│   └── [slug]/
│       ├── page.tsx      # Dynamic routes
│       ├── loading.tsx
│       └── error.tsx
│
├── abonnement/           # Subscription
│   └── page.tsx
│
└── api/                  # API Routes
    ├── auth/
    │   ├── [...nextauth]/
    │   │   └── route.ts  # NextAuth.js v5
    │   └── register/
    │       └── route.ts  # User registration
    ├── nutrition/
    │   └── analyse/
    │       └── route.ts  # Nutrition analysis
    └── recettes/
        └── recommendations/
            └── route.ts  # Recipe recommendations
```

### Composants Architecture
```
src/components/
├── ui/                   # Base UI (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── loading-spinner.tsx
│   └── index.ts         # Barrel exports
│
├── layout/              # Layout components
│   ├── Navigation.tsx   # Main navigation
│   └── Footer.tsx       # Site footer
│
├── sections/            # Page sections
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   ├── TestimonialsSection.tsx
│   ├── PricingSection.tsx
│   └── CTASection.tsx
│
├── nutrition/           # Nutrition specific
│   ├── recipe-card.tsx
│   ├── nutrition-score.tsx
│   ├── meal-plan-card.tsx
│   ├── meal-planner.tsx
│   └── index.ts
│
└── auth/               # Authentication
    └── register-form.tsx
```

## ⚡ Optimisations Next.js 15.3

### Server Components par Défaut
```typescript
// src/app/dashboard/page.tsx - Server Component
export default async function DashboardPage() {
  // Data fetching côté serveur
  const userStats = await getUserStats();
  
  return (
    <div>
      <h1>Dashboard</h1>
      <UserStats data={userStats} />
    </div>
  );
}
```

### Client Components Explicites
```typescript
// src/components/nutrition/meal-planner.tsx
'use client'; // Explicite pour interactivité

import { useState } from 'react';

export function MealPlanner() {
  const [selectedMeal, setSelectedMeal] = useState(null);
  // Logique interactive...
}
```

### Streaming avec Suspense
```typescript
// src/app/page.tsx - Streaming UI
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <div>
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection />
      </Suspense>
      
      <Suspense fallback={<div className="h-96 animate-pulse" />}>
        <FeaturesSection />
      </Suspense>
    </div>
  );
}
```

## 🔧 Scripts de Développement

```bash
# Développement avec Turbopack (ultra-rapide)
npm run dev

# Build production
npm run build

# Lancer en production locale
npm run start

# Linting TypeScript + ESLint
npm run lint

# Type checking
npm run type-check

# Analyse du bundle
npm run analyze
```

## 🚀 Déploiement Production

### Vercel (Recommandé)
```bash
# Installation Vercel CLI
npm i -g vercel

# Déploiement
vercel --prod
```

### Variables Production
```env
NEXTAUTH_SECRET=production-secret-key
NEXTAUTH_URL=https://coach-nutritionnel-ia.vercel.app
DATABASE_URL=postgresql://prod-db-url
STRIPE_SECRET_KEY=sk_live_...
```

## 📈 Performance Metrics

### Lighthouse Scores (Objectifs)
- **Performance**: 95+ 🚀
- **Accessibility**: 100 ♿
- **Best Practices**: 100 ✅
- **SEO**: 100 📈

### Core Web Vitals
- **LCP**: < 2.5s ⚡
- **FID**: < 100ms 👆  
- **CLS**: < 0.1 📐

## 🛡️ Sécurité & Conformité

### Headers de Sécurité
```typescript
// next.config.ts - Headers automatiques
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  }
];
```

### RGPD & Privacy
- ✅ Consentement cookies
- ✅ Politique de confidentialité
- ✅ Droit à l'oubli
- ✅ Export des données

## 📚 Documentation

| Document | Description |
|----------|------------|
| [🚀 DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) | Guide complet de déploiement |
| [🏗️ ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture technique détaillée |
| [🎨 DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Design system et composants |

## 🤝 Contribution

### Workflow Git
```bash
# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Commit avec convention
git commit -m "feat: ajouter analyseur nutritionnel IA"

# Push et créer PR
git push origin feature/nouvelle-fonctionnalite
```

### Standards Code
- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Conventional Commits
- ✅ Tests obligatoires
- ✅ Review code systématique

## 📞 Support & Contact

- 📧 **Email**: dev@coach-nutritionnel-ia.com
- 💬 **Discord**: [Communauté Dev](https://discord.gg/coach-ai)
- 📖 **Docs**: [docs.coach-nutritionnel-ia.com](https://docs.coach-nutritionnel-ia.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/votre-username/coach-nutritionnel-ia/issues)

## 📄 Licence

MIT License - voir [LICENSE](./LICENSE)

---

<div align="center">

**🎯 Fait avec ❤️ en France avec Next.js 15.3**

*Coach Nutritionnel IA - Transformez votre alimentation, transformez votre vie*

[🌐 Website](https://coach-nutritionnel-ia.vercel.app) • [📱 Download](https://apps.apple.com/fr/app/coach-nutritionnel-ia) • [📧 Newsletter](https://newsletter.coach-nutritionnel-ia.com)

</div>