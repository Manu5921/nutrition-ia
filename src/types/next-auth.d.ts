/**
 * COACH NUTRITIONNEL IA - NEXTAUTH TYPES EXTENSION
 * ==============================================
 * Extension des types NextAuth.js pour TypeScript
 */

import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      hasActiveSubscription: boolean
      subscriptionId?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    hasActiveSubscription?: boolean
    subscriptionId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    hasActiveSubscription?: boolean
    subscriptionId?: string
  }
}