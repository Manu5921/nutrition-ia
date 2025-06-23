import type { Config } from "tailwindcss";

/**
 * Configuration Tailwind CSS 4.0 - Coach Nutritionnel Anti-Inflammatoire
 * 
 * IMPORTANT: Avec Tailwind CSS 4.0, la configuration principale se fait 
 * dans globals.css avec @theme. Ce fichier est maintenu pour la compatibilité
 * avec certains outils et éditeurs.
 * 
 * Toute la configuration du design system se trouve dans:
 * src/app/globals.css
 */

const config: Config = {
  // Tailwind 4.0 détecte automatiquement le contenu
  // mais on peut encore spécifier pour la compatibilité
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  // Configuration minimale - la vraie config est dans globals.css @theme
  theme: {},
  
  // Plugins compatibles Tailwind 4.0
  plugins: [],
};

export default config;