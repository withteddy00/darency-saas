export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'RESIDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        apartment: {
          include: {
            residence: true
          }
        }
      }
    })

    if (!user || !user.apartmentId) {
      return NextResponse.json({ 
        apartment: null,
        residence: null,
        charges: { unpaid: 0, paid: 0, total: 0, pendingPayments: [], paidPayments: [] },
        payments: { total: 0, latestPayment: null, recent: [] },
        maintenanceRequests: { open: 0, inProgress: 0, completed: 0, recent: [] },
        announcements: [],
        documents: [],
        monthlyPayments: []
      })
    }

    const apartment = user.apartment!
    const residence = apartment.residence

    // Get all charges for this apartment with payment status
    const charges = await prisma.charge.findMany({
      where: { apartmentId: apartment.id },
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    })

    const payments = await prisma.payment.findMany({
      where: { apartmentId: apartment.id },
      include: { charge: true },
      orderBy: { createdAt: 'desc' }
    })

    // Separate pending and paid charges
    const pendingCharges: any[] = []
    const paidCharges: any[] = []

    for (const charge of charges) {
      const chargePayments = payments.filter(p => p.chargeId === charge.id && p.status === 'PAID')
      const paidAmount = chargePayments.reduce((sum, p) => sum + p.amount, 0)
      
      const chargeData = {
        id: charge.id,
        title: charge.title,
        category: charge.category,
        amount: charge.amount,
        month: charge.month,
        year: charge.year,
        dueDate: charge.dueDate.toISOString(),
        paidAmount,
        status: paidAmount >= charge.amount ? 'PAID' : 'PENDING'
      }

      if (paidAmount >= charge.amount) {
        paidCharges.push(chargeData)
      } else {
        pendingCharges.push(chargeData)
      }
    }

    const unpaidTotal = pendingCharges.reduce((sum, c) => sum + (c.amount - c.paidAmount), 0)
    const paidTotal = paidCharges.reduce((sum, c) => sum + c.amount, 0)

    const latestPayment = payments
      .filter(p => p.status === 'PAID' && p.paidDate)
      .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())[0]

    // Get maintenance requests
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: { apartmentId: apartment.id },
      orderBy: { createdAt: 'desc' }
    })

    // Get announcements for the residence
    const now = new Date()
    const announcements = await prisma.announcement.findMany({
      where: {
        residenceId: residence.id,
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      include: { createdBy: { select: { name: true } } }
    })

    // Get documents for the residence (shared)
    const documents = await prisma.document.findMany({
      where: { residenceId: residence.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Monthly payment history
    const monthlyPayments = []
    const nowDate = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(nowDate.getFullYear(), nowDate.getMonth() - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      const monthPayments = payments.filter(p => {
        const paidDate = p.paidDate
        return paidDate && paidDate.getMonth() === month && paidDate.getFullYear() === year && p.status === 'PAID'
      })

      monthlyPayments.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        amount: monthPayments.reduce((sum, p) => sum + p.amount, 0)
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      apartment: {
        id: apartment.id,
        number: apartment.number,
        building: apartment.building,
        floor: apartment.floor,
        type: apartment.type,
        area: apartment.area,
        status: apartment.status,
        rentAmount: apartment.rentAmount
      },
      residence: {
        id: residence.id,
        name: residence.name,
        city: residence.city,
        address: residence.address,
        contactPhone: residence.contactPhone,
        email: residence.email
      },
      charges: {
        unpaid: unpaidTotal,
        paid: paidTotal,
        total: charges.reduce((sum, c) => sum + c.amount, 0),
        pendingPayments: pendingCharges,
        paidPayments: paidCharges
      },
      payments: {
        total: payments.length,
        totalAmount: paidTotal,
        latestPayment: latestPayment ? {
          id: latestPayment.id,
          amount: latestPayment.amount,
          method: latestPayment.method,
          paidDate: latestPayment.paidDate!.toISOString(),
          chargeTitle: latestPayment.charge?.title ?? "N/A"
        } : null,
        recent: payments.slice(0, 10).map(p => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          method: p.method,
          paidDate: p.paidDate?.toISOString(),
          dueDate: p.dueDate.toISOString(),
          chargeTitle: p.charge?.title ?? "N/A",
          month: p.charge?.month ?? 0,
          year: p.charge?.year ?? 0
        }))
      },
      monthlyPayments,
      maintenanceRequests: {
        open: maintenanceRequests.filter(r => r.status === 'PENDING').length,
        inProgress: maintenanceRequests.filter(r => r.status === 'IN_PROGRESS').length,
        completed: maintenanceRequests.filter(r => r.status === 'COMPLETED').length,
        recent: maintenanceRequests.slice(0, 5).map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
          status: r.status,
          priority: r.priority,
          category: r.category,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          resolvedAt: r.resolvedAt?.toISOString()
        }))
      },
      announcements: announcements.map(a => ({
        id: a.id,
        title: a.title,
        content: a.content,
        type: a.type,
        priority: a.priority,
        createdBy: a.createdBy.name,
        createdAt: a.createdAt.toISOString()
      })),
      documents: documents.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type,
        fileUrl: d.fileUrl,
        createdAt: d.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching resident dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
