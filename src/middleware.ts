/**
 * COACH NUTRITIONNEL IA - MIDDLEWARE PRINCIPAL 2025
 * =================================================
 * Middleware Next.js 15.3 avec authentification Supabase
 */

import { authMiddleware } from '@/lib/auth/middleware'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return authMiddleware(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public/).*)",
  ],
};