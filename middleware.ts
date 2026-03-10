import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Route access control by role
const roleRoutes: Record<string, string[]> = {
  OWNER: ['/owner'],
  ADMIN: ['/admin'],
  RESIDENT: ['/resident'],
}

// Public routes that don't require authentication
const publicRoutes = ['/', '/fr', '/ar', '/fr/subscribe', '/fr/payment-proof', '/ar/subscribe', '/ar/payment-proof']

// Public page routes (with locale prefix)
const publicPages = [
  '/subscribe',
  '/payment-proof',
  '/login',
]

// API public routes
const publicApiRoutes = [
  '/api/public',
]

export async function middleware(request: NextRequest) {
  // Get pathname and remove query string
  let { pathname } = request.nextUrl
  pathname = pathname.split('?')[0]  // Strip query string first

  // Allow static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Allow public API routes
  if (pathname.startsWith('/api/public')) {
    return NextResponse.next()
  }

  // Handle API routes (not public) - let them through for auth check in handlers
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Handle root path - redirect to default locale (fr)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/fr', request.url))
  }

  // Allow public routes (landing pages)
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if pathname is a public page (e.g., /fr/subscribe, /fr/payment-proof)
  // Extract locale from pathname if present
  const pathParts = pathname.split('/').filter(Boolean)
  const hasLocale = ['fr', 'ar'].includes(pathParts[0])
  const pathWithoutLocale = hasLocale ? '/' + pathParts.slice(1).join('/') : pathname
  
  const isPublicPage = publicPages.some(page => pathWithoutLocale === page || pathWithoutLocale.startsWith(`${page}/`))
  if (isPublicPage) {
    return NextResponse.next()
  }

  // Allow login page without authentication
  if (pathname.includes('/login')) {
    // Check if user is already logged in
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (token) {
      // User is already logged in, redirect to their dashboard
      const locale = pathname.split('/')[1] || 'fr'
      const role = token.role as string
      const redirectMap: Record<string, string> = {
        OWNER: `/${locale}/owner`,
        ADMIN: `/${locale}/admin`,
        RESIDENT: `/${locale}/resident`,
      }
      const redirectTo = redirectMap[role] || `/${locale}/dashboard`
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    return NextResponse.next()
  }

  // Check if pathname already starts with a locale
  const locales = ['fr', 'ar']
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    // Redirect to the default locale (fr)
    const defaultLocale = 'fr'
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    )
  }

  // Get the session token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // If no token, redirect to login
  if (!token) {
    const locale = pathname.split('/')[1] || 'fr'
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
  }

  // Get user role from token
  const role = token.role as string

  // Check if user has access to the requested route
  const allowedRoutes = roleRoutes[role] || []
  const hasAccess = allowedRoutes.some(route => pathname.startsWith(`/${route}`) || pathname.includes(route))

  if (!hasAccess) {
    // Redirect to appropriate dashboard based on role
    const locale = pathname.split('/')[1] || 'fr'
    const redirectMap: Record<string, string> = {
      OWNER: `/${locale}/owner`,
      ADMIN: `/${locale}/admin`,
      RESIDENT: `/${locale}/resident`,
    }
    const redirectTo = redirectMap[role] || `/${locale}/login`
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
