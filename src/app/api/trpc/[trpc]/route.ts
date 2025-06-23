/**
 * COACH NUTRITIONNEL IA - TRPC API ROUTE 2025
 * ===========================================
 * Route API tRPC pour Next.js 15.3 App Router
 * Compatible Edge Runtime + streaming
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter, createTRPCContext } from '@/lib/trpc/server'

// Configuration Edge Runtime pour performance
export const runtime = 'edge'

// Configuration pour streaming
export const dynamic = 'force-dynamic'

// Handler pour toutes les méthodes HTTP
const handler = async (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
    
    // Configuration pour production
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            )
          }
        : undefined,
    
    // Configuration CORS
    responseMeta(opts) {
      const { ctx, paths, errors, type } = opts
      
      // Ajouter headers CORS si nécessaire
      const headers: Record<string, string> = {}
      
      if (process.env.NODE_ENV === 'development') {
        headers['Access-Control-Allow-Origin'] = '*'
        headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
      }
      
      // Cache pour les requêtes publiques
      if (type === 'query' && !errors.length && paths?.every(path => 
        path.startsWith('recipes.search') || 
        path.startsWith('recipes.getFeatured') ||
        path.startsWith('subscriptions.getPrices')
      )) {
        headers['Cache-Control'] = 'public, s-maxage=60, stale-while-revalidate=300'
      }
      
      // Headers de sécurité
      headers['X-Content-Type-Options'] = 'nosniff'
      headers['X-Frame-Options'] = 'DENY'
      headers['X-XSS-Protection'] = '1; mode=block'
      headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
      
      // Performance headers
      headers['Server-Timing'] = `trpc;desc="tRPC request";dur=${Date.now()}`
      
      return {
        status: errors.length > 0 ? 500 : 200,
        headers,
      }
    },
  })
}

// Export pour toutes les méthodes HTTP
export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
export const OPTIONS = handler