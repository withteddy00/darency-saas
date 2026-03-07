import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        yearlyPrice: true,
        maxResidences: true,
        maxAdmins: true,
        maxApartments: true,
        hasAdvancedReports: true,
        hasPrioritySupport: true,
        hasApiAccess: true,
      }
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}
