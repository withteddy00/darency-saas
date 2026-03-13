/**
 * Dashboard Service
 * 
 * Handles dashboard data aggregation and statistics.
 */

import { prisma } from '@/lib/prisma'

// ============================================
// Types
// ============================================

export interface OwnerDashboardStats {
  totalResidences: number
  totalAdmins: number
  totalResidents: number
  totalOrganizations: number
  activeSubscriptions: number
  pendingRequests: number
  monthlyRevenue: number
  totalPayments: number
  totalCharges: number
  totalExpenses: number
  netRevenue: number
}

export interface AdminDashboardStats {
  residence: {
    id: string
    name: string
    address: string
    city: string
  } | null
  apartments: {
    total: number
    occupied: number
    vacant: number
    occupancyRate: number
  }
  residents: {
    total: number
  }
  charges: {
    total: number
    paid: number
    pending: number
    overdue: number
  }
  payments: {
    total: number
    collected: number
    pending: number
    collectionRate: number
  }
  expenses: {
    total: number
    thisMonth: number
  }
  maintenanceRequests: {
    open: number
    inProgress: number
    completed: number
  }
}

export interface ResidentDashboardStats {
  apartment: {
    number: string
    building: string
    type: string
  } | null
  residence: {
    id: string
    name: string
    address: string
  } | null
  charges: {
    unpaid: number
    paid: number
    total: number
    pendingPayments: Array<{
      id: string
      title: string
      amount: number
      dueDate: string
      month: number
      year: number
    }>
    paidPayments: Array<{
      id: string
      title: string
      amount: number
      paidDate: string
      month: number
      year: number
    }>
  }
  payments: {
    total: number
    totalAmount: number
    latestPayment: {
      id: string
      amount: number
      method: string
      paidDate: string
      chargeTitle: string
    } | null
    recent: Array<{
      id: string
      amount: number
      status: string
      method: string
      paidDate: string | null
      dueDate: string
      chargeTitle: string
      month: number
      year: number
    }>
  }
  maintenanceRequests: {
    open: number
    inProgress: number
    completed: number
    recent: Array<{
      id: string
      title: string
      status: string
      priority: string
      category: string
      createdAt: string
    }>
  }
}

// ============================================
// Owner Dashboard
// ============================================

/**
 * Get owner dashboard statistics (platform-wide)
 */
export async function getOwnerDashboardStats(): Promise<OwnerDashboardStats> {
  const [
    totalResidences,
    totalAdmins,
    totalResidents,
    totalOrganizations,
    activeSubscriptions,
    pendingRequests,
    allPayments,
    allCharges,
    allExpenses
  ] = await Promise.all([
    prisma.residence.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'RESIDENT' } }),
    prisma.organization.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.subscriptionRequest.count({ where: { status: 'PENDING' } }),
    prisma.payment.findMany({ where: { status: 'PAID' } }),
    prisma.charge.count(),
    prisma.expense.aggregate({ _sum: { amount: true } })
  ])

  const monthlyRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPayments = allPayments.length
  const totalCharges = allCharges
  const totalExpenses = allExpenses._sum.amount || 0

  return {
    totalResidences,
    totalAdmins,
    totalResidents,
    totalOrganizations,
    activeSubscriptions,
    pendingRequests,
    monthlyRevenue,
    totalPayments,
    totalCharges,
    totalExpenses,
    netRevenue: monthlyRevenue - totalExpenses
  }
}

/**
 * Get top residences by revenue
 */
export async function getTopResidencesByRevenue(limit = 5): Promise<Array<{
  id: string
  name: string
  city: string
  revenue: number
  apartments: number
}>> {
  const residences = await prisma.residence.findMany({
    include: {
      apartments: { select: { id: true } },
      charges: {
        include: {
          payments: { where: { status: 'PAID' } }
        }
      }
    }
  })

  return residences
    .map(r => ({
      id: r.id,
      name: r.name,
      city: r.city,
      revenue: r.charges.reduce((sum, c) => 
        sum + c.payments.reduce((pSum, p) => pSum + p.amount, 0), 0),
      apartments: r.apartments.length
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

// ============================================
// Admin Dashboard
// ============================================

/**
 * Get admin dashboard statistics (per residence)
 */
export async function getAdminDashboardStats(residenceId: string): Promise<AdminDashboardStats> {
  const [
    residence,
    apartments,
    residents,
    charges,
    payments,
    expenses,
    maintenanceRequests
  ] = await Promise.all([
    prisma.residence.findUnique({ where: { id: residenceId } }),
    prisma.apartment.findMany({ where: { residenceId } }),
    prisma.user.findMany({ 
      where: { role: 'RESIDENT', apartment: { residenceId } },
      select: { id: true }
    }),
    prisma.charge.findMany({ where: { residenceId } }),
    prisma.payment.findMany({
      where: { apartment: { residenceId } },
      include: { charge: true }
    }),
    prisma.expense.findMany({ where: { residenceId } }),
    prisma.maintenanceRequest.findMany({ where: { residence: { id: residenceId } } })
  ])

  const totalApartments = apartments.length
  const occupiedApartments = apartments.filter(a => a.status === 'OCCUPIED').length
  
  const paidCharges = charges.filter(c => {
    // Check if any payment exists for this charge
    const chargePayments = payments.filter(p => p.chargeId === c.id)
    return chargePayments.some(p => p.status === 'PAID')
  }).length

  const pendingCharges = charges.filter(c => {
    const chargePayments = payments.filter(p => p.chargeId === c.id)
    return chargePayments.length === 0 || chargePayments.every(p => p.status === 'PENDING')
  }).length

  const overdueCharges = charges.filter(c => {
    const chargePayments = payments.filter(p => p.chargeId === c.id)
    return chargePayments.length === 0 && c.dueDate < new Date()
  }).length

  const collected = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0)
  const pending = payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0)

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthExpenses = expenses
    .filter(e => {
      const d = new Date(e.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    .reduce((sum, e) => sum + e.amount, 0)

  return {
    residence: residence ? {
      id: residence.id,
      name: residence.name,
      address: residence.address,
      city: residence.city
    } : null,
    apartments: {
      total: totalApartments,
      occupied: occupiedApartments,
      vacant: totalApartments - occupiedApartments,
      occupancyRate: totalApartments > 0 ? Math.round((occupiedApartments / totalApartments) * 100) : 0
    },
    residents: { total: residents.length },
    charges: {
      total: charges.length,
      paid: paidCharges,
      pending: pendingCharges,
      overdue: overdueCharges
    },
    payments: {
      total: payments.length,
      collected,
      pending,
      collectionRate: (collected + pending) > 0 
        ? Math.round((collected / (collected + pending)) * 100) 
        : 0
    },
    expenses: {
      total: totalExpenses,
      thisMonth: thisMonthExpenses
    },
    maintenanceRequests: {
      open: maintenanceRequests.filter(r => r.status === 'PENDING').length,
      inProgress: maintenanceRequests.filter(r => r.status === 'IN_PROGRESS').length,
      completed: maintenanceRequests.filter(r => r.status === 'COMPLETED').length
    }
  }
}

// ============================================
// Resident Dashboard
// ============================================

/**
 * Get resident dashboard statistics (per user)
 */
export async function getResidentDashboardStats(
  userId: string,
  apartmentId: string
): Promise<ResidentDashboardStats> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      apartment: {
        include: {
          residence: true
        }
      }
    }
  })

  if (!user || !user.apartmentId) {
    return {
      apartment: null,
      residence: null,
      charges: { unpaid: 0, paid: 0, total: 0, pendingPayments: [], paidPayments: [] },
      payments: { total: 0, totalAmount: 0, latestPayment: null, recent: [] },
      maintenanceRequests: { open: 0, inProgress: 0, completed: 0, recent: [] }
    }
  }

  const [charges, payments, maintenanceRequests] = await Promise.all([
    prisma.charge.findMany({
      where: { apartmentId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    }),
    prisma.payment.findMany({
      where: { apartmentId },
      orderBy: { paidDate: 'desc' }
    }),
    prisma.maintenanceRequest.findMany({
      where: { apartmentId },
      orderBy: { createdAt: 'desc' }
    })
  ])

  const unpaidCharges = charges.filter(c => {
    const chargePayments = payments.filter(p => p.chargeId === c.id)
    return chargePayments.length === 0 || chargePayments.every(p => p.status !== 'PAID')
  })
  const paidCharges = charges.filter(c => {
    const chargePayments = payments.filter(p => p.chargeId === c.id)
    return chargePayments.some(p => p.status === 'PAID')
  })

  const pendingPayments = unpaidCharges.map(c => ({
    id: c.id,
    title: c.title,
    amount: c.amount,
    dueDate: c.dueDate.toISOString(),
    month: c.month,
    year: c.year
  }))

  const paidPayments = paidCharges.map(c => ({
    id: c.id,
    title: c.title,
    amount: c.amount,
    paidDate: c.dueDate.toISOString(), // Using dueDate as proxy for paidDate
    month: c.month,
    year: c.year
  }))

  const paidTotal = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0)
  const latestPayment = payments.find(p => p.status === 'PAID')

  return {
    apartment: user.apartment ? {
      number: user.apartment.number,
      building: user.apartment.building || '',
      type: user.apartment.type
    } : null,
    residence: user.apartment?.residence ? {
      id: user.apartment.residence.id,
      name: user.apartment.residence.name,
      address: user.apartment.residence.address
    } : null,
    charges: {
      unpaid: unpaidCharges.length,
      paid: paidCharges.length,
      total: charges.length,
      pendingPayments,
      paidPayments
    },
    payments: {
      total: payments.length,
      totalAmount: paidTotal,
      latestPayment: latestPayment ? {
        id: latestPayment.id,
        amount: latestPayment.amount,
        method: latestPayment.method || '',
        paidDate: latestPayment.paidDate?.toISOString() || '',
        chargeTitle: ''
      } : null,
      recent: payments.slice(0, 10).map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        method: p.method || '',
        paidDate: p.paidDate?.toISOString() || null,
        dueDate: p.dueDate.toISOString(),
        chargeTitle: '',
        month: 0,
        year: 0
      }))
    },
    maintenanceRequests: {
      open: maintenanceRequests.filter(r => r.status === 'PENDING').length,
      inProgress: maintenanceRequests.filter(r => r.status === 'IN_PROGRESS').length,
      completed: maintenanceRequests.filter(r => r.status === 'COMPLETED').length,
      recent: maintenanceRequests.slice(0, 5).map(m => ({
        id: m.id,
        title: m.title,
        status: m.status,
        priority: m.priority,
        category: m.category || '',
        createdAt: m.createdAt.toISOString()
      }))
    }
  }
}
