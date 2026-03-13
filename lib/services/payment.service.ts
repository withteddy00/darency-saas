/**
 * Payment Service
 * 
 * Handles payment-related business logic, validation, and data access.
 */

import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

// ============================================
// Types
// ============================================

export interface PaymentFilters {
  status?: string
  residenceId?: string
  apartmentId?: string
  month?: number
  year?: number
}

export interface CreatePaymentInput {
  amount: number
  status: string
  method: string
  paidDate?: Date
  dueDate: Date
  notes?: string
  apartmentId?: string
  chargeId?: string
  subscriptionId?: string
}

export interface PaymentWithDetails {
  id: string
  amount: number
  status: string
  method: string | null
  paidDate: string | null
  dueDate: string
  notes: string | null
  apartment?: {
    number: string
    building: string | null
    residence: { name: string }
  } | null
  charge?: { title: string; month: number; year: number } | null
}

// ============================================
// Query Functions
// ============================================

/**
 * Get payments with filtering and pagination
 */
export async function getPayments(
  filters: PaymentFilters,
  options: { take?: number; skip?: number } = {}
): Promise<PaymentWithDetails[]> {
  const { status, residenceId, apartmentId, month, year } = filters
  const { take = 100, skip = 0 } = options

  const where: Record<string, unknown> = {}

  if (status) where.status = status
  if (apartmentId) where.apartmentId = apartmentId
  if (residenceId) where.apartment = { residenceId }
  if (month) where.charge = { month }
  if (year) where.charge = { year }

  const payments = await prisma.payment.findMany({
    where,
    take,
    skip,
    orderBy: { createdAt: 'desc' },
    include: {
      apartment: {
        include: {
          residence: { select: { name: true } }
        }
      },
      charge: { select: { title: true, month: true, year: true } }
    }
  })

  return payments.map(p => ({
    id: p.id,
    amount: p.amount,
    status: p.status,
    method: p.method,
    paidDate: p.paidDate?.toISOString() || null,
    dueDate: p.dueDate.toISOString(),
    notes: p.notes,
    apartment: p.apartment ? {
      number: p.apartment.number,
      building: p.apartment.building,
      residence: p.apartment.residence
    } : null,
    charge: p.charge
  }))
}

/**
 * Get single payment by ID
 */
export async function getPaymentById(paymentId: string): Promise<PaymentWithDetails | null> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      apartment: {
        include: {
          residence: { select: { name: true } }
        }
      },
      charge: { select: { title: true, month: true, year: true } }
    }
  })

  if (!payment) return null

  return {
    id: payment.id,
    amount: payment.amount,
    status: payment.status,
    method: payment.method,
    paidDate: payment.paidDate?.toISOString() || null,
    dueDate: payment.dueDate.toISOString(),
    notes: payment.notes,
    apartment: payment.apartment ? {
      number: payment.apartment.number,
      building: payment.apartment.building,
      residence: payment.apartment.residence
    } : null,
    charge: payment.charge
  }
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(residenceId: string): Promise<{
  totalCollected: number
  totalPending: number
  totalOverdue: number
  collectionRate: number
}> {
  const charges = await prisma.charge.findMany({
    where: { residenceId },
    select: { id: true, amount: true }
  })
  const chargeIds = charges.map(c => c.id)

  const [paid, pending, overdue] = await Promise.all([
    prisma.payment.aggregate({
      where: { chargeId: { in: chargeIds }, status: 'PAID' },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: { chargeId: { in: chargeIds }, status: 'PENDING' },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: { 
        chargeId: { in: chargeIds },
        status: { in: ['PENDING', 'OVERDUE'] },
        dueDate: { lt: new Date() }
      },
      _sum: { amount: true }
    })
  ])

  const totalCollected = paid._sum.amount || 0
  const totalPending = pending._sum.amount || 0
  const totalOverdue = overdue._sum.amount || 0
  const totalExpected = totalCollected + totalPending

  return {
    totalCollected,
    totalPending,
    totalOverdue,
    collectionRate: totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0
  }
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Create a new payment
 */
export async function createPayment(
  data: CreatePaymentInput,
  userId: string,
  organizationId: string
): Promise<PaymentWithDetails> {
  const payment = await prisma.payment.create({
    data: {
      amount: data.amount,
      status: data.status,
      method: data.method,
      paidDate: data.paidDate,
      dueDate: data.dueDate,
      notes: data.notes,
      apartmentId: data.apartmentId,
      chargeId: data.chargeId,
      subscriptionId: data.subscriptionId
    },
    include: {
      apartment: {
        include: {
          residence: { select: { name: true } }
        }
      },
      charge: { select: { title: true, month: true, year: true } }
    }
  })

  // Log activity
  await logActivity({
    action: 'PAYMENT_CREATED',
    target: 'Payment',
    targetId: payment.id,
    description: `Payment of ${payment.amount} MAD created`,
    userId,
    organizationId,
    metadata: { amount: payment.amount, status: payment.status }
  })

  return {
    id: payment.id,
    amount: payment.amount,
    status: payment.status,
    method: payment.method,
    paidDate: payment.paidDate?.toISOString() || null,
    dueDate: payment.dueDate.toISOString(),
    notes: payment.notes,
    apartment: payment.apartment ? {
      number: payment.apartment.number,
      building: payment.apartment.building,
      residence: payment.apartment.residence
    } : null,
    charge: payment.charge
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: string,
  paidDate?: Date,
  method?: string,
  userId?: string,
  organizationId?: string
): Promise<PaymentWithDetails | null> {
  const updateData: Record<string, unknown> = { status }
  
  if (paidDate) updateData.paidDate = paidDate
  if (method) updateData.method = method

  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: updateData,
    include: {
      apartment: {
        include: {
          residence: { select: { name: true } }
        }
      },
      charge: { select: { title: true, month: true, year: true } }
    }
  })

  if (userId && organizationId) {
    await logActivity({
      action: 'PAYMENT_UPDATED',
      target: 'Payment',
      targetId: payment.id,
      description: `Payment status updated to ${status}`,
      userId,
      organizationId,
      metadata: { status, amount: payment.amount }
    })
  }

  return {
    id: payment.id,
    amount: payment.amount,
    status: payment.status,
    method: payment.method,
    paidDate: payment.paidDate?.toISOString() || null,
    dueDate: payment.dueDate.toISOString(),
    notes: payment.notes,
    apartment: payment.apartment ? {
      number: payment.apartment.number,
      building: payment.apartment.building,
      residence: payment.apartment.residence
    } : null,
    charge: payment.charge
  }
}

/**
 * Record a payment (mark as PAID)
 */
export async function recordPayment(
  paymentId: string,
  method: string,
  userId: string,
  organizationId: string
): Promise<PaymentWithDetails | null> {
  return updatePaymentStatus(
    paymentId,
    'PAID',
    new Date(),
    method,
    userId,
    organizationId
  )
}
