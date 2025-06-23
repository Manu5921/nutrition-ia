# 🍎 COACH NUTRITIONNEL IA - CLAUDE PROJECT CONTEXT

## 📊 PROJET DETAILS

**Nom :** Coach Nutritionnel IA  
**Type :** Application Web Intelligence Artificielle  
**Stack :** Next.js 15.3, TypeScript, Tailwind CSS, Prisma, PostgreSQL  
**Architecture :** 3-AI Agents System  
**Phase :** Development & Deployment  

---

## 🤖 ARCHITECTURE 3-AI AGENTS

### 1. Nutritionniste AI Agent
- **Rôle :** Analyse nutritionnelle & recommandations personnalisées
- **Fonctions :**
  - Analyse des apports nutritionnels
  - Calcul des besoins caloriques (BMR/TDEE)
  - Recommandations alimentaires personnalisées
  - Détection des carences nutritionnelles
  - Planification de repas équilibrés

### 2. Coach AI Agent
- **Rôle :** Motivation, suivi & accompagnement
- **Fonctions :**
  - Suivi des objectifs de santé
  - Coaching motivationnel personnalisé
  - Gestion des habitudes alimentaires
  - Feedback et encouragements
  - Planning d'activités physiques

### 3. Data AI Agent
- **Rôle :** Analytics, insights & optimisation
- **Fonctions :**
  - Analyse des données de santé
  - Génération de rapports de progression
  - Prédictions de tendances
  - Optimisation des recommandations
  - Dashboard analytique avancé

---

## 🏗️ STACK TECHNIQUE

### Frontend
- **Next.js 15.3** (App Router + Server Components)
- **TypeScript 5+** (strict mode)
- **Tailwind CSS 3.4+** + Radix UI + shadcn/ui
- **React Hook Form** + Zod validation
- **Zustand** pour state management

### Backend & Database
- **Prisma ORM** + PostgreSQL (Neon)
- **NextAuth.js v5** pour authentification
- **tRPC** pour API type-safe
- **Uploadthing** pour gestion fichiers

### AI & ML Integration
- **OpenAI API** pour agents IA
- **Langchain** pour orchestration agents
- **Vector Database** (Pinecone/Supabase Vector)
- **Edge Runtime** pour performances optimales

### Deployment & DevOps
- **Vercel** avec preview deployments
- **Docker** pour développement local
- **GitHub Actions** pour CI/CD
- **Vercel Analytics** + Sentry monitoring

---

## 📁 ARCHITECTURE PROJET

```
src/
├── agents/                 # 3-AI Agents System
│   ├── nutritionist/      # Nutritionniste AI
│   ├── coach/             # Coach AI
│   └── analytics/         # Data AI
├── components/            # React Components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── dashboard/        # Dashboard components
│   └── charts/           # Data visualization
├── app/                  # Next.js App Router
│   ├── api/             # API Routes
│   ├── dashboard/       # Dashboard pages
│   ├── profile/         # User profile
│   └── auth/            # Authentication
├── lib/                 # Utilities & Config
│   ├── ai/             # AI agents config
│   ├── db/             # Database config
│   ├── auth/           # Auth config
│   └── utils/          # Helper functions
├── types/              # TypeScript definitions
└── hooks/              # Custom React hooks
```

---

## 🎯 FONCTIONNALITÉS PRINCIPALES

### Phase 1 - MVP (4 semaines)
- [ ] Authentification utilisateur (NextAuth.js)
- [ ] Profil utilisateur avec données biométriques
- [ ] Agent Nutritionniste : analyse basique
- [ ] Journalisation alimentaire simple
- [ ] Dashboard utilisateur de base

### Phase 2 - AI Enhancement (3 semaines)
- [ ] Agent Coach : système de motivation
- [ ] Agent Data : analytics avancées
- [ ] Recommandations personnalisées IA
- [ ] Système de notifications intelligentes
- [ ] API mobile (React Native future)

### Phase 3 - Advanced Features (3 semaines)
- [ ] Reconnaissance d'images alimentaires
- [ ] Intégration appareils connectés
- [ ] Communauté & social features
- [ ] Programme d'affiliation
- [ ] Marketplace recettes premium

---

## 🛠️ SETUP DEVELOPMENT

### Installation
```bash
cd /Users/manu/Documents/DEV/coach-nutritionnel-ia
npm install
npm run dev
```

### Environment Variables (.env.local)
```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# AI Services
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# External APIs
NUTRITIONIX_APP_ID="your-id"
NUTRITIONIX_API_KEY="your-key"
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run type-check   # TypeScript validation
npm run lint         # ESLint validation
npm run db:push      # Push Prisma schema
npm run db:studio    # Open Prisma Studio
```

---

## 📊 BASE DE DONNÉES SCHEMA

### Core Tables
```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  profile     UserProfile?
  foodLogs    FoodLog[]
  goals       Goal[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model UserProfile {
  id           String  @id @default(cuid())
  userId       String  @unique
  user         User    @relation(fields: [userId], references: [id])
  age          Int?
  weight       Float?
  height       Float?
  activityLevel String?
  goals        String[]
  restrictions String[]
  preferences  String[]
}

model FoodLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  foodName    String
  quantity    Float
  calories    Float
  nutrients   Json
  mealType    String
  loggedAt    DateTime @default(now())
}

model Goal {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String
  target      Float
  current     Float
  deadline    DateTime?
  achieved    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🤖 AI AGENTS CONFIGURATION

### Nutritionniste AI Prompts
```typescript
const nutritionistPrompts = {
  analyzeFood: `Analyze this food entry and provide nutritional breakdown...`,
  recommendMeals: `Based on user profile and goals, recommend...`,
  detectDeficiencies: `Analyze eating patterns to identify...`,
}
```

### Coach AI Prompts
```typescript
const coachPrompts = {
  motivationalMessage: `Generate encouraging message based on...`,
  habitSuggestion: `Suggest healthy habit modification...`,
  goalProgress: `Evaluate progress towards health goals...`,
}
```

### Data AI Analytics
```typescript
const analyticsPrompts = {
  generateInsights: `Analyze user data patterns to provide...`,
  predictTrends: `Based on historical data, predict...`,
  optimizeRecommendations: `Improve recommendations based on...`,
}
```

---

## 🎨 UI/UX GUIDELINES

### Design System
- **Colors :** Green primary (#10B981), Blue accent (#3B82F6)
- **Typography :** Inter font family
- **Components :** shadcn/ui + custom health-focused components
- **Icons :** Lucide React + custom nutrition icons
- **Layout :** Mobile-first responsive design

### Key Components
```typescript
// Dashboard cards for nutrition tracking
<NutritionCard />
<GoalProgressCard />
<WeeklyChart />
<RecommendationsList />

// Forms for data input
<FoodLogForm />
<ProfileSetupForm />
<GoalCreationForm />

// AI-powered components
<SmartRecommendations />
<MotivationalCoach />
<AnalyticsInsights />
```

---

## 🚀 DEPLOYMENT STRATEGY

### Vercel Production
```bash
# Environment setup
vercel env add DATABASE_URL production
vercel env add OPENAI_API_KEY production
vercel env add NEXTAUTH_SECRET production

# Deploy
vercel --prod
```

### Domain Configuration
- **Production :** coach-nutritionnel.vercel.app
- **Custom Domain :** (to be configured)
- **SSL :** Automatic via Vercel

---

## 📈 MONITORING & ANALYTICS

### Performance Tracking
- **Vercel Analytics** pour Web Vitals
- **Sentry** pour error tracking
- **Custom metrics** pour AI usage
- **User behavior** tracking (privacy-compliant)

### Business Metrics
- User engagement rates
- AI recommendation accuracy
- Goal achievement rates
- Feature usage analytics

---

## 🔐 SECURITY & PRIVACY

### Data Protection
- **GDPR Compliance** pour données santé
- **Encryption** des données sensibles
- **Access Control** basé sur rôles
- **Audit Logs** pour modifications

### AI Ethics
- **Transparent AI** recommendations
- **Bias Detection** dans les conseils
- **User Control** sur données utilisées
- **Medical Disclaimer** obligatoire

---

## 🎯 SUCCESS METRICS

### Technical KPIs
- **Page Load Time :** < 2s
- **API Response :** < 500ms
- **Uptime :** 99.9%
- **Error Rate :** < 0.1%

### Business KPIs
- **User Retention :** 60% à 30 jours
- **Goal Achievement :** 40% success rate
- **Daily Active Users :** Croissance 10%/mois
- **AI Accuracy :** > 85% satisfaction

---

## 📚 DOCUMENTATION & RESOURCES

### API Documentation
- **Swagger/OpenAPI** spec automatique
- **Postman Collection** pour tests
- **SDK TypeScript** pour intégrations

### User Documentation
- **Onboarding Guide** interactif
- **FAQ** alimentée par IA
- **Video Tutorials** pour fonctionnalités
- **Blog** avec conseils nutrition

---

*🎯 Coach Nutritionnel IA - Votre assistant santé intelligent powered by 3-AI agents*  
*📅 Dernière mise à jour: 23 juin 2025*