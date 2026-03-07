import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptions = await prisma.subscriptionRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        plan: {
          select: {
            name: true,
            price: true,
          }
        }
      }
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}
