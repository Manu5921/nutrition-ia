/**
 * COACH NUTRITIONNEL IA - AUTH HOOKS
 * =================================
 * Hooks React pour l'authentification
 */

import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

// Hook principal pour l'authentification
export const useAuth = () => {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    hasActiveSubscription: session?.user?.hasActiveSubscription || false,
    isAdmin: session?.user?.isAdmin || false,
    session,
    signIn,
    signOut,
  }
}

// Hook pour rediriger si non authentifié
export const useRequireAuth = (redirectTo = '/auth/connexion') => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  return { isAuthenticated, isLoading }
}

// Hook pour rediriger si pas d'abonnement actif
export const useRequireSubscription = (redirectTo = '/abonnement') => {
  const { isAuthenticated, hasActiveSubscription, isLoading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasActiveSubscription && !isAdmin) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, hasActiveSubscription, isLoading, isAdmin, router, redirectTo])

  return { isAuthenticated, hasActiveSubscription, isLoading }
}

// Hook pour rediriger si pas admin
export const useRequireAdmin = (redirectTo = '/') => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isAdmin, isLoading, router, redirectTo])

  return { isAuthenticated, isAdmin, isLoading }
}

// Hook pour obtenir le profil utilisateur
export const useUserProfile = () => {
  const { user } = useAuth()
  
  return {
    profile: user?.profile,
    hasProfile: !!user?.profile,
    isProfileComplete: !!(user?.profile?.first_name && user?.profile?.last_name && user?.profile?.birth_date),
  }
}

// Fonction utilitaire pour la connexion avec Google
export const signInWithGoogle = () => {
  return signIn('google', { callbackUrl: '/dashboard' })
}

// Fonction utilitaire pour la connexion avec email
export const signInWithEmail = (email: string) => {
  return signIn('email', { email, callbackUrl: '/dashboard' })
}

// Fonction utilitaire pour la déconnexion
export const signOutUser = () => {
  return signOut({ callbackUrl: '/' })
}

// Types pour TypeScript
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      profile?: Record<string, unknown>
      hasActiveSubscription?: boolean
      subscriptionStatus?: string | null
      isAdmin?: boolean
    }
  }

  interface User {
    id: string
    profile?: Record<string, unknown>
    hasActiveSubscription?: boolean
    subscriptionStatus?: string | null
    isAdmin?: boolean
  }
}

// Note: JWT types are handled differently in NextAuth v5
// Custom JWT interface would be defined in auth.ts configuration