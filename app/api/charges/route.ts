import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const body = await request.json()
    const { title, category, amount, month, year, apartmentId, description } = body

    if (!title || !amount || !month || !year || !apartmentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const adminResidenceId = session.user.residenceId

    if (!adminResidenceId) {
      return NextResponse.json({ error: 'Residence not found' }, { status: 400 })
    }

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
