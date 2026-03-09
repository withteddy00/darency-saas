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

// PATCH - Update apartment
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminResidenceId = session.user.residenceId
    if (!adminResidenceId) {
      return NextResponse.json({ error: 'Admin residence not assigned' }, { status: 403 })
    }

    const body = await request.json()
    const { id, number, floor, building, type, area, bedrooms, bathrooms, rentAmount, status, occupancyType, currentOccupantName, currentOccupantPhone, moveInDate, moveOutDate } = body

    if (!id) {
      return NextResponse.json({ error: 'Apartment ID is required' }, { status: 400 })
    }

    // Verify apartment belongs to this admin's residence
    const existing = await prisma.apartment.findFirst({
      where: { id, residenceId: adminResidenceId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Apartment not found in your residence' }, { status: 404 })
    }

    const updateData: any = {}
    if (number !== undefined) updateData.number = number
    if (floor !== undefined) updateData.floor = floor
    if (building !== undefined) updateData.building = building
    if (type !== undefined) updateData.type = type
    if (area !== undefined) updateData.area = area
    if (bedrooms !== undefined) updateData.bedrooms = bedrooms
    if (bathrooms !== undefined) updateData.bathrooms = bathrooms
    if (rentAmount !== undefined) updateData.rentAmount = rentAmount
    if (status !== undefined) updateData.status = status
    if (occupancyType !== undefined) updateData.occupancyType = occupancyType
    if (currentOccupantName !== undefined) updateData.currentOccupantName = currentOccupantName
    if (currentOccupantPhone !== undefined) updateData.currentOccupantPhone = currentOccupantPhone
    if (moveInDate !== undefined) updateData.moveInDate = moveInDate ? new Date(moveInDate) : null
    if (moveOutDate !== undefined) updateData.moveOutDate = moveOutDate ? new Date(moveOutDate) : null

    const apartment = await prisma.apartment.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(apartment)
  } catch (error) {
    console.error('Error updating apartment:', error)
    return NextResponse.json({ error: 'Failed to update apartment' }, { status: 500 })
  }
}

// DELETE - Delete apartment
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminResidenceId = session.user.residenceId
    if (!adminResidenceId) {
      return NextResponse.json({ error: 'Admin residence not assigned' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Apartment ID is required' }, { status: 400 })
    }

    // Verify apartment belongs to this admin's residence
    const existing = await prisma.apartment.findFirst({
      where: { id, residenceId: adminResidenceId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Apartment not found in your residence' }, { status: 404 })
    }

    // Check if apartment is occupied
    if (existing.status === 'OCCUPIED') {
      return NextResponse.json({ error: 'Cannot delete an occupied apartment. Please vacate the resident first.' }, { status: 400 })
    }

    // Check for pending charges
    const pendingCharges = await prisma.charge.count({
      where: { apartmentId: id }
    })

    if (pendingCharges > 0) {
      return NextResponse.json({ error: 'Cannot delete apartment with existing charges' }, { status: 400 })
    }

    await prisma.apartment.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting apartment:', error)
    return NextResponse.json({ error: 'Failed to delete apartment' }, { status: 500 })
  }
}
