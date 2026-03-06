import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ADMIN must have an assigned residence
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

    // Get apartments for this residence
    const apartments = await prisma.apartment.findMany({
      where: { residenceId }
    })

    const totalApartments = apartments.length
    const occupiedApartments = apartments.filter(a => a.status === 'OCCUPIED').length
    const vacantApartments = totalApartments - occupiedApartments
    const occupancyRate = totalApartments > 0 
      ? Math.round((occupiedApartments / totalApartments) * 100) 
      : 0

    // Get residents count
    const residentsCount = await prisma.user.count({
      where: {
        role: 'RESIDENT',
        apartment: {
          residenceId: residenceId
        }
      }
    })

    // Get charges and payments
    const charges = await prisma.charge.findMany({
      where: { residenceId }
    })

    const payments = await prisma.payment.findMany({
      where: {
        charge: { residenceId }
      }
    })

    // Calculate totals
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

    // Get maintenance requests
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: { residenceId }
    })

    const openRequests = maintenanceRequests.filter(
      m => m.status !== 'COMPLETED' && m.status !== 'CANCELLED'
    ).length
    const inProgressRequests = maintenanceRequests.filter(m => m.status === 'IN_PROGRESS').length
    const completedRequests = maintenanceRequests.filter(m => m.status === 'COMPLETED').length

    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      where: {
        status: 'PAID',
        charge: { residenceId }
      },
      orderBy: { paidDate: 'desc' },
      take: 5,
      include: {
        apartment: true
      }
    })

    // Get recent maintenance requests
    const recentMaintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: { residenceId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        apartment: true
      }
    })

    return NextResponse.json({
      residence: {
        id: residence.id,
        name: residence.name,
        city: residence.city
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
        openRequests,
        inProgressRequests,
        completedRequests
      },
      recentPayments: recentPayments.map(p => ({
        id: p.id,
        amount: p.amount,
        paidDate: p.paidDate?.toISOString(),
        apartment: p.apartment.number
      })),
      recentMaintenanceRequests: recentMaintenanceRequests.map(m => ({
        id: m.id,
        title: m.title,
        status: m.status,
        priority: m.priority,
        apartment: m.apartment.number,
        createdAt: m.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching admin dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
