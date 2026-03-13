/**
 * Server-Side Authentication and RBAC Guards
 * 
 * Provides reusable authorization helpers for API routes.
 * Centralizes auth logic to avoid duplication across routes.
 * 
 * Usage:
 *   import { requireAdmin, requireAuth, createResidenceFilter } from '@/lib/auth/guards'
 * 
 *   export async function GET() {
 *     const user = await requireAdmin()
 *     if (user instanceof NextResponse) return user
 *     
 *     const filter = createResidenceFilter(user)
 *     const data = await prisma.residence.findMany({ where: filter })
 *     return NextResponse.json(data)
 *   }
 */

import { NextResponse } from 'next/server'
import { getServerSession, Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@/lib/enums'

export { UserRole }

// ============================================
// Types
// ============================================

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  organizationId: string
  organizationName: string
  apartmentId?: string
  apartmentNumber?: string
  residenceId?: string
  residenceName?: string
}

export interface AuthError {
  error: string
  code?: string
}

// ============================================
// Core Auth Functions
// ============================================

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}

/**
 * Get authenticated user from session
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  const session = await getSession()
  if (!session?.user) {
    return null
  }
  return session.user as AuthUser
}

// ============================================
// Guard Functions
// ============================================

/**
 * Require authentication - returns user or error response
 */
export async function requireAuth(): Promise<AuthUser | NextResponse<AuthError>> {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  return user
}

/**
 * Require specific role(s) - returns user with role or error response
 */
export async function requireRole(...allowedRoles: UserRole[]): Promise<AuthUser | NextResponse<AuthError>> {
  const user = await requireAuth()
  
  // If already an error response, return it
  if (user instanceof NextResponse) {
    return user
  }
  
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: `Access denied. Required role: ${allowedRoles.join(' or ')}` },
      { status: 403 }
    )
  }
  
  return user
}

/**
 * Require OWNER role - platform-wide access
 */
export async function requireOwner(): Promise<AuthUser | NextResponse<AuthError>> {
  return requireRole(UserRole.OWNER)
}

/**
 * Require ADMIN role - residence-level access
 */
export async function requireAdmin(): Promise<AuthUser | NextResponse<AuthError>> {
  return requireRole(UserRole.ADMIN)
}

/**
 * Require RESIDENT role - apartment-level access
 */
export async function requireResident(): Promise<AuthUser | NextResponse<AuthError>> {
  return requireRole(UserRole.RESIDENT)
}

/**
 * Require ADMIN or OWNER
 */
export async function requireAdminOrOwner(): Promise<AuthUser | NextResponse<AuthError>> {
  return requireRole(UserRole.ADMIN, UserRole.OWNER)
}

/**
 * Require ADMIN with assigned residence
 * Returns user with validated residenceId
 */
export async function requireAdminWithResidence(): Promise<AuthUser | NextResponse<AuthError>> {
  const user = await requireAdmin()
  
  // If already an error response, return it
  if (user instanceof NextResponse) {
    return user
  }
  
  if (!user.residenceId) {
    return NextResponse.json(
      { error: 'Admin residence not assigned. Please contact the owner.' },
      { status: 403 }
    )
  }
  
  return user
}

/**
 * Require RESIDENT with assigned apartment
 */
export async function requireResidentWithApartment(): Promise<AuthUser | NextResponse<AuthError>> {
  const user = await requireResident()
  
  // If already an error response, return it
  if (user instanceof NextResponse) {
    return user
  }
  
  if (!user.apartmentId) {
    return NextResponse.json(
      { error: 'Resident apartment not assigned. Please contact admin.' },
      { status: 403 }
    )
  }
  
  return user
}

// ============================================
// Tenant Scoping Helpers
// ============================================

/**
 * Tenant scope types
 */
export type TenantScope = 
  | { type: 'organization'; organizationId: string }
  | { type: 'residence'; residenceId: string }
  | { type: 'apartment'; apartmentId: string }
  | { type: 'none' }

/**
 * Get tenant scope based on user role
 * - OWNER: organization-wide scope
 * - ADMIN: residence-wide scope  
 * - RESIDENT: apartment-specific scope
 */
export function getTenantScope(user: AuthUser): TenantScope {
  if (user.role === UserRole.OWNER) {
    return { type: 'organization', organizationId: user.organizationId }
  }
  
  if (user.role === UserRole.ADMIN && user.residenceId) {
    return { type: 'residence', residenceId: user.residenceId }
  }
  
  if (user.role === UserRole.RESIDENT && user.apartmentId) {
    return { type: 'apartment', apartmentId: user.apartmentId }
  }
  
  return { type: 'none' }
}

/**
 * Create Prisma where clause for tenant-scoped queries
 * Automatically scopes queries based on user role
 */
export function createTenantFilter(user: AuthUser): Record<string, unknown> {
  const scope = getTenantScope(user)
  
  switch (scope.type) {
    case 'organization':
      return { organizationId: scope.organizationId }
    
    case 'residence':
      return { residenceId: scope.residenceId }
    
    case 'apartment':
      return { apartmentId: scope.apartmentId }
    
    default:
      return {}
  }
}

/**
 * Create residence-scoped filter (for ADMIN users)
 * ADMIN users can only access their assigned residence
 */
export function createResidenceFilter(user: AuthUser): Record<string, unknown> {
  if (user.role === UserRole.ADMIN && user.residenceId) {
    return { residenceId: user.residenceId }
  }
  // OWNER sees all residences
  return {}
}

/**
 * Create apartment-scoped filter (for RESIDENT users)
 */
export function createApartmentFilter(user: AuthUser): Record<string, unknown> {
  if (user.role === UserRole.RESIDENT && user.apartmentId) {
    return { id: user.apartmentId }
  }
  // ADMIN sees all apartments in their residence
  // OWNER sees all apartments
  return {}
}

/**
 * Validate that ADMIN user can access specific residence
 */
export function validateResidenceAccess(
  user: AuthUser, 
  targetResidenceId: string
): boolean {
  // OWNER can access any residence
  if (user.role === UserRole.OWNER) {
    return true
  }
  
  // ADMIN can only access their assigned residence
  if (user.role === UserRole.ADMIN) {
    return user.residenceId === targetResidenceId
  }
  
  // RESIDENT cannot access residences directly
  return false
}

// ============================================
// Error Response Helpers
// ============================================

/**
 * Create standardized error response
 */
export function unauthorized(message = 'Unauthorized'): NextResponse<AuthError> {
  return NextResponse.json({ error: message }, { status: 401 })
}

/**
 * Create forbidden error response
 */
export function forbidden(message = 'Forbidden'): NextResponse<AuthError> {
  return NextResponse.json({ error: message }, { status: 403 })
}

/**
 * Create not found error response
 */
export function notFound(message = 'Not found'): NextResponse<AuthError> {
  return NextResponse.json({ error: message }, { status: 404 })
}

/**
 * Create bad request error response
 */
export function badRequest(message = 'Bad request'): NextResponse<AuthError> {
  return NextResponse.json({ error: message }, { status: 400 })
}
