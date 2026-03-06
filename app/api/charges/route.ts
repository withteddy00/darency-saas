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

    // Get admin's residence ID
    const residenceId = session.user.residenceId

    const charges = await prisma.charge.findMany({
      where: {
        residenceId
      },
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

    const residenceId = session.user.residenceId

    if (!residenceId) {
      return NextResponse.json({ error: 'Residence not found' }, { status: 400 })
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
      residenceId,
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
