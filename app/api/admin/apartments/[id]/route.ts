export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get single apartment
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Apartment ID is required' }, { status: 400 })
    }

    let residenceFilter = {}
    if (session.user.role === 'ADMIN' && session.user.residenceId) {
      residenceFilter = { residenceId: session.user.residenceId }
    }

    const apartment = await prisma.apartment.findFirst({
      where: { id, ...residenceFilter },
      include: {
        residence: {
          select: { name: true, city: true }
        },
        residentUser: {
          select: { id: true, name: true, email: true, phone: true }
        },
        charges: {
          orderBy: { createdAt: 'desc' },
          take: 12
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        maintenanceRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        occupancyHistory: {
          orderBy: { moveInDate: 'desc' }
        }
      }
    })

    if (!apartment) {
      return NextResponse.json({ error: 'Apartment not found' }, { status: 404 })
    }

    // Calculate totals
    const totalCharges = apartment.charges.reduce((sum, c) => sum + c.amount, 0)
    const paidPayments = apartment.payments.filter(p => p.status === 'PAID')
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
    const unpaidAmount = totalCharges - totalPaid

    return NextResponse.json({
      id: apartment.id,
      number: apartment.number,
      floor: apartment.floor,
      building: apartment.building,
      type: apartment.type,
      status: apartment.status,
      area: apartment.area,
      bedrooms: apartment.bedrooms,
      bathrooms: apartment.bathrooms,
      rentAmount: apartment.rentAmount,
      occupancyType: apartment.occupancyType,
      currentOccupantName: apartment.currentOccupantName,
      currentOccupantPhone: apartment.currentOccupantPhone,
      moveInDate: apartment.moveInDate?.toISOString() || null,
      moveOutDate: apartment.moveOutDate?.toISOString() || null,
      residence: apartment.residence,
      resident: apartment.residentUser,
      charges: apartment.charges,
      payments: apartment.payments,
      maintenanceRequests: apartment.maintenanceRequests,
      occupancyHistory: apartment.occupancyHistory,
      stats: {
        totalCharges,
        totalPaid,
        unpaidAmount
      }
    })
  } catch (error) {
    console.error('Error fetching apartment:', error)
    return NextResponse.json({ error: 'Failed to fetch apartment' }, { status: 500 })
  }
}
