# 🏗️ ARCHITECTURE COACH NUTRITIONNEL IA

## 🎯 **PROJET OVERVIEW**

**Application :** Coach Nutritionnel Anti-Inflammatoire  
**Cible :** Débutants + Personnes en surpoids  
**Approche :** Changement lifestyle (pas régime)  
**Pricing :** 5.99€/mois (abonnement direct)  
**Marché :** France uniquement  

---

## 🚀 **WORKFLOW DÉVELOPPEMENT MULTI-AGENTS**

### 🎭 Orchestrateur (Claude Code)
- Architecture globale & coordination
- Review & validation des agents
- Intégration finale des modules

### 🎨 Agent 1 - Design System
**Responsabilité :** Interface utilisateur cohérente
```
- Tailwind CSS 4.0 configuration
- shadcn/ui components customisés
- Design tokens anti-inflammatoire (verts, oranges naturels)
- Components spécialisés nutrition
- Responsive design mobile-first
```

### ⚙️ Agent 2 - NextJS Structure  
**Responsabilité :** Architecture frontend robuste
```
- App Router Next.js 15.3 + Server Components
- Pages principales (accueil, dashboard, profil)
- Routing & navigation optimisée
- SEO meta tags dynamiques
- Performance optimizations
```

### 🗄️ Agent 3 - Backend & Data
**Responsabilité :** Infrastructure données
```
- Supabase PostgreSQL schema
- Authentication & RLS
- tRPC pour type safety
- API routes optimisées
- Data migrations
```

### 🤖 Agent 4 - IA Integration
**Responsabilité :** Intelligence artificielle
```
- OpenAI GPT-4 prompts anti-inflammatoire
- Génération recettes personnalisées
- Système recommandations
- Chat bot nutritionnel
- Coûts IA optimisés
```

### 📝 Agent 5 - Blog & SEO
**Responsabilité :** Contenu & référencement
```
- MDX + Contentlayer setup
- Articles français nutrition
- SEO meta optimization
- Sitemap & RSS génération
- Performance blog
```

### 🚀 Agent 6 - Deployment
**Responsabilité :** Production & DevOps
```
- Vercel deployment optimisé
- CI/CD GitHub Actions
- Environment variables
- Domain configuration
- Monitoring & analytics
```

---

## 📁 **STRUCTURE PROJET FINALE**

```
coach-nutritionnel-ia/
├── 🎨 DESIGN SYSTEM
│   ├── app/globals.css              # Styles globaux
│   ├── components/ui/               # shadcn/ui customisés
│   ├── lib/design/                  # Design tokens
│   └── tailwind.config.ts           # Configuration Tailwind
│
├── ⚙️ FRONTEND NEXTJS
│   ├── app/                         # App Router
│   │   ├── layout.tsx              # Layout global
│   │   ├── page.tsx                # Accueil
│   │   ├── dashboard/              # Espace membre
│   │   ├── profil/                 # Configuration utilisateur
│   │   ├── recettes/               # Catalogue recettes
│   │   └── blog/                   # Articles nutrition
│   ├── components/                  # Composants réutilisables
│   │   ├── nutrition/              # Spécifique nutrition
│   │   ├── forms/                  # Formulaires
│   │   └── layout/                 # Mise en page
│   └── hooks/                      # Custom React hooks
│
├── 🗄️ BACKEND & DATA
│   ├── lib/
│   │   ├── supabase/               # Client & types
│   │   ├── trpc/                   # tRPC configuration
│   │   └── auth/                   # Authentication
│   ├── server/                     # Server-side logic
│   │   ├── routers/                # tRPC routers
│   │   ├── db/                     # Database queries
│   │   └── middleware/             # Auth middleware
│   └── supabase/                   # Schema & migrations
│       ├── migrations/
│       └── seed.sql
│
├── 🤖 IA INTEGRATION
│   ├── lib/ai/
│   │   ├── openai.ts               # OpenAI client
│   │   ├── prompts/                # Prompts anti-inflammatoire
│   │   ├── recipes-generator.ts    # Génération recettes
│   │   └── chat-bot.ts            # Chat nutritionnel
│   └── types/ai.ts                 # Types IA
│
├── 📝 BLOG & SEO
│   ├── content/blog/               # Articles MDX français
│   ├── lib/mdx/                    # MDX processing
│   ├── contentlayer.config.ts      # Configuration
│   └── components/blog/            # Composants blog
│
└── 🚀 DEPLOYMENT
    ├── .vercel/                    # Vercel config
    ├── .github/workflows/          # CI/CD
    ├── vercel.json                 # Deployment config
    └── docker-compose.yml          # Dev local
```

---

## 🎯 **SPÉCIFICATIONS TECHNIQUES**

### Stack Core
- **Next.js 15.3** (App Router + Server Components)
- **TypeScript 5+** (strict mode)
- **Tailwind CSS 4.0** (latest features)
- **Supabase** (PostgreSQL + Auth + RLS)
- **tRPC** (Type-safe API)

### IA & Externe
- **OpenAI GPT-4** (recettes anti-inflammatoire)
- **Stripe** (abonnement 5.99€/mois)
- **Vercel** (deployment + analytics)
- **MDX + Contentlayer** (blog français)

### Performance
- **Server Components** pour SEO
- **Streaming** pour UX
- **Edge Runtime** quand possible
- **Image optimization** Next.js

---

## 🎨 **DESIGN PRINCIPLES**

### Couleurs Anti-Inflammatoire
```css
:root {
  --primary-green: #059669;     /* Vert naturel */
  --accent-orange: #ea580c;     /* Orange épices */
  --neutral-beige: #f5f5dc;     /* Beige naturel */
  --text-dark: #1f2937;         /* Texte sombre */
  --success: #10b981;           /* Succès */
  --warning: #f59e0b;           /* Attention */
}
```

### Typography
- **Font Principal :** Inter (lisibilité)
- **Font Accent :** Playfair Display (titres)
- **Tailles :** Scale modulaire 1.25

### Components Style
- **Cards :** Ombres douces, coins arrondis
- **Buttons :** Style naturel, hover subtil  
- **Forms :** Focus states accessibles
- **Icons :** Lucide React (cohérence)

---

## 📊 **DATABASE SCHEMA PREVIEW**

```sql
-- Utilisateurs & Profils
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamp DEFAULT now()
);

CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  age integer,
  weight_kg decimal,
  height_cm integer,
  activity_level text,
  health_goals text[],
  food_restrictions text[],
  preferred_meal_times text[]
);

-- Recettes Anti-Inflammatoire
CREATE TABLE recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  ingredients jsonb,
  instructions text[],
  nutrition_facts jsonb,
  anti_inflammatory_score integer,
  season text[],
  difficulty_level text,
  prep_time_minutes integer
);

-- Plans Alimentaires Hebdomadaires
CREATE TABLE weekly_meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  week_start_date date,
  meals jsonb, -- Structure JSON des repas
  shopping_list jsonb,
  generated_at timestamp DEFAULT now()
);

-- Abonnements
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  stripe_subscription_id text,
  status text,
  current_period_start timestamp,
  current_period_end timestamp
);
```

---

## 🚀 **ROADMAP DÉVELOPPEMENT**

### Semaine 1-2 : Foundation
- [ ] Agent Design : System design + composants base
- [ ] Agent NextJS : Structure pages + routing
- [ ] Agent Backend : Supabase setup + Auth

### Semaine 3-4 : Core Features  
- [ ] Agent IA : Prompts + génération recettes
- [ ] Integration : Dashboard utilisateur
- [ ] Agent Blog : Premier articles français

### Semaine 5-6 : Production
- [ ] Agent Deploy : Vercel + domaine
- [ ] Stripe : Abonnement 5.99€
- [ ] Testing : E2E + performance

### Semaine 7-8 : Polish
- [ ] SEO optimization
- [ ] Performance tuning  
- [ ] Analytics + monitoring
- [ ] Launch preparation

---

*🎯 Architecture prête pour développement multi-agents parallèle !*