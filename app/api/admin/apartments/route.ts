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

    // Get apartments only for this admin's residence
    const apartments = await prisma.apartment.findMany({
      where: { residenceId },
      include: {
        residentUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        residence: {
          select: {
            name: true,
            city: true
          }
        },
        charges: true,
        payments: true,
        maintenanceRequests: true
      },
      orderBy: [
        { building: 'asc' },
        { floor: 'asc' },
        { number: 'asc' }
      ]
    })

    // Format apartments with additional stats
    const formattedApartments = apartments.map(apartment => {
      const totalCharges = apartment.charges.reduce((sum, c) => sum + c.amount, 0)
      const paidPayments = apartment.payments.filter(p => p.status === 'PAID')
      const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
      const unpaidAmount = totalCharges - totalPaid

      const openRequests = apartment.maintenanceRequests.filter(
        m => m.status !== 'COMPLETED' && m.status !== 'CANCELLED'
      ).length

      return {
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
        residence: apartment.residence,
        resident: apartment.residentUser,
        totalCharges,
        totalPaid,
        unpaidAmount,
        openRequests
      }
    })

    return NextResponse.json(formattedApartments)
  } catch (error) {
    console.error('Error fetching apartments:', error)
    return NextResponse.json({ error: 'Failed to fetch apartments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const { number, floor, building, type, area, bedrooms, bathrooms, rentAmount } = body

    if (!number || !type) {
      return NextResponse.json({ error: 'Number and type are required' }, { status: 400 })
    }

    // Check if apartment number already exists in this residence
    const existing = await prisma.apartment.findFirst({
      where: {
        residenceId,
        number
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Apartment number already exists in this residence' }, { status: 400 })
    }

    const apartment = await prisma.apartment.create({
      data: {
        number,
        floor: floor || null,
        building: building || null,
        type: type || 'T2',
        status: 'VACANT',
        area: area || null,
        bedrooms: bedrooms || 1,
        bathrooms: bathrooms || 1,
        rentAmount: rentAmount || null,
        residenceId
      }
    })

    return NextResponse.json(apartment)
  } catch (error) {
    console.error('Error creating apartment:', error)
    return NextResponse.json({ error: 'Failed to create apartment' }, { status: 500 })
  }
}
