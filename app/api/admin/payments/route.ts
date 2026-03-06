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

    // ADMIN must have an assigned residence to access this endpoint
    if (session.user.role === 'ADMIN' && !session.user.residenceId) {
      return NextResponse.json({ error: 'Admin residence not assigned. Please contact the owner.' }, { status: 403 })
    }

    // Get admin's residence ID
    const residenceId = session.user.residenceId

    const payments = await prisma.payment.findMany({
      where: {
        apartment: {
          residenceId
        }
      },
      include: {
        apartment: {
          select: {
            number: true,
            building: true,
            type: true
          }
        },
        charge: {
          select: {
            title: true,
            month: true,
            year: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      paidDate: payment.paidDate,
      dueDate: payment.dueDate,
      apartment: payment.apartment,
      charge: payment.charge,
      createdAt: payment.createdAt
    }))

    return NextResponse.json(formattedPayments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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
    const { chargeId, amount, paidDate } = body

    if (!chargeId || !amount) {
      return NextResponse.json({ error: 'Charge ID and amount are required' }, { status: 400 })
    }

    // Verify the charge belongs to this admin's residence
    const charge = await prisma.charge.findFirst({
      where: {
        id: chargeId,
        residenceId: adminResidenceId
      }
    })

    if (!charge) {
      return NextResponse.json({ error: 'Charge not found in your residence' }, { status: 404 })
    }

    // Get the apartment from the charge
    const apartmentId = charge.apartmentId

    const payment = await prisma.payment.create({
      data: {
        amount,
        status: 'PAID',
        paidDate: paidDate ? new Date(paidDate) : new Date(),
        dueDate: charge.dueDate,
        chargeId,
        apartmentId
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
