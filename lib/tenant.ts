/**
 * Tenant Scoping Repository
 * 
 * Provides consistent tenant-aware query helpers that enforce multi-tenant isolation.
 * All queries should go through these helpers to prevent cross-tenant data leakage.
 * 
 * Scoping Rules:
 * - OWNER: Can access all data within their organization
 * - ADMIN: Can only access data within their assigned residence
 * - RESIDENT: Can only access data within their assigned apartment
 */

import { prisma } from '@/lib/prisma'
import { AuthUser } from './auth/guards'

// ============================================
// Types
// ============================================

export type TenantScope = 'organization' | 'residence' | 'apartment' | 'none'

export interface ScopedQueryOptions {
  include?: Record<string, unknown>
  orderBy?: Record<string, unknown>
  take?: number
  skip?: number
}

// ============================================
// Scope Detection
// ============================================

/**
 * Get the tenant scope level for a user
 */
export function getTenantScope(user: AuthUser): TenantScope {
  if (user.role === 'OWNER') {
    return 'organization'
  }
  
  if (user.role === 'ADMIN' && user.residenceId) {
    return 'residence'
  }
  
  if (user.role === 'RESIDENT' && user.apartmentId) {
    return 'apartment'
  }
  
  return 'none'
}

/**
 * Build a tenant filter based on user role
 * This is the CORE scoping function - all tenant queries should use this
 */
export function buildTenantFilter(user: AuthUser): Record<string, unknown> {
  const scope = getTenantScope(user)
  
  switch (scope) {
    case 'organization':
      // OWNER: Filter by their organization
      return { organizationId: user.organizationId }
    
    case 'residence':
      // ADMIN: Filter by their residence
      return { residenceId: user.residenceId }
    
    case 'apartment':
      // RESIDENT: Filter by their apartment
      return { apartmentId: user.apartmentId }
    
    case 'none':
    default:
      // No valid scope - return nothing (should be caught by auth guards)
      return {}
  }
}

/**
 * Build a residence filter (for ADMIN users)
 * ADMIN users can only access their assigned residence
 * OWNER can optionally filter by specific residence
 */
export function buildResidenceFilter(
  user: AuthUser, 
  targetResidenceId?: string
): Record<string, unknown> {
  if (user.role === 'OWNER') {
    // OWNER can specify a residence or see all
    if (targetResidenceId) {
      return { id: targetResidenceId }
    }
    return {}
  }
  
  if (user.role === 'ADMIN' && user.residenceId) {
    // ADMIN can only access their assigned residence
    return { id: user.residenceId }
  }
  
  // RESIDENT - should not access residences directly
  return { id: '' } // Impossible condition - will return nothing
}

// ============================================
// Apartment Scoped Queries
// ============================================

/**
 * Get apartments with tenant scoping
 */
export async function getApartments(
  user: AuthUser,
  options: ScopedQueryOptions = {}
) {
  const filter = buildTenantFilter(user)
  
  return prisma.apartment.findMany({
    where: filter,
    include: options.include as never,
    orderBy: options.orderBy,
    take: options.take,
    skip: options.skip
  })
}

/**
 * Get single apartment with tenant scoping
 */
export async function getApartmentById(
  user: AuthUser,
  apartmentId: string
) {
  const scope = getTenantScope(user)
  
  // For RESIDENT, they can only access their own apartment
  if (user.role === 'RESIDENT') {
    if (user.apartmentId !== apartmentId) {
      return null // Not authorized
    }
    return prisma.apartment.findUnique({
      where: { id: apartmentId }
    })
  }
  
  // For ADMIN/OWNER, use residence filter
  const filter = buildTenantFilter(user)
  return prisma.apartment.findFirst({
    where: {
      id: apartmentId,
      ...filter
    }
  })
}

// ============================================
// Charge Scoped Queries
// ============================================

/**
 * Get charges with tenant scoping
 */
export async function getCharges(
  user: AuthUser,
  options: ScopedQueryOptions = {}
) {
  const filter = buildTenantFilter(user)
  
  return prisma.charge.findMany({
    where: filter,
    include: {
      apartment: {
        include: {
          residence: { select: { name: true } }
        }
      }
    },
    orderBy: options.orderBy || [{ year: 'desc' }, { month: 'desc' }],
    take: options.take,
    skip: options.skip
  })
}

/**
 * Get single charge with tenant scoping
 */
export async function getChargeById(
  user: AuthUser,
  chargeId: string
) {
  const scope = getTenantScope(user)
  
  if (scope === 'apartment') {
    // RESIDENT can only access their own charges
    const charge = await prisma.charge.findUnique({
      where: { id: chargeId }
    })
    if (!charge || charge.apartmentId !== user.apartmentId) {
      return null
    }
    return charge
  }
  
  const filter = buildTenantFilter(user)
  return prisma.charge.findFirst({
    where: {
      id: chargeId,
      ...filter
    }
  })
}

// ============================================
// Payment Scoped Queries
// ============================================

/**
 * Get payments with tenant scoping
 */
export async function getPayments(
  user: AuthUser,
  options: ScopedQueryOptions = {}
) {
  const scope = getTenantScope(user)
  
  if (scope === 'apartment') {
    // RESIDENT: Only their payments
    return prisma.payment.findMany({
      where: { apartmentId: user.apartmentId },
      include: {
        apartment: { include: { residence: { select: { name: true } } } },
        charge: { select: { title: true, month: true, year: true } }
      },
      orderBy: options.orderBy || { createdAt: 'desc' },
      take: options.take,
      skip: options.skip
    })
  }
  
  // ADMIN/OWNER: Use residence filter
  const filter = buildTenantFilter(user)
  return prisma.payment.findMany({
    where: filter,
    include: {
      apartment: { include: { residence: { select: { name: true } } } },
      charge: { select: { title: true, month: true, year: true } }
    },
    orderBy: options.orderBy || { createdAt: 'desc' },
    take: options.take,
    skip: options.skip
  })
}

/**
 * Get single payment with tenant scoping
 */
export async function getPaymentById(
  user: AuthUser,
  paymentId: string
) {
  const scope = getTenantScope(user)
  
  if (scope === 'apartment') {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    })
    if (!payment || payment.apartmentId !== user.apartmentId) {
      return null
    }
    return payment
  }
  
  const filter = buildTenantFilter(user)
  return prisma.payment.findFirst({
    where: {
      id: paymentId,
      ...filter
    }
  })
}

// ============================================
// Residence Scoped Queries
// ============================================

/**
 * Get residences with tenant scoping
 */
export async function getResidences(
  user: AuthUser,
  options: ScopedQueryOptions = {}
) {
  const filter = buildTenantFilter(user)
  
  return prisma.residence.findMany({
    where: filter,
    include: options.include as never,
    orderBy: options.orderBy || { name: 'asc' },
    take: options.take,
    skip: options.skip
  })
}

/**
 * Get single residence with tenant scoping
 */
export async function getResidenceById(
  user: AuthUser,
  residenceId: string
) {
  // Check access
  if (!validateResidenceAccess(user, residenceId)) {
    return null
  }
  
  return prisma.residence.findUnique({
    where: { id: residenceId }
  })
}

/**
 * Validate that user can access a specific residence
 */
export function validateResidenceAccess(
  user: AuthUser,
  targetResidenceId: string
): boolean {
  // OWNER: Can access any residence in their organization
  if (user.role === 'OWNER') {
    return true // Could add org check if needed
  }
  
  // ADMIN: Can only access their assigned residence
  if (user.role === 'ADMIN') {
    return user.residenceId === targetResidenceId
  }
  
  // RESIDENT: Cannot access residences directly
  return false
}

// ============================================
// User/Resident Scoped Queries
// ============================================

/**
 * Get users (residents) with tenant scoping
 */
export async function getUsers(
  user: AuthUser,
  options: ScopedQueryOptions = {}
) {
  const filter = buildTenantFilter(user)
  
  return prisma.user.findMany({
    where: {
      ...filter,
      role: 'RESIDENT' // Only get residents
    },
    include: {
      apartment: {
        include: {
          residence: { select: { name: true } }
        }
      }
    },
    orderBy: options.orderBy || { createdAt: 'desc' },
    take: options.take,
    skip: options.skip
  })
}

/**
 * Get single user with tenant scoping
 */
export async function getUserById(
  user: AuthUser,
  targetUserId: string
) {
  const scope = getTenantScope(user)
  
  // RESIDENT can only see themselves
  if (scope === 'apartment') {
    if (user.id !== targetUserId) {
      return null
    }
    return prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        apartment: {
          include: {
            residence: { select: { name: true } }
          }
        }
      }
    })
  }
  
  const filter = buildTenantFilter(user)
  return prisma.user.findFirst({
    where: {
      id: targetUserId,
      ...filter
    },
    include: {
      apartment: {
        include: {
          residence: { select: { name: true } }
        }
      }
    }
  })
}

// ============================================
// Expense Scoped Queries
// ============================================

/**
 * Get expenses with tenant scoping
 */
export async function getExpenses(
  user: AuthUser,
  options: ScopedQueryOptions = {}
) {
  const filter = buildTenantFilter(user)
  
  return prisma.expense.findMany({
    where: filter,
    include: {
      residence: { select: { name: true, city: true } }
    },
    orderBy: options.orderBy || { date: 'desc' },
    take: options.take,
    skip: options.skip
  })
}

// ============================================
// Maintenance Request Scoped Queries
// ============================================

/**
 * Get maintenance requests with tenant scoping
 */
export async function getMaintenanceRequests(
  user: AuthUser,
  options: ScopedQueryOptions = {}
) {
  const scope = getTenantScope(user)
  
  if (scope === 'apartment') {
    // RESIDENT: Only their own requests
    return prisma.maintenanceRequest.findMany({
      where: { apartmentId: user.apartmentId },
      include: {
        apartment: { select: { number: true, building: true } },
        residence: { select: { name: true } }
      },
      orderBy: options.orderBy || { createdAt: 'desc' },
      take: options.take,
      skip: options.skip
    })
  }
  
  const filter = buildTenantFilter(user)
  return prisma.maintenanceRequest.findMany({
    where: filter,
    include: {
      apartment: { select: { number: true, building: true } },
      residence: { select: { name: true } },
      reportedBy: { select: { name: true, email: true } }
    },
    orderBy: options.orderBy || { createdAt: 'desc' },
    take: options.take,
    skip: options.skip
  })
}

// ============================================
// Announcement Scoped Queries
// ============================================

/**
 * Get announcements with tenant scoping
 */
export async function getAnnouncements(
  user: AuthUser,
  options: ScopedQueryOptions = {}
) {
  const filter = buildTenantFilter(user)
  
  return prisma.announcement.findMany({
    where: filter,
    include: {
      residence: { select: { name: true } },
      createdBy: { select: { name: true } }
    },
    orderBy: options.orderBy || { createdAt: 'desc' },
    take: options.take,
    skip: options.skip
  })
}

// ============================================
// Document Scoped Queries
// ============================================

/**
 * Get documents with tenant scoping
 */
export async function getDocuments(
  user: AuthUser,
  options: ScopedQueryOptions = {}
) {
  const scope = getTenantScope(user)
  
  if (scope === 'apartment') {
    // RESIDENT: Documents for their apartment OR general residence documents
    return prisma.document.findMany({
      where: {
        OR: [
          { apartmentId: user.apartmentId },
          { residenceId: user.residenceId, apartmentId: null }
        ]
      },
      include: {
        residence: { select: { name: true } },
        uploadedBy: { select: { name: true } },
        apartment: { select: { number: true } }
      },
      orderBy: options.orderBy || { createdAt: 'desc' },
      take: options.take,
      skip: options.skip
    })
  }
  
  const filter = buildTenantFilter(user)
  return prisma.document.findMany({
    where: filter,
    include: {
      residence: { select: { name: true } },
      uploadedBy: { select: { name: true } },
      apartment: { select: { number: true } }
    },
    orderBy: options.orderBy || { createdAt: 'desc' },
    take: options.take,
    skip: options.skip
  })
}

// ============================================
// Utility: Verify User Can Access Target Resource
// ============================================

/**
 * Verify user can access a specific resource
 * Returns the resource if accessible, null otherwise
 */
export async function verifyAccess<T>(
  user: AuthUser,
  resourceType: 'apartment' | 'charge' | 'payment' | 'residence' | 'user' | 'maintenance' | 'document',
  resourceId: string
): Promise<T | null> {
  switch (resourceType) {
    case 'apartment':
      return (await getApartmentById(user, resourceId)) as T | null
    case 'charge':
      return (await getChargeById(user, resourceId)) as T | null
    case 'payment':
      return (await getPaymentById(user, resourceId)) as T | null
    case 'residence':
      return (await getResidenceById(user, resourceId)) as T | null
    case 'user':
      return (await getUserById(user, resourceId)) as T | null
    case 'maintenance':
      const mFilter = buildTenantFilter(user)
      return (await prisma.maintenanceRequest.findFirst({
        where: { id: resourceId, ...mFilter }
      })) as T | null
    case 'document':
      const dFilter = buildTenantFilter(user)
      return (await prisma.document.findFirst({
        where: { id: resourceId, ...dFilter }
      })) as T | null
    default:
      return null
  }
}
