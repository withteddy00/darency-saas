import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Route access control by role
const roleRoutes: Record<string, string[]> = {
  OWNER: ['/owner', '/admin', '/resident', '/dashboard'],
  ADMIN: ['/admin', '/dashboard'],
  RESIDENT: ['/resident'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static files, API routes, and auth pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('/login') ||
    pathname === '/'
  ) {
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
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|favicon.ico|api|.*\\..*).*)',
  ],
}
