export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get single payment
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER' && session.user.role !== 'RESIDENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    let filter: any = { id }
    
    if (session.user.role === 'ADMIN' && session.user.residenceId) {
      filter = { id, apartment: { residenceId: session.user.residenceId } }
    } else if (session.user.role === 'RESIDENT') {
      // Get user's apartment
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { apartment: true }
      })
      if (user?.apartmentId) {
        filter = { id, apartmentId: user.apartmentId }
      }
    }

    const payment = await prisma.payment.findFirst({
      where: filter,
      include: {
        apartment: {
          include: {
            residence: {
              select: { name: true, city: true }
            }
          }
        },
        charge: true
      }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      dueDate: payment.dueDate.toISOString(),
      paidDate: payment.paidDate?.toISOString() || null,
      notes: payment.notes,
      apartment: payment.apartment ? {
        number: payment.apartment.number,
        building: payment.apartment.building,
        residence: payment.apartment.residence
      } : null,
      charge: payment.charge,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 })
  }
}
