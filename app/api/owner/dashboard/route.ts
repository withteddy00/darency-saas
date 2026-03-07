export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

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
      where: { organizationId },
      include: {
        apartments: true,
        adminUsers: true,
        charges: true,
        maintenanceRequests: true,
      }
    })

    // Calculate statistics from database
    const totalResidences = residences.length
    
    const totalApartments = residences.reduce((sum, r) => sum + r.apartments.length, 0)
    const occupiedApartments = residences.reduce(
      (sum, r) => sum + r.apartments.filter(a => a.status === 'OCCUPIED').length, 
      0
    )
    const vacantApartments = totalApartments - occupiedApartments
    const occupancyRate = totalApartments > 0 
      ? Math.round((occupiedApartments / totalApartments) * 100) 
      : 0

    // Count admins (users with role ADMIN)
    const totalAdmins = await prisma.user.count({
      where: { 
        role: 'ADMIN',
        organizationId 
      }
    })

    // Count residents (users with role RESIDENT)
    const totalResidents = await prisma.user.count({
      where: { 
        role: 'RESIDENT',
        organizationId 
      }
    })

    // Calculate unpaid charges (charges without full payment)
    const allCharges = residences.flatMap(r => r.charges)
    const allPayments = await prisma.payment.findMany({
      where: {
        charge: {
          residenceId: { in: residences.map(r => r.id) }
        }
      }
    })

    let unpaidChargesTotal = 0
    for (const charge of allCharges) {
      const chargePayments = allPayments.filter(p => p.chargeId === charge.id)
      const paidAmount = chargePayments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0)
      if (paidAmount < charge.amount) {
        unpaidChargesTotal += (charge.amount - paidAmount)
      }
    }

    // Count open maintenance requests
    const openMaintenanceRequests = residences.reduce(
      (sum, r) => sum + r.maintenanceRequests.filter(m => m.status !== 'COMPLETED' && m.status !== 'CANCELLED').length,
      0
    )

    // Get recent activity (recent payments and maintenance requests)
    const recentPayments = await prisma.payment.findMany({
      where: {
        status: 'PAID',
        apartment: {
          residence: {
            organizationId
          }
        }
      },
      orderBy: { paidDate: 'desc' },
      take: 5,
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

    const recentMaintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        residence: {
          organizationId
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        apartment: true,
        residence: {
          select: { name: true }
        }
      }
    })

    // Format residence stats for top residences
    const residenceStats = await Promise.all(residences.map(async (residence) => {
      const apartments = await prisma.apartment.findMany({
        where: { residenceId: residence.id }
      })
      
      const residentCount = await prisma.user.count({
        where: {
          role: 'RESIDENT',
          apartment: {
            residenceId: residence.id
          }
        }
      })

      const charges = await prisma.charge.findMany({
        where: { residenceId: residence.id }
      })

      const payments = await prisma.payment.findMany({
        where: {
          charge: { residenceId: residence.id }
        }
      })

      let revenue = 0
      for (const charge of charges) {
        const chargePayments = payments.filter(p => p.chargeId === charge.id && p.status === 'PAID')
        revenue += chargePayments.reduce((sum, p) => sum + p.amount, 0)
      }

      return {
        id: residence.id,
        name: residence.name,
        city: residence.city,
        units: apartments.length,
        occupancy: apartments.length > 0 
          ? Math.round((apartments.filter(a => a.status === 'OCCUPIED').length / apartments.length) * 100)
          : 0,
        revenue,
        residents: residentCount
      }
    }))

    // Sort by revenue
    residenceStats.sort((a, b) => b.revenue - a.revenue)

    return NextResponse.json({
      stats: {
        totalResidences,
        totalApartments,
        occupiedApartments,
        vacantApartments,
        occupancyRate,
        totalAdmins,
        totalResidents,
        unpaidCharges: unpaidChargesTotal,
        openMaintenanceRequests
      },
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        paidDate: p.paidDate?.toISOString(),
        apartment: p.apartment.number,
        residence: p.apartment.residence.name
      })),
      recentMaintenanceRequests: recentMaintenanceRequests.map(m => ({
        id: m.id,
        title: m.title,
        status: m.status,
        priority: m.priority,
        apartment: m.apartment.number,
        residence: m.residence.name,
        createdAt: m.createdAt.toISOString()
      })),
      topResidences: residenceStats.slice(0, 5)
    })
  } catch (error) {
    console.error('Error fetching owner dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
