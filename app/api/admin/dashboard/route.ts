export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const residenceId = session.user.residenceId

    if (!residenceId) {
      return NextResponse.json({ error: 'Admin residence not assigned. Please contact the owner.' }, { status: 403 })
    }

    // Get the residence info
    const residence = await prisma.residence.findUnique({
      where: { id: residenceId }
    })

    if (!residence) {
      return NextResponse.json({ error: 'Residence not found' }, { status: 404 })
    }

    // Get apartments
    const apartments = await prisma.apartment.findMany({
      where: { residenceId },
      include: {
        residentUser: { select: { id: true, name: true, email: true, phone: true } }
      }
    })

    const totalApartments = apartments.length
    const occupiedApartments = apartments.filter(a => a.status === 'OCCUPIED').length
    const vacantApartments = totalApartments - occupiedApartments
    const occupancyRate = totalApartments > 0 
      ? Math.round((occupiedApartments / totalApartments) * 100) 
      : 0

    // Get residents
    const residents = await prisma.user.findMany({
      where: { role: 'RESIDENT', apartment: { residenceId } },
      select: { id: true, name: true, email: true, phone: true, apartmentId: true }
    })
    const residentsCount = residents.length

    // Get charges and payments
    const charges = await prisma.charge.findMany({
      where: { residenceId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    })

    const payments = await prisma.payment.findMany({
      where: { charge: { residenceId } },
      include: { apartment: true, charge: true }
    })

    const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0)
    const paidPayments = payments.filter(p => p.status === 'PAID')
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
    const unpaidAmount = totalCharges - totalPaid

    // Count unpaid charges
    let unpaidCount = 0
    for (const charge of charges) {
      const chargePayments = payments.filter(p => p.chargeId === charge.id)
      const paidForCharge = chargePayments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0)
      if (paidForCharge < charge.amount) {
        unpaidCount++
      }
    }

    // Get expenses
    const expenses = await prisma.expense.findMany({
      where: { residenceId },
      orderBy: { date: 'desc' }
    })
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

    // Get maintenance requests
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: { residenceId },
      orderBy: { createdAt: 'desc' },
      include: { apartment: true, reportedBy: { select: { name: true } } }
    })

    const openRequests = maintenanceRequests.filter(m => m.status !== 'COMPLETED' && m.status !== 'CANCELLED').length
    const inProgressRequests = maintenanceRequests.filter(m => m.status === 'IN_PROGRESS').length
    const completedRequests = maintenanceRequests.filter(m => m.status === 'COMPLETED').length

    // Get announcements
    const announcements = await prisma.announcement.findMany({
      where: { residenceId, isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { createdBy: { select: { name: true } } }
    })

    // Monthly breakdown (last 6 months)
    const now = new Date()
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      const monthPayments = payments.filter(p => {
        const paidDate = p.paidDate
        return paidDate && paidDate.getMonth() === month && paidDate.getFullYear() === year && p.status === 'PAID'
      })
      const monthRevenue = monthPayments.reduce((sum, p) => sum + p.amount, 0)

      const monthExpenses = expenses.filter(e => {
        const expenseDate = new Date(e.date)
        return expenseDate.getMonth() === month && expenseDate.getFullYear() === year
      }).reduce((sum, e) => sum + e.amount, 0)

      monthlyData.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        revenue: monthRevenue,
        expenses: monthExpenses,
        net: monthRevenue - monthExpenses
      })
    }

    // Recent payments (last 10)
    const recentPayments = await prisma.payment.findMany({
      where: { charge: { residenceId } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { apartment: true, charge: true }
    })

    // Recent maintenance requests (last 10)
    const recentMaintenanceRequests = maintenanceRequests.slice(0, 10)

    // Apartments needing attention (vacant or with issues)
    const apartmentsNeedingAttention = apartments.filter(a => a.status !== 'OCCUPIED')

    return NextResponse.json({
      residence: {
        id: residence.id,
        name: residence.name,
        city: residence.city,
        address: residence.address
      },
      stats: {
        totalApartments,
        occupiedApartments,
        vacantApartments,
        occupancyRate,
        residentsCount,
        totalCharges,
        totalPaid,
        unpaidAmount,
        unpaidCount,
        totalExpenses,
        netRevenue: totalPaid - totalExpenses,
        openRequests,
        inProgressRequests,
        completedRequests,
        monthlyRevenue: totalPaid,
        pendingPayments: unpaidAmount,
        monthlyCollectionRate: totalCharges > 0 ? Math.round((totalPaid / totalCharges) * 100) : 0
      },
      monthlyData,
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        method: p.method,
        paidDate: p.paidDate?.toISOString(),
        dueDate: p.dueDate.toISOString(),
        apartment: p.apartment.number,
        building: p.apartment.building,
        chargeTitle: p.charge.title,
        month: p.charge.month,
        year: p.charge.year
      })),
      recentMaintenanceRequests: recentMaintenanceRequests.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        status: m.status,
        priority: m.priority,
        category: m.category,
        apartment: m.apartment.number,
        building: m.apartment.building,
        reportedBy: m.reportedBy.name,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        resolvedAt: m.resolvedAt?.toISOString()
      })),
      announcements: announcements.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        type: a.type,
        priority: a.priority,
        createdBy: a.createdBy.name,
        createdAt: a.createdAt.toISOString()
      })),
      apartmentsNeedingAttention: apartmentsNeedingAttention.map(a => ({
        id: a.id,
        number: a.number,
        building: a.building,
        floor: a.floor,
        status: a.status,
        type: a.type
      })),
      allApartments: apartments.map(a => ({
        id: a.id,
        number: a.number,
        building: a.building,
        floor: a.floor,
        type: a.type,
        status: a.status,
        rentAmount: a.rentAmount,
        resident: a.residentUser ? {
          name: a.residentUser.name,
          email: a.residentUser.email,
          phone: a.residentUser.phone
        } : null
      }))
    })
  } catch (error) {
    console.error('Error fetching admin dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
