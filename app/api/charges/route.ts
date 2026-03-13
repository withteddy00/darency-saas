import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createChargeSchema } from '@/lib/validations/finance'
import { validateBody } from '@/lib/validations/helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ADMIN must have an assigned residence to access this endpoint
    if (session.user.role === 'ADMIN' && !session.user.residenceId) {
      return NextResponse.json({ error: 'Admin residence not assigned. Please contact the owner.' }, { status: 403 })
    }

    // OWNER sees all residences - no residence filter
    // ADMIN sees only their assigned residence
    let residenceFilter = {}
    if (session.user.role === 'ADMIN' && session.user.residenceId) {
      residenceFilter = { residenceId: session.user.residenceId }
    }

    const charges = await prisma.charge.findMany({
      where: residenceFilter,
      include: {
        apartment: {
          include: {
            residence: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    })

    const formattedCharges = charges.map(charge => ({
      id: charge.id,
      title: charge.title,
      category: charge.category,
      amount: charge.amount,
      month: charge.month,
      year: charge.year,
      dueDate: charge.dueDate.toISOString(),
      apartment: {
        number: charge.apartment.number,
        building: charge.apartment.building,
        residence: {
          name: charge.apartment.residence.name
        }
      },
      createdAt: charge.createdAt
    }))

    return NextResponse.json(formattedCharges)
  } catch (error) {
    console.error('Error fetching charges:', error)
    return NextResponse.json({ error: 'Failed to fetch charges' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ADMIN must have an assigned residence to perform this action
    const adminResidenceId = session.user.residenceId

    if (!adminResidenceId) {
      return NextResponse.json({ error: 'Admin residence not assigned. Please contact the owner.' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate request body with Zod
    const validation = validateBody(createChargeSchema, body)
    if (validation instanceof NextResponse) {
      return validation
    }
    
    const { title, category, amount, month, year, apartmentId, description } = validation

    // Verify the apartment belongs to this admin's residence
    const apartment = await prisma.apartment.findFirst({
      where: {
        id: apartmentId,
        residenceId: adminResidenceId
      }
    })

    if (!apartment) {
      return NextResponse.json({ error: 'Apartment not found in your residence' }, { status: 403 })
    }

    // Calculate due date (end of the month)
    const dueDate = new Date(year, month - 1, 28)

    const chargeData: any = {
      title,
      category: category || 'OTHER',
      amount,
      month,
      year,
      description,
      dueDate,
      residenceId: adminResidenceId,
      apartmentId
    }

    const charge = await prisma.charge.create({
      data: chargeData
    })

    return NextResponse.json(charge)
  } catch (error) {
    console.error('Error creating charge:', error)
    return NextResponse.json({ error: 'Failed to create charge' }, { status: 500 })
  }
}

// PATCH - Update charge
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
    const { id, title, category, amount, month, year, description } = body

    if (!id) {
      return NextResponse.json({ error: 'Charge ID is required' }, { status: 400 })
    }

    // Verify charge belongs to this admin's residence
    const existing = await prisma.charge.findFirst({
      where: { id, residenceId: adminResidenceId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Charge not found in your residence' }, { status: 404 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (category !== undefined) updateData.category = category
    if (amount !== undefined) updateData.amount = amount
    if (month !== undefined) updateData.month = month
    if (year !== undefined) updateData.year = year
    if (description !== undefined) updateData.description = description
    
    if (month !== undefined && year !== undefined) {
      updateData.dueDate = new Date(year, month - 1, 28)
    }

    const charge = await prisma.charge.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(charge)
  } catch (error) {
    console.error('Error updating charge:', error)
    return NextResponse.json({ error: 'Failed to update charge' }, { status: 500 })
  }
}

// DELETE - Delete charge
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
      return NextResponse.json({ error: 'Charge ID is required' }, { status: 400 })
    }

    // Verify charge belongs to this admin's residence
    const existing = await prisma.charge.findFirst({
      where: { id, residenceId: adminResidenceId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Charge not found in your residence' }, { status: 404 })
    }

    // Check if charge has any payments
    const paymentCount = await prisma.payment.count({
      where: { chargeId: id }
    })

    if (paymentCount > 0) {
      return NextResponse.json({ error: 'Cannot delete a charge with associated payments' }, { status: 400 })
    }

    await prisma.charge.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting charge:', error)
    return NextResponse.json({ error: 'Failed to delete charge' }, { status: 500 })
  }
}
