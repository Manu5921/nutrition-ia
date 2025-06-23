/**
 * COACH NUTRITIONNEL IA - TRPC ROOT ROUTER 2025
 * ==============================================
 * Router principal qui combine tous les sous-routers
 * Patterns 2025 : Modularité, Type-safety, Edge Runtime
 */

import { createTRPCRouter } from './server'
import { recipesRouter } from './routers/recipes'
import { userRouter } from './routers/user'
import { mealPlansRouter } from './routers/meal-plans'
import { subscriptionsRouter } from './routers/subscriptions'
import { nutritionRouter } from './routers/nutrition'

/**
 * Router principal de l'application
 * Combine tous les sous-routers en une API cohérente et type-safe
 */
export const appRouter = createTRPCRouter({
  // Router des recettes - Gestion complète des recettes anti-inflammatoires
  recipes: recipesRouter,
  
  // Router utilisateur - Profils, préférences, statistiques
  user: userRouter,
  
  // Router des plans alimentaires - Génération IA et gestion hebdomadaire
  mealPlans: mealPlansRouter,
  
  // Router des abonnements - Stripe integration et gestion premium
  subscriptions: subscriptionsRouter,
  
  // Router nutrition - Analyse nutritionnelle et scoring anti-inflammatoire
  nutrition: nutritionRouter,
})

// Export du type pour utilisation côté client
export type AppRouter = typeof appRouter