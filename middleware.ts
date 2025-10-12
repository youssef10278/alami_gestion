import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const pathname = request.nextUrl.pathname
  const url = request.url

  // Log pour debug (seulement en développement)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${pathname} - Token: ${token ? 'présent' : 'absent'}`)
  }

  // Routes qui doivent être complètement ignorées par le middleware
  const ignoredPaths = [
    '/_next',
    '/favicon.ico',
    '/manifest.json',
    '/sw.js',
    '/workbox-',
    '/api/auth/login',
    '/api/auth/signup'
  ]

  if (ignoredPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/debug', '/mobile-test', '/login-simple']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Handle root path specially - TOUJOURS rediriger sans vérification de token
  if (pathname === '/') {
    if (token) {
      try {
        const payload = await verifyToken(token)
        if (payload) {
          return NextResponse.redirect(new URL('/dashboard', url))
        }
      } catch (error) {
        // Token invalide, supprimer et rediriger vers login
        const response = NextResponse.redirect(new URL('/login', url))
        response.cookies.delete('auth-token')
        return response
      }
    }
    return NextResponse.redirect(new URL('/login', url))
  }

  // Si on est sur /login, laisser passer SAUF si on a un token valide
  if (pathname === '/login') {
    if (token) {
      try {
        const payload = await verifyToken(token)
        if (payload) {
          return NextResponse.redirect(new URL('/dashboard', url))
        }
      } catch (error) {
        // Token invalide, supprimer le cookie et laisser accéder à login
        const response = NextResponse.next()
        response.cookies.delete('auth-token')
        return response
      }
    }
    return NextResponse.next()
  }

  // Si on est sur /debug, toujours laisser passer
  if (pathname === '/debug') {
    return NextResponse.next()
  }

  // Pour toutes les autres routes, vérifier l'authentification
  if (!token) {
    return NextResponse.redirect(new URL('/login', url))
  }

  // Vérifier la validité du token
  try {
    const payload = await verifyToken(token)

    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', url))
      response.cookies.delete('auth-token')
      return response
    }

    // Check role-based access
    const role = payload.role
    if (role === 'SELLER') {
      const adminOnlyRoutes = ['/dashboard/users', '/dashboard/settings']
      if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/dashboard', url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    // Erreur de vérification du token
    const response = NextResponse.redirect(new URL('/login', url))
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: [
    // Temporairement désactivé pour debug mobile
    // '/((?!_next|api/auth|favicon.ico|manifest.json|sw.js|.*\\.(svg|png|jpg|jpeg|gif|webp|ico|js|css|woff|woff2|ttf|eot|map)).*)',
  ],
}

