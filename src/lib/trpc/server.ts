/**
 * COACH NUTRITIONNEL IA - TRPC SERVER 2025
 * =========================================
 * Configuration tRPC v11 avec middlewares d'authentification et validation
 * Patterns 2025 : Edge Runtime, Zod validation, Type-safe APIs
 */

import { initTRPC, TRPCError } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { getServerUser, getServerSubscription, checkServerPermissions } from '../supabase/server'
import { createSupabaseServerClient } from '../supabase/server'
import type { Database } from '../supabase/types'

// Interface du contexte tRPC
interface CreateContextOptions {
  headers?: Headers
  req?: Request
}

// Fonction pour créer le contexte tRPC
export const createContext = async (opts?: CreateContextOptions | FetchCreateContextFnOptions) => {
  const headers = opts?.req?.headers || opts?.headers
  const supabase = createSupabaseServerClient()
  
  // Récupérer l'utilisateur connecté
  let user = null
  let subscription = null
  let isAdmin = false
  
  try {
    user = await getServerUser()
    
    if (user) {
      subscription = await getServerSubscription(user.id)
      isAdmin = user.user_metadata?.is_admin === true
    }
  } catch (error) {
    console.error('Erreur lors de la création du contexte tRPC:', error)
  }

  return {
    supabase,
    user,
    subscription,
    isAdmin,
    headers,
    req: opts?.req,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

// Initialisation de tRPC avec configuration optimisée
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
  defaultMeta: {
    // Métadonnées par défaut pour tous les endpoints
    authRequired: false,
    subscriptionRequired: false,
    adminRequired: false,
  },
})

// Export des éléments de base tRPC
export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

// Middleware de logging pour développement
const loggingMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now()
  
  const result = await next()
  
  const durationMs = Date.now() - start
  const meta = { path, type, durationMs }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('tRPC call:', meta)
  }
  
  // Logger les requêtes lentes en production
  if (process.env.NODE_ENV === 'production' && durationMs > 2000) {
    console.warn('Slow tRPC call detected:', meta)
  }
  
  return result
})

// Middleware de rate limiting
const rateLimitMiddleware = t.middleware(async ({ ctx, path, next }) => {
  if (!ctx.user) return next()
  
  try {
    // Utiliser la fonction PostgreSQL de rate limiting
    const { data: canProceed } = await ctx.supabase
      .rpc('check_rate_limit', {
        p_action_type: `trpc_${path}`,
        p_max_actions: 60, // 60 requêtes par heure par défaut
        p_window_minutes: 60
      })
    
    if (!canProceed) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Trop de requêtes. Veuillez réessayer plus tard.',
      })
    }
  } catch (error) {
    if (error instanceof TRPCError) throw error
    // Si le rate limiting échoue, on continue (fail-open)
    console.warn('Rate limiting check failed:', error)
  }
  
  return next()
})

// Middleware de validation d'authentification
const authMiddleware = t.middleware(async ({ ctx, next, meta }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Vous devez être connecté pour accéder à cette ressource',
    })
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // User non-null à partir d'ici
    },
  })
})

// Middleware de validation d'abonnement
const subscribedMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Vous devez être connecté',
    })
  }
  
  // Les admins ont accès à tout
  if (ctx.isAdmin) {
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    })
  }
  
  if (!ctx.subscription) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Un abonnement actif est requis pour accéder à cette fonctionnalité',
    })
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      subscription: ctx.subscription,
    },
  })
})

// Middleware de validation admin
const adminMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Privilèges administrateur requis',
    })
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      isAdmin: true,
    },
  })
})

// Procédures de base avec middlewares
export const baseProcedure = t.procedure.use(loggingMiddleware)

export const publicProcedure = baseProcedure

export const protectedProcedure = baseProcedure
  .use(rateLimitMiddleware)
  .use(authMiddleware)

export const subscribedProcedure = baseProcedure
  .use(rateLimitMiddleware)
  .use(authMiddleware)
  .use(subscribedMiddleware)

export const adminProcedure = baseProcedure
  .use(authMiddleware)
  .use(adminMiddleware)

// Fonction utilitaire pour gérer les erreurs Supabase
export const handleSupabaseError = (error: any): never => {
  console.error('Erreur Supabase:', error)
  
  // Erreurs spécifiques de Supabase
  if (error.code === 'PGRST116') {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Ressource non trouvée',
    })
  }
  
  if (error.code === '23505') {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'Cette ressource existe déjà',
    })
  }
  
  if (error.code === '23503') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Référence invalide',
    })
  }
  
  if (error.code === '42501') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Accès interdit par les politiques de sécurité',
    })
  }
  
  // Erreur générique
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Erreur de base de données',
    cause: error,
  })
}

// Fonction utilitaire pour la pagination
export const createPaginationParams = (page: number = 1, limit: number = 10) => {
  const offset = (page - 1) * limit
  return {
    offset,
    limit,
    range: [offset, offset + limit - 1] as [number, number]
  }
}

// Fonction utilitaire pour formater les réponses paginées
export const formatPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total?: number
) => {
  const totalPages = total ? Math.ceil(total / limit) : Math.ceil(data.length / limit)
  
  return {
    data,
    pagination: {
      page,
      limit,
      total: total || data.length,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

// Fonction utilitaire pour valider les UUIDs
export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Fonction utilitaire pour nettoyer les objets (retirer les propriétés undefined)
export const cleanObject = <T extends Record<string, any>>(obj: T): Partial<T> => {
  const cleaned: Partial<T> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key as keyof T] = value
    }
  }
  
  return cleaned
}

// Fonction utilitaire pour audit logging
export const auditLog = async (
  supabase: ReturnType<typeof createSupabaseServerClient>,
  action: string,
  tableName: string,
  recordId?: string,
  oldValues?: any,
  newValues?: any
) => {
  try {
    await supabase.rpc('create_audit_log', {
      p_action: action,
      p_table_name: tableName,
      p_record_id: recordId,
      p_old_values: oldValues,
      p_new_values: newValues,
    })
  } catch (error) {
    console.error('Erreur lors de l\'audit logging:', error)
    // Ne pas faire échouer l'opération principale si l'audit échoue
  }
}

// Types utilitaires pour les contextes
export type AuthenticatedContext = Context & {
  user: NonNullable<Context['user']>
}

export type SubscribedContext = AuthenticatedContext & {
  subscription: NonNullable<Context['subscription']>
}

export type AdminContext = AuthenticatedContext & {
  isAdmin: true
}

// Re-export from root for API route compatibility
export { appRouter } from './root'
export type { AppRouter } from './root'

// Re-export context creation for API routes
export const createTRPCContext = createContext

// Export de types pour utilisation dans les routers
export type { Context }