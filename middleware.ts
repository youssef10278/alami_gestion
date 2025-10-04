import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith('/api/auth/login')
  )

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If has token, verify it
  if (token) {
    const payload = await verifyToken(token)
    
    // If token is invalid and trying to access protected route, redirect to login
    if (!payload && !isPublicRoute) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }

    // If valid token and trying to access login page, redirect to dashboard
    if (payload && request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check role-based access
    if (payload) {
      const role = payload.role
      const pathname = request.nextUrl.pathname

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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

