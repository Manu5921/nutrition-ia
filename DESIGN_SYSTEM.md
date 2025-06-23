# 🎨 Design System - Coach Nutritionnel Anti-Inflammatoire

## Vue d'ensemble

Ce design system a été conçu spécifiquement pour une application de coaching nutritionnel anti-inflammatoire, en ciblant les débutants et personnes en surpoids en France. L'approche visuelle privilégie des couleurs naturelles et apaisantes pour créer une expérience utilisateur rassurante et motivante.

## 🌈 Palette de couleurs

### Couleurs principales

#### Sage (Vert principal)
- **Usage**: Couleur principale, éléments d'action, navigation
- **Symbolisme**: Nature, santé, croissance, apaisement
- **Gamme**: sage-50 à sage-900
- **Principale**: sage-600 (#4a7d4a)

#### Turmeric (Orange accent)
- **Usage**: Accents, CTA secondaires, éléments chaleureux
- **Symbolisme**: Épices anti-inflammatoires, énergie douce, chaleur
- **Gamme**: turmeric-50 à turmeric-900
- **Principale**: turmeric-500 (#ea9c47)

#### Linen (Neutre doux)
- **Usage**: Arrière-plans, bordures, éléments neutres
- **Symbolisme**: Naturel, douceur, harmonie
- **Gamme**: linen-50 à linen-900
- **Principale**: linen-200 (#f5f0ea)

### Couleurs fonctionnelles

- **Succès**: success-600 (#16a34a) - Pour les réussites, validations
- **Attention**: warning-600 (#d97706) - Pour les avertissements
- **Danger**: danger-600 (#dc2626) - Pour les erreurs, suppressions

## 📝 Typographie

### Polices

#### Playfair Display (Titres)
- **Usage**: Tous les titres (h1, h2, h3, h4, h5, h6)
- **Caractère**: Élégant, lisible, moderne
- **Poids disponibles**: 400, 500, 600, 700

#### Inter (Corps de texte)
- **Usage**: Paragraphes, labels, interface
- **Caractère**: Moderne, très lisible, web-optimisé
- **Poids disponibles**: 300, 400, 500, 600, 700

### Hiérarchie typographique

```css
h1: 2.5rem (40px) - Playfair Display 500
h2: 2rem (32px) - Playfair Display 500
h3: 1.5rem (24px) - Playfair Display 500
h4: 1.25rem (20px) - Playfair Display 500

Body Large: 1.125rem (18px) - Inter 400
Body Normal: 1rem (16px) - Inter 400
Body Small: 0.875rem (14px) - Inter 400
Caption: 0.75rem (12px) - Inter 400
```

## 🧩 Composants

### Composants de base

#### Button
- **Variantes**: default, secondary, outline, ghost, success, warning, destructive
- **Tailles**: sm, default, lg, xl, icon
- **États**: normal, hover, active, loading, disabled
- **Particularité**: État loading avec spinner intégré

#### Input
- **Types**: Input, LabeledInput, SearchInput
- **États**: normal, error, success, disabled
- **Particularité**: Support unités (kg, g, ml) pour LabeledInput

#### Card
- **Variantes**: Standard, NutritionCard (recipe, meal, score, tip)
- **Particularité**: Animations hover douces, ombres subtiles

#### Badge
- **Variantes**: default, secondary, outline, success, warning, destructive, nutrition
- **Usage**: Tags, statuts, scores

### Composants spécialisés nutrition

#### RecipeCard
- **Affichage**: Image, titre, description, temps, portions, calories
- **Score**: Indicateur anti-inflammatoire avec couleur adaptative
- **Actions**: Sauvegarder (favoris), voir détails
- **Animation**: Hover avec léger scale et transition douce

#### NutritionScore
- **Visualisation**: Cercle de progression animé
- **Détail**: Breakdown par catégorie (oméga-3, antioxydants, fibres, etc.)
- **Recommandations**: Liste de conseils personnalisés
- **Motivation**: Messages adaptatifs selon le score

#### MealPlanCard
- **Structure**: Petit-déjeuner, déjeuner, dîner, collations
- **Informations**: Calories totales, score journalier
- **Actions**: Modifier repas, ajouter collations
- **Visualisation**: Barre de progression du score

## 🎭 Animations et interactions

### Principes
- **Durée**: 200-500ms pour la plupart des transitions
- **Easing**: ease-out pour les entrées, ease-in pour les sorties
- **Réduction**: Respect de `prefers-reduced-motion`

### Animations définies
```css
fade-in: 0.5s ease-in-out
slide-up: 0.3s ease-out
pulse-soft: 2s cubic-bezier(0.4, 0, 0.6, 1) infinite
```

### Interactions
- **Hover**: Légère élévation (scale 1.02), changement d'ombre
- **Focus**: Outline personnalisé avec couleur sage-400
- **Loading**: Spinner avec rotation fluide

## 📐 Spacing et layout

### Espacements
- **Base**: Système 8px (0.5rem)
- **Extensions**: 18 (4.5rem), 88 (22rem), 128 (32rem)
- **Principe**: Plus généreux pour une approche apaisante

### Border radius
- **Doux**: 0.5rem par défaut
- **Moyens**: 0.75rem (rounded-xl)
- **Larges**: 1rem (rounded-2xl), 1.5rem (rounded-3xl)

### Ombres
```css
shadow-soft: 0 2px 8px 0 rgba(0, 0, 0, 0.06)
shadow-soft-lg: 0 4px 16px 0 rgba(0, 0, 0, 0.08)
shadow-inner-soft: inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)
```

## 🎯 Accessibilité

### Couleurs
- **Contraste**: Minimum WCAG AA (4.5:1) pour le texte
- **États**: Focus visible avec outline personnalisé
- **Couleurs fonctionnelles**: Toujours accompagnées d'indicateurs textuels

### Navigation
- **Clavier**: Support complet avec focus visible
- **Screen readers**: Labels appropriés, roles ARIA
- **Taille des cibles**: Minimum 44px pour les éléments interactifs

### Responsive
- **Mobile-first**: Design optimisé d'abord pour mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Font-size**: 16px minimum sur mobile (évite le zoom iOS)

## 🔧 Utilisation technique

### Installation
```bash
npm install @radix-ui/react-slot @radix-ui/react-dialog class-variance-authority clsx tailwind-merge lucide-react
```

### Configuration Tailwind
Le fichier `tailwind.config.ts` contient toutes les couleurs personnalisées et extensions.

### Imports
```typescript
// Composants de base
import { Button, Card, Badge, Input } from '@/components/ui'

// Composants nutrition
import { RecipeCard, NutritionScore, MealPlanCard } from '@/components/nutrition'

// Utilitaires
import { cn, getScoreColor, formatNumber } from '@/lib/utils'
```

### Utilisation des couleurs CSS
```css
/* Variables CSS disponibles */
--color-primary: theme('colors.sage.600')
--color-secondary: theme('colors.turmeric.500')
--color-accent: theme('colors.linen.200')
```

## 📱 Responsive Design

### Stratégie mobile-first
1. **Mobile** (320px+): Layout vertical, navigation simplifiée
2. **Tablet** (768px+): Grille 2 colonnes, éléments plus spacieux
3. **Desktop** (1024px+): Grille 3-4 colonnes, sidebar possible

### Composants adaptatifs
- **Cards**: Stack sur mobile, grille sur desktop
- **Navigation**: Menu hamburger sur mobile, barre horizontale sur desktop
- **Forms**: Colonnes multiples sur desktop uniquement

## 🧪 Tests et validation

### Outils recommandés
- **Accessibilité**: axe-core, WAVE
- **Performance**: Lighthouse, Core Web Vitals
- **Responsive**: Browser DevTools, Responsive Design Mode

### Validation couleurs
- **Contrast Checker**: WebAIM, Colour Contrast Analyser
- **Daltonisme**: Colorblinding.com, Stark plugin

## 📚 Exemples d'usage

### Page type
```tsx
<div className="min-h-screen bg-gradient-to-br from-linen-50 via-white to-sage-50">
  <header className="bg-white/80 backdrop-blur-sm border-b border-linen-200">
    {/* Navigation */}
  </header>
  <main className="max-w-7xl mx-auto px-4 py-8">
    {/* Contenu */}
  </main>
</div>
```

### Card nutritionnelle
```tsx
<NutritionCard variant="recipe">
  <CardHeader>
    <CardTitle>Recette anti-inflammatoire</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Contenu */}
  </CardContent>
</NutritionCard>
```

## 🚀 Démo

Visitez `/design-system` pour voir tous les composants en action avec des données d'exemple.

---

*Ce design system évolue avec les besoins de l'application. N'hésitez pas à proposer des améliorations en gardant à l'esprit les principes d'apaisement et de nature qui guident ce projet.*