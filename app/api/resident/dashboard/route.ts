import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'RESIDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's apartment
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        apartment: true
      }
    })

    if (!user || !user.apartmentId) {
      return NextResponse.json({ 
        charges: { unpaid: 0, paid: 0, total: 0 },
        payments: { total: 0, latestPayment: null },
        maintenanceRequests: { open: 0, inProgress: 0, completed: 0 }
      })
    }

    // Get charges for this apartment
    const charges = await prisma.charge.findMany({
      where: { apartmentId: user.apartmentId }
    })

    const payments = await prisma.payment.findMany({
      where: { apartmentId: user.apartmentId },
      orderBy: { paidDate: 'desc' }
    })

    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: { apartmentId: user.apartmentId }
    })

    // Calculate unpaid charges
    const unpaidCharges = charges.filter(c => {
      const chargePayments = payments.filter(p => p.chargeId === c.id)
      return chargePayments.every(p => p.status !== 'PAID')
    })
    const unpaidTotal = unpaidCharges.reduce((sum, c) => sum + c.amount, 0)

    const paidTotal = payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0)

    const latestPayment = payments
      .filter(p => p.status === 'PAID' && p.paidDate)
      .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())[0]

    return NextResponse.json({
      apartment: user.apartment ? {
        id: user.apartment.id,
        number: user.apartment.number,
        building: user.apartment.building,
        floor: user.apartment.floor,
        type: user.apartment.type,
        area: user.apartment.area
      } : null,
      charges: {
        unpaid: unpaidTotal,
        paid: paidTotal,
        total: charges.reduce((sum, c) => sum + c.amount, 0)
      },
      payments: {
        total: payments.length,
        latestPayment: latestPayment ? {
          amount: latestPayment.amount,
          paidDate: latestPayment.paidDate!.toISOString()
        } : null,
        recent: payments.slice(0, 5).map(p => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          paidDate: p.paidDate?.toISOString()
        }))
      },
      maintenanceRequests: {
        open: maintenanceRequests.filter(r => r.status === 'PENDING').length,
        inProgress: maintenanceRequests.filter(r => r.status === 'IN_PROGRESS').length,
        completed: maintenanceRequests.filter(r => r.status === 'COMPLETED').length,
        recent: maintenanceRequests.slice(0, 5).map(r => ({
          id: r.id,
          title: r.title,
          status: r.status,
          priority: r.priority,
          createdAt: r.createdAt.toISOString()
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching resident dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
