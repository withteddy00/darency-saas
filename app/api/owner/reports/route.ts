export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'



export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization ID from session
    const organizationId = session.user.organizationId

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
    }

    // Get all residences for this organization
    const residences = await prisma.residence.findMany({
      where: { organizationId }
    })
    const residenceIds = residences.map(r => r.id)

    // Get all apartments
    const apartments = await prisma.apartment.findMany({
      where: { residenceId: { in: residenceIds } }
    })

    const totalApartments = apartments.length
    const occupiedApartments = apartments.filter(a => a.status === 'OCCUPIED').length
    const vacantApartments = totalApartments - occupiedApartments
    const occupancyRate = totalApartments > 0 
      ? Math.round((occupiedApartments / totalApartments) * 100) 
      : 0

    // Calculate revenue (sum of all PAID payments)
    const payments = await prisma.payment.findMany({
      where: {
        status: 'PAID',
        apartment: {
          residenceId: { in: residenceIds }
        }
      }
    })
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

    // Calculate expenses (sum of all charges that are marked as expenses)
    // For now, we'll use all charges as expenses since there's no separate expense tracking
    const charges = await prisma.charge.findMany({
      where: { residenceId: { in: residenceIds } }
    })
    const totalExpenses = charges.reduce((sum, c) => sum + c.amount, 0)

    // Calculate profit
    const profit = totalRevenue - totalExpenses

    // Get monthly data for the last 12 months
    const now = new Date()
    const monthlyData = []

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      // Get payments for this month
      const monthPayments = await prisma.payment.findMany({
        where: {
          status: 'PAID',
          paidDate: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1)
          },
          apartment: {
            residenceId: { in: residenceIds }
          }
        }
      })
      const monthRevenue = monthPayments.reduce((sum, p) => sum + p.amount, 0)

      // Get charges for this month
      const monthCharges = await prisma.charge.findMany({
        where: {
          month,
          year,
          residenceId: { in: residenceIds }
        }
      })
      const monthExpenses = monthCharges.reduce((sum, c) => sum + c.amount, 0)

      monthlyData.push({
        month,
        year,
        label: `${year}-${month.toString().padStart(2, '0')}`,
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses
      })
    }

    // Get residence breakdown
    const residenceBreakdown = await Promise.all(residences.map(async (residence) => {
      const residenceApartments = await prisma.apartment.findMany({
        where: { residenceId: residence.id }
      })

      const residencePayments = await prisma.payment.findMany({
        where: {
          status: 'PAID',
          charge: { residenceId: residence.id }
        }
      })
      const residenceRevenue = residencePayments.reduce((sum, p) => sum + p.amount, 0)

      const residenceCharges = await prisma.charge.findMany({
        where: { residenceId: residence.id }
      })
      const residenceExpenses = residenceCharges.reduce((sum, c) => sum + c.amount, 0)

      return {
        id: residence.id,
        name: residence.name,
        city: residence.city,
        apartments: residenceApartments.length,
        occupied: residenceApartments.filter(a => a.status === 'OCCUPIED').length,
        revenue: residenceRevenue,
        expenses: residenceExpenses,
        profit: residenceRevenue - residenceExpenses,
        occupancyRate: residenceApartments.length > 0
          ? Math.round((residenceApartments.filter(a => a.status === 'OCCUPIED').length / residenceApartments.length) * 100)
          : 0
      }
    }))

    // Sort by revenue
    residenceBreakdown.sort((a, b) => b.revenue - a.revenue)

    // Get recent transactions
    const recentPayments = await prisma.payment.findMany({
      where: {
        status: 'PAID',
        apartment: {
          residenceId: { in: residenceIds }
        }
      },
      orderBy: { paidDate: 'desc' },
      take: 10,
      include: {
        apartment: {
          include: {
            residence: {
              select: { name: true }
            }
          }
        }
      }
    })

    // Get resident count
    const totalResidents = await prisma.user.count({
      where: { 
        role: 'RESIDENT',
        organizationId 
      }
    })

    // Get open maintenance requests count
    const openRequests = await prisma.maintenanceRequest.count({
      where: {
        residence: { organizationId },
        status: { notIn: ['COMPLETED', 'CANCELLED'] }
      }
    })

    return NextResponse.json({
      summary: {
        totalResidences: residences.length,
        totalApartments,
        occupiedApartments,
        vacantApartments,
        occupancyRate,
        totalRevenue,
        totalExpenses,
        profit,
        totalResidents,
        openRequests
      },
      monthlyData,
      residenceBreakdown,
      recentTransactions: recentPayments.map(p => ({
        id: p.id,
        type: 'payment',
        amount: p.amount,
        date: p.paidDate?.toISOString(),
        description: `Payment - ${p.apartment?.number || 'N/A'} - ${p.apartment?.residence?.name || 'N/A'}`
      }))
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
