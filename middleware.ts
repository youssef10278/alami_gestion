import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/', '/abc']
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/signup')
  )

  // API routes that should be excluded from auth checks
  const isApiRoute = pathname.startsWith('/api/')
  const isAuthApiRoute = pathname.startsWith('/api/auth/')

  // Skip middleware for certain API routes to avoid loops
  if (isAuthApiRoute) {
    return NextResponse.next()
  }

  // Handle root path specially to avoid loops
  if (pathname === '/') {
    if (token) {
      const payload = await verifyToken(token)
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicRoute) {
    // Avoid redirect loop by checking if we're already going to login
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // If has token, verify it
  if (token) {
    const payload = await verifyToken(token)

    // If token is invalid and trying to access protected route, redirect to login
    if (!payload && !isPublicRoute) {
      // Avoid redirect loop by checking if we're already going to login
      if (pathname !== '/login') {
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('auth-token')
        return response
      }
    }

    // If valid token and trying to access login page, redirect to dashboard
    if (payload && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check role-based access
    if (payload) {
      const role = payload.role

      // Seller restrictions - can't access certain admin routes
      if (role === 'SELLER') {
        const adminOnlyRoutes = ['/dashboard/users', '/dashboard/settings']
        if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - manifest.json (PWA manifest)
     * - service worker files
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff|woff2|ttf|eot)$).*)',
  ],
}

