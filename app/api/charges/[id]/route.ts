export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get single charge
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER' && session.user.role !== 'RESIDENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Charge ID is required' }, { status: 400 })
    }

    let residenceFilter = {}
    if (session.user.role === 'ADMIN' && session.user.residenceId) {
      residenceFilter = { residenceId: session.user.residenceId }
    } else if (session.user.role === 'RESIDENT') {
      // Get user's apartment
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { apartment: true }
      })
      if (user?.apartmentId) {
        residenceFilter = { apartmentId: user.apartmentId }
      }
    }

    const charge = await prisma.charge.findFirst({
      where: { id, ...residenceFilter },
      include: {
        residence: {
          select: { name: true, city: true }
        },
        apartment: {
          select: { number: true, building: true, type: true }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!charge) {
      return NextResponse.json({ error: 'Charge not found' }, { status: 404 })
    }

    // Calculate totals
    const totalPaid = charge.payments
      .filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0)
    const unpaidAmount = charge.amount - totalPaid

    return NextResponse.json({
      id: charge.id,
      title: charge.title,
      content: charge.description,
      category: charge.category,
      amount: charge.amount,
      month: charge.month,
      year: charge.year,
      dueDate: charge.dueDate.toISOString(),
      residence: charge.residence,
      apartment: charge.apartment,
      payments: charge.payments,
      stats: {
        totalAmount: charge.amount,
        totalPaid,
        unpaidAmount
      },
      createdAt: charge.createdAt.toISOString(),
      updatedAt: charge.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Error fetching charge:', error)
    return NextResponse.json({ error: 'Failed to fetch charge' }, { status: 500 })
  }
}
