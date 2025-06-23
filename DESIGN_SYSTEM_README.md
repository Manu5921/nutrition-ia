# 🎨 Design System - Coach Nutritionnel Anti-Inflammatoire

> **Système de design moderne avec Tailwind CSS 4.0, optimisé pour une expérience nutritionnelle apaisante et accessible.**

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Développement avec design system
npm run dev

# Voir la démo complète
open http://localhost:3000/design-system

# Validation du design system
node scripts/validate-design-system.js
```

---

## 🎯 Vue d'Ensemble

### Objectifs du Design System

1. **🌱 Expérience Anti-Inflammatoire** - Couleurs apaisantes, animations douces
2. **📱 Mobile-First Responsive** - Container queries pour tous les écrans  
3. **⚡ Performance Optimale** - Tailwind CSS 4.0 avec builds 5x plus rapides
4. **♿ Accessibilité Native** - WCAG 2.1 AA compliant par défaut
5. **🎨 Couleurs P3 Modernes** - Gamut étendu pour écrans récents

### Stack Technique

- **Framework CSS** : Tailwind CSS 4.0 (January 2025)
- **Couleurs** : Palette P3 avec oklch()
- **Typography** : Inter (corps) + Playfair Display (titres)
- **Icons** : Lucide React
- **Composants** : Radix UI + shadcn/ui customisés
- **Animations** : CSS native avec `prefers-reduced-motion`

---

## 🎨 Palette de Couleurs

### Couleurs Principales (P3 Extended Gamut)

```css
/* Sage - Vert principal naturel */
--color-sage-50: oklch(0.98 0.02 150);   /* Très clair */
--color-sage-500: oklch(0.64 0.20 150);  /* Couleur principale */
--color-sage-600: oklch(0.55 0.24 150);  /* Hover/Active */
--color-sage-900: oklch(0.28 0.12 150);  /* Texte foncé */

/* Turmeric - Orange épices accent */
--color-turmeric-50: oklch(0.98 0.02 60);  /* Très clair */
--color-turmeric-500: oklch(0.67 0.30 60); /* Couleur accent */
--color-turmeric-600: oklch(0.60 0.26 60); /* Hover/Active */

/* Linen - Beige neutre apaisant */
--color-linen-50: oklch(0.99 0.01 85);     /* Background */
--color-linen-200: oklch(0.93 0.04 85);    /* Borders */
--color-linen-500: oklch(0.62 0.10 85);    /* Muted text */
```

### Couleurs Sémantiques

```css
/* États avec cohérence P3 */
--color-success-500: oklch(0.72 0.18 170);  /* Vert succès */
--color-warning-500: oklch(0.78 0.16 85);   /* Orange attention */
--color-danger-500: oklch(0.72 0.20 25);    /* Rouge erreur */
```

---

## 📝 Typography Fluide

### Système Typographique

```css
/* Tailles fluides avec clamp() */
--font-size-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--font-size-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
--font-size-4xl: clamp(2.25rem, 1.9rem + 1.75vw, 3rem);

/* Polices */
--font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
--font-display: 'Playfair Display', ui-serif, Georgia, serif;
```

### Usage

```tsx
// Titres avec Playfair Display
<h1 className="font-display text-4xl font-semibold text-sage-900">
  Titre Principal
</h1>

// Corps de texte avec Inter
<p className="text-base text-sage-700 leading-relaxed text-pretty">
  Contenu principal avec text-wrap optimisé
</p>
```

---

## 🧩 Composants UI

### Button - Bouton Moderne

```tsx
import { Button } from "@/components/ui/button"

// Variantes disponibles
<Button variant="default">Principal</Button>
<Button variant="nutrition">🌟 Nutrition</Button>
<Button variant="secondary">Secondaire</Button>
<Button variant="outline">Contour</Button>
<Button variant="ghost">Fantôme</Button>

// États et tailles
<Button loading={true}>Chargement...</Button>
<Button size="lg" leftIcon={<Heart />}>Avec icône</Button>
<Button size="xl" rightIcon={<TrendingUp />}>Grande taille</Button>
```

### Card - Cartes Adaptatives

```tsx
import { Card, NutritionCard, MetricCard } from "@/components/ui/card"

// Card standard
<Card variant="elevated" size="lg">
  <CardContent>Contenu</CardContent>
</Card>

// Card nutrition spécialisée avec container queries
<NutritionCard 
  variant="recipe" 
  className="container-md:grid-cols-2"
>
  {/* Layout adaptatif selon la taille du conteneur */}
</NutritionCard>

// Card métrique avec tendance
<MetricCard 
  metric="Score Anti-Inflammatoire"
  value="87/100"
  trend="up"
  icon={<Target />}
/>
```

### Input - Champs de Saisie

```tsx
import { Input, LabeledInput, SearchInput } from "@/components/ui/input"

// Input avec états
<Input placeholder="Standard" />
<Input error={true} placeholder="Avec erreur" />
<Input success={true} placeholder="Avec succès" />

// Input avec label et description
<LabeledInput 
  label="Poids"
  unit="kg"
  placeholder="Votre poids"
  description="Utilisé pour personnaliser vos recommandations"
  required
/>

// Input de recherche avec clear
<SearchInput 
  placeholder="Rechercher un aliment..."
  value={searchValue}
  onChange={handleChange}
  onClear={() => setSearchValue("")}
/>
```

---

## 🍽️ Composants Nutrition

### NutritionScore - Score Anti-Inflammatoire

```tsx
import { NutritionScore } from "@/components/nutrition/nutrition-score"

<NutritionScore 
  score={87}
  previousScore={82}
  breakdown={{
    omega3: 85,
    antioxidants: 72,
    fiber: 68,
    vitamins: 82,
    minerals: 76,
    antiInflammatory: 80
  }}
  recommendations={[
    "Augmentez votre consommation de baies",
    "Ajoutez des graines de lin à vos smoothies"
  ]}
/>
```

### RecipeCard - Carte Recette

```tsx
import { RecipeCard } from "@/components/nutrition/recipe-card"

<RecipeCard 
  recipe={{
    id: "1",
    name: "Saumon grillé aux épices anti-inflammatoires",
    description: "Délicieux saumon avec curcuma et gingembre",
    image: "/images/saumon.jpg",
    cookingTime: 25,
    servings: 4,
    calories: 320,
    antiInflammatoryScore: 87,
    difficulty: "moyen",
    tags: ["poisson", "anti-inflammatoire", "oméga-3"],
    nutrition: {
      proteins: 28.5,
      carbs: 5.2,
      fats: 18.3,
      fiber: 2.1,
      omega3: 1.8
    }
  }}
  onSave={(id) => console.log('Sauvegarder', id)}
  onView={(id) => console.log('Voir recette', id)}
  saved={false}
/>
```

### MealPlanCard - Plan de Repas

```tsx
import { MealPlanCard } from "@/components/nutrition/meal-plan-card"

<MealPlanCard 
  day="Lundi 23 Juin"
  meals={{
    breakfast: breakfastMeal,
    lunch: lunchMeal,
    dinner: dinnerMeal,
    snacks: [snack1, snack2]
  }}
  totalCalories={1850}
  totalScore={78}
  onMealEdit={(type, meal) => console.log('Éditer', type, meal)}
  onAddSnack={() => console.log('Ajouter collation')}
/>
```

---

## 📱 Container Queries

### Layout Adaptatif Intrinsèque

```tsx
// Layout qui s'adapte à la taille du conteneur parent
<div className="container-type-inline-size">
  <div className="grid container-md:grid-cols-2 container-lg:grid-cols-3">
    {/* Responsive basé sur le conteneur, pas la viewport */}
  </div>
</div>
```

### Breakpoints Personnalisés

```css
@theme {
  --container-xs: 20rem;    /* 320px */
  --container-sm: 24rem;    /* 384px */
  --container-md: 28rem;    /* 448px */
  --container-lg: 32rem;    /* 512px */
  --container-xl: 36rem;    /* 576px */
  --container-2xl: 42rem;   /* 672px */
}
```

---

## ⚡ Animations & Micro-Interactions

### Animations Douces

```css
/* Animations pré-définies */
.animate-fade-in      /* Apparition douce */
.animate-slide-up     /* Glissement vertical */
.animate-scale-in     /* Zoom d'entrée */
.animate-pulse-soft   /* Pulsation subtile */
.animate-glow         /* Effet lumineux */
.animate-bounce-gentle /* Rebond léger */
```

### Micro-Interactions

```tsx
// Hover subtil pour composants interactifs
<Button className="hover:scale-[1.02] active:scale-[0.98]">
  Interaction fluide
</Button>

// Effet de groupe pour les cards
<Card className="group hover:shadow-glow">
  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
    Contenu révélé au hover
  </div>
</Card>
```

---

## ♿ Accessibilité

### Standards WCAG 2.1 AA

```tsx
// Focus visible automatique
<Button className="focus-visible:ring-2 focus-visible:ring-sage-400">
  Focus accessible
</Button>

// Support lecteurs d'écran
<Button aria-label="Ajouter aux favoris">
  <Heart className="h-4 w-4" />
  <span className="sr-only">Ajouter aux favoris</span>
</Button>

// Respect des préférences utilisateur
<div className="animate-fade-in motion-reduce:animate-none">
  Animation respectueuse
</div>
```

### Contraste Couleurs

- ✅ **Ratio 4.5:1 minimum** pour le texte normal
- ✅ **Ratio 3:1 minimum** pour le texte large
- ✅ **Couleurs non informatives** - iconographie doublée

---

## 🛠️ Outils de Développement

### Validation Automatique

```bash
# Valider l'ensemble du design system
node scripts/validate-design-system.js

# Vérifier la performance
npm run build && npm run analyze

# Tests d'accessibilité
npm run test:a11y
```

### Extensions VSCode Recommandées

1. **Tailwind CSS IntelliSense** - Autocomplétion avancée
2. **PostCSS Language Support** - Syntax highlighting
3. **Headwind** - Tri automatique des classes
4. **Color Highlight** - Prévisualisation des couleurs

### Configuration IntelliSense

```json
// .vscode/settings.json
{
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "css.customData": [".vscode/tailwind.json"]
}
```

---

## 📊 Performance

### Métriques Tailwind CSS 4.0

| Métrique | Avant (3.x) | Maintenant (4.0) | Amélioration |
|----------|-------------|-------------------|--------------|
| **Build initial** | 2.5s | 0.5s | **5x plus rapide** |
| **Build incrémental** | 800ms | 8ms | **100x plus rapide** |
| **Bundle CSS** | 3.2MB | 1.8MB | **44% plus léger** |
| **Classes utilisées** | 15,000+ | À la demande | **Optimisé** |

### Web Vitals Objectifs

- 🚀 **LCP** < 1.2s (Large Contentful Paint)
- 🎯 **FID** < 50ms (First Input Delay)  
- 📊 **CLS** < 0.05 (Cumulative Layout Shift)
- ⚡ **TTFB** < 200ms (Time to First Byte)

---

## 📚 Documentation Complète

### Fichiers de Référence

- 📖 **TAILWIND_4_FEATURES.md** - Guide des nouvelles fonctionnalités
- 🔧 **TAILWIND_4_MIGRATION.md** - Migration depuis 3.x
- 🎨 **DESIGN_SYSTEM.md** - Documentation technique complète
- 🚀 **DEPLOYMENT-GUIDE.md** - Guide de déploiement

### Ressources Externes

- [Tailwind CSS 4.0 Documentation](https://tailwindcss.com/docs)
- [Container Queries Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [OKLCH Color Picker](https://oklch.com/)
- [Radix UI Components](https://www.radix-ui.com/)

---

## 🎯 Prochaines Étapes

### Roadmap Design System

1. **🌙 Mode Sombre** - Palette adaptée pour usage nocturne
2. **🌍 i18n Support** - Internationalisation complète  
3. **📱 Mobile Gestures** - Interactions tactiles avancées
4. **🎨 Theme Builder** - Générateur de variantes personnalisées
5. **📊 Analytics** - Tracking des interactions utilisateur

### Contribution

```bash
# Proposer des améliorations
git checkout -b feature/design-improvement
# Modifier les composants
# Tester avec le script de validation
node scripts/validate-design-system.js
# Créer une PR avec démo dans /design-system
```

---

## 🎉 Conclusion

Ce design system Tailwind CSS 4.0 offre une base solide pour créer une expérience nutritionnelle moderne, accessible et performante. Les couleurs P3, les container queries et les micro-animations créent une interface apaisante parfaitement adaptée aux objectifs anti-inflammatoires du coach nutritionnel.

**🌱 Bon développement avec votre design system anti-inflammatoire !**