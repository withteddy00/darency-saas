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

    // Get residence filter based on role
    let residenceFilter = {}
    if (session.user.role === 'ADMIN' && session.user.residenceId) {
      residenceFilter = { residenceId: session.user.residenceId }
    } else if (session.user.role === 'OWNER') {
      // OWNER sees all - no filter
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const expenses = await prisma.expense.findMany({
      where: residenceFilter,
      include: {
        residence: {
          select: {
            name: true,
            city: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date.toISOString(),
      residence: expense.residence,
      createdAt: expense.createdAt
    }))

    return NextResponse.json(formattedExpenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
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
    const { description, amount, category, date } = body

    if (!description || !amount || !category || !date) {
      return NextResponse.json({ error: 'Description, amount, category and date are required' }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        description,
        amount,
        category,
        date: new Date(date),
        residenceId: adminResidenceId
      }
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}

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
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 })
    }

    // Verify expense belongs to this admin's residence
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        residenceId: adminResidenceId
      }
    })

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found in your residence' }, { status: 404 })
    }

    await prisma.expense.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
