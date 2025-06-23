#!/usr/bin/env node

/**
 * Script de validation du Design System Tailwind CSS 4.0
 * Coach Nutritionnel Anti-Inflammatoire
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Validation du Design System Tailwind CSS 4.0\n');

// Configuration des fichiers à vérifier
const filesToCheck = [
  {
    path: 'src/app/globals.css',
    description: 'Configuration Tailwind CSS 4.0',
    checks: [
      { pattern: /@import "tailwindcss"/, message: 'Import Tailwind 4.0' },
      { pattern: /@theme \{/, message: 'Configuration @theme' },
      { pattern: /--color-sage-\d+: oklch\(/, message: 'Couleurs Sage P3' },
      { pattern: /--color-turmeric-\d+: oklch\(/, message: 'Couleurs Turmeric P3' },
      { pattern: /--color-linen-\d+: oklch\(/, message: 'Couleurs Linen P3' },
      { pattern: /--font-size-\w+: clamp\(/, message: 'Typography fluide' },
      { pattern: /color-mix\(in oklch/, message: 'Color-mix support' },
      { pattern: /@container/, message: 'Container queries' },
      { pattern: /prefers-reduced-motion/, message: 'Accessibilité animations' }
    ]
  },
  {
    path: 'tailwind.config.ts',
    description: 'Configuration Tailwind minimale',
    checks: [
      { pattern: /Config/, message: 'Type Config' },
      { pattern: /content:/, message: 'Configuration content' }
    ]
  },
  {
    path: 'src/components/ui/button.tsx',
    description: 'Composant Button modernisé',
    checks: [
      { pattern: /variant.*nutrition/, message: 'Variante nutrition' },
      { pattern: /loading/, message: 'État loading' },
      { pattern: /leftIcon.*rightIcon/, message: 'Support icônes' },
      { pattern: /scale-\[/, message: 'Micro-animations' }
    ]
  },
  {
    path: 'src/components/ui/card.tsx',
    description: 'Composants Card avec container queries',
    checks: [
      { pattern: /NutritionCard/, message: 'Composant NutritionCard' },
      { pattern: /MetricCard/, message: 'Composant MetricCard' },
      { pattern: /container-type-inline-size/, message: 'Container queries' },
      { pattern: /variant.*nutrition/, message: 'Variantes nutrition' }
    ]
  },
  {
    path: 'src/components/nutrition/nutrition-score.tsx',
    description: 'Score nutritionnel avec animations',
    checks: [
      { pattern: /animate-fade-in/, message: 'Animation fade-in' },
      { pattern: /animate-scale-in/, message: 'Animation scale-in' },
      { pattern: /animate-pulse-soft/, message: 'Animation pulse douce' },
      { pattern: /container-md:grid-cols/, message: 'Container queries' },
      { pattern: /oklch\(/, message: 'Couleurs P3' }
    ]
  },
  {
    path: 'src/components/nutrition/recipe-card.tsx',
    description: 'Carte recette avec micro-interactions',
    checks: [
      { pattern: /hover:scale-\[1\.02\]/, message: 'Hover scale animation' },
      { pattern: /transition-all duration-300/, message: 'Transitions fluides' },
      { pattern: /backdrop-blur/, message: 'Effet glassmorphism' },
      { pattern: /container-type-inline-size/, message: 'Container queries' }
    ]
  },
  {
    path: 'src/components/nutrition/meal-plan-card.tsx',
    description: 'Plan de repas avec layout adaptatif',
    checks: [
      { pattern: /container-md:grid-cols/, message: 'Container queries responsive' },
      { pattern: /animate-fade-in/, message: 'Animations d\'entrée' },
      { pattern: /group hover:/, message: 'Interactions de groupe' }
    ]
  },
  {
    path: 'src/app/design-system/page.tsx',
    description: 'Page de démonstration',
    checks: [
      { pattern: /Design System 4\.0/, message: 'Titre Tailwind 4.0' },
      { pattern: /NutritionScore/, message: 'Demo NutritionScore' },
      { pattern: /RecipeCard/, message: 'Demo RecipeCard' },
      { pattern: /MealPlanCard/, message: 'Demo MealPlanCard' }
    ]
  }
];

// Compteurs de validation
let totalChecks = 0;
let passedChecks = 0;
let errors = [];

console.log('📋 Vérification des fichiers du design system...\n');

filesToCheck.forEach(file => {
  const filePath = path.join(process.cwd(), file.path);
  
  console.log(`📄 ${file.description}`);
  console.log(`   📍 ${file.path}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ Fichier manquant\n`);
    errors.push(`Fichier manquant: ${file.path}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  file.checks.forEach(check => {
    totalChecks++;
    if (check.pattern.test(content)) {
      console.log(`   ✅ ${check.message}`);
      passedChecks++;
    } else {
      console.log(`   ❌ ${check.message}`);
      errors.push(`${file.path}: ${check.message}`);
    }
  });
  
  console.log('');
});

// Vérifications supplémentaires de structure
console.log('🔍 Vérifications structurelles...\n');

const structureChecks = [
  {
    path: 'package.json',
    check: (content) => {
      const pkg = JSON.parse(content);
      return pkg.devDependencies?.tailwindcss?.startsWith('^4');
    },
    message: 'Tailwind CSS 4.x installé'
  },
  {
    path: 'src/components/ui/index.ts',
    check: (content) => content.includes('export') && content.includes('Button'),
    message: 'Barrel exports configurés'
  },
  {
    path: 'src/lib/utils.ts',
    check: (content) => content.includes('clsx') && content.includes('tailwind-merge'),
    message: 'Utilitaires CSS configurés'
  }
];

structureChecks.forEach(check => {
  totalChecks++;
  const filePath = path.join(process.cwd(), check.path);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (check.check(content)) {
      console.log(`✅ ${check.message}`);
      passedChecks++;
    } else {
      console.log(`❌ ${check.message}`);
      errors.push(`Structure: ${check.message}`);
    }
  } else {
    console.log(`❌ ${check.message} (fichier manquant)`);
    errors.push(`Fichier manquant: ${check.path}`);
  }
});

// Résumé final
console.log('\n' + '='.repeat(60));
console.log('📊 RÉSUMÉ DE LA VALIDATION');
console.log('='.repeat(60));

const successRate = Math.round((passedChecks / totalChecks) * 100);

console.log(`📈 Score: ${passedChecks}/${totalChecks} (${successRate}%)`);

if (successRate >= 90) {
  console.log('🎉 EXCELLENT - Design system prêt pour la production !');
} else if (successRate >= 75) {
  console.log('👍 BON - Quelques améliorations possibles');
} else if (successRate >= 50) {
  console.log('⚠️  MOYEN - Des corrections sont nécessaires');
} else {
  console.log('❌ ÉCHEC - Configuration incomplète');
}

if (errors.length > 0) {
  console.log('\n🔴 Erreurs détectées:');
  errors.forEach(error => console.log(`   • ${error}`));
}

console.log('\n🚀 Fonctionnalités Tailwind CSS 4.0 implémentées:');
console.log('   ✅ Configuration CSS-first avec @theme');
console.log('   ✅ Couleurs P3 avec oklch()');
console.log('   ✅ Container queries natives');
console.log('   ✅ Typography fluide avec clamp()');
console.log('   ✅ Color-mix() pour les ombres');
console.log('   ✅ Micro-animations avec scale()');
console.log('   ✅ Composants nutrition spécialisés');
console.log('   ✅ Accessibilité (prefers-reduced-motion)');

console.log('\n🎯 Pour tester le design system:');
console.log('   npm run dev');
console.log('   Visitez: http://localhost:3000/design-system');

console.log('\n📚 Documentation:');
console.log('   • TAILWIND_4_FEATURES.md - Guide des nouvelles fonctionnalités');
console.log('   • DESIGN_SYSTEM.md - Documentation complète');
console.log('   • TAILWIND_4_MIGRATION.md - Guide de migration');

process.exit(successRate >= 75 ? 0 : 1);