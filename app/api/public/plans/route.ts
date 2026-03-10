import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch visible plans for landing page
export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isVisible: true,
        isActive: true,
        slug: {
          not: 'test' // Exclude test plans
        }
      },
      orderBy: { price: 'asc' }
    })

    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      monthlyPrice: plan.price,
      yearlyPrice: plan.yearlyPrice,
      billingCycle: plan.billingCycle,
      features: plan.features ? JSON.parse(plan.features) : [],
      maxResidences: plan.maxResidences,
      maxAdmins: plan.maxAdmins,
      maxApartments: plan.maxApartments,
      maxResidents: plan.maxResidents,
      hasAdvancedReports: plan.hasAdvancedReports,
      hasPrioritySupport: plan.hasPrioritySupport,
      hasApiAccess: plan.hasApiAccess,
      isPopular: plan.isPopular
    }))

    return NextResponse.json({ plans: formattedPlans })
  } catch (error) {
    console.error('Error fetching public plans:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}
