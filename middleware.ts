import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// ============================================
// Configuration
// ============================================

// Supported locales
const SUPPORTED_LOCALES = ['fr', 'ar'] as const
const DEFAULT_LOCALE = 'fr'

// Route access control by role - maps role to route segment
const ROLE_ROUTE_MAP: Record<string, string> = {
  OWNER: 'owner',
  ADMIN: 'admin',
  RESIDENT: 'resident',
}

// Public root routes (no authentication required)
const PUBLIC_ROOT_ROUTES = ['/', '/fr', '/ar']

// Public page routes (without locale prefix)
const PUBLIC_PAGES = ['/subscribe', '/payment-proof', '/login']

// Public API prefix
const PUBLIC_API_PREFIX = '/api/public'

// ============================================
// Helper Functions
// ============================================

/**
 * Parse locale from pathname
 * Returns { locale: string | null, segments: string[] }
 * 
 * Examples:
 *   '/fr/admin/dashboard' -> { locale: 'fr', segments: ['admin', 'dashboard'] }
 *   '/admin/dashboard'     -> { locale: null, segments: ['admin', 'dashboard'] }
 *   '/'                    -> { locale: null, segments: [] }
 */
function parseLocaleFromPath(pathname: string): { locale: string | null; segments: string[] } {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0] || ''
  
  if (SUPPORTED_LOCALES.includes(firstSegment as typeof SUPPORTED_LOCALES[number])) {
    return {
      locale: firstSegment,
      segments: segments.slice(1),
    }
  }
  
  return { locale: null, segments }
}

/**
 * Check if path is a public route (no auth required)
 */
function isPublicRoute(pathname: string): boolean {
  const { locale, segments } = parseLocaleFromPath(pathname)
  
  // Check root routes
  if (PUBLIC_ROOT_ROUTES.includes(pathname)) {
    return true
  }
  
  // Build path without locale
  const pathWithoutLocale = segments.length > 0 ? '/' + segments.join('/') : '/'
  const pathWithLocale = locale ? `/${locale}${pathWithoutLocale}` : pathWithoutLocale
  
  // Check public pages - exact match or sub-path match
  const isPublicPage = PUBLIC_PAGES.some(
    page => 
      page === pathWithoutLocale || 
      pathWithoutLocale.startsWith(page + '/') ||
      page === pathWithLocale ||
      pathWithLocale.startsWith(`${page}/`)
  )
  
  return isPublicPage
}

/**
 * Extract route family from pathname
 * Returns 'owner', 'admin', 'resident' or null
 * 
 * Examples:
 *   '/fr/admin/dashboard' -> 'admin'
 *   '/owner/subscriptions' -> 'owner'
 *   '/resident/payments'   -> 'resident'
 */
function getRouteFamily(pathname: string): string | null {
  const { segments } = parseLocaleFromPath(pathname)
  
  // First segment after locale is the route family
  const routeFamily = segments[0] || null
  
  // Validate against known route families
  if (routeFamily && Object.values(ROLE_ROUTE_MAP).includes(routeFamily)) {
    return routeFamily
  }
  
  return null
}

/**
 * Check if user role has access to the requested route
 * Uses segment-based matching to avoid substring overmatching
 */
function hasAccess(role: string, pathname: string): boolean {
  const userRouteFamily = ROLE_ROUTE_MAP[role]
  const requestedRouteFamily = getRouteFamily(pathname)
  
  // No route family = not a protected route segment
  if (!requestedRouteFamily) {
    return false
  }
  
  // Exact segment match required
  return userRouteFamily === requestedRouteFamily
}

/**
 * Get dashboard URL for a role and locale
 */
function getDashboardUrl(role: string, locale: string): string {
  const routeFamily = ROLE_ROUTE_MAP[role]
  return routeFamily ? `/${locale}/${routeFamily}` : `/${locale}`
}

/**
 * Get login URL for a locale
 */
function getLoginUrl(locale: string): string {
  return `/${locale}/login`
}

/**
 * Add locale prefix to path if missing
 */
function addLocaleToPath(pathname: string): string {
  const hasLocale = parseLocaleFromPath(pathname).locale !== null
  if (hasLocale) {
    return pathname
  }
  
  return pathname === '/' 
    ? `/${DEFAULT_LOCALE}` 
    : `/${DEFAULT_LOCALE}${pathname}`
}

// ============================================
// Main Middleware
// ============================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Strip query string
  const path = pathname.split('?')[0]
  
  // ============================================
  // Step 1: Allow static files and Next.js internals
  // ============================================
  if (
    path.startsWith('/_next') ||
    path.includes('.') ||
    path.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }
  
  // ============================================
  // Step 2: Handle API routes
  // ============================================
  if (path.startsWith('/api/')) {
    // Public API routes - allow without auth
    if (path.startsWith(PUBLIC_API_PREFIX)) {
      return NextResponse.next()
    }
    // Protected API routes - let handlers manage their own auth
    return NextResponse.next()
  }
  
  // ============================================
  // Step 3: Handle root path
  // ============================================
  if (path === '/') {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url))
  }
  
  // ============================================
  // Step 4: Check public routes
  // ============================================
  if (isPublicRoute(path)) {
    // If logged-in user visits /login, redirect to dashboard
    if (path.includes('/login')) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
      if (token) {
        const locale = parseLocaleFromPath(path).locale || DEFAULT_LOCALE
        return NextResponse.redirect(new URL(getDashboardUrl(token.role as string, locale), request.url))
      }
    }
    return NextResponse.next()
  }
  
  // ============================================
  // Step 5: Extract locale from path
  // ============================================
  const { locale: pathLocale, segments } = parseLocaleFromPath(path)
  const locale = pathLocale || DEFAULT_LOCALE
  
  // ============================================
  // Step 6: Add locale if missing (redirect)
  // ============================================
  if (!pathLocale && segments.length > 0) {
    const newPath = addLocaleToPath(path)
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  
  // ============================================
  // Step 7: Authenticate user
  // ============================================
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  // No session - redirect to login
  if (!token) {
    return NextResponse.redirect(new URL(getLoginUrl(locale), request.url))
  }
  
  // ============================================
  // Step 8: Check role-based access
  // ============================================
  const role = token.role as string
  const routeFamily = getRouteFamily(path)
  
  // Case A: Route family detected but user doesn't have access
  if (routeFamily && !hasAccess(role, path)) {
    return NextResponse.redirect(new URL(getDashboardUrl(role, locale), request.url))
  }
  
  // Case B: No valid route family (not a protected segment)
  if (!routeFamily) {
    return NextResponse.redirect(new URL(getDashboardUrl(role, locale), request.url))
  }
  
  // ============================================
  // Step 9: Allow access
  // ============================================
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - files with extensions (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
