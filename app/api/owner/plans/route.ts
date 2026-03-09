import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

// GET - List all plans
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' }
    })

    // Get subscription count for each plan
    const plansWithCount = await Promise.all(plans.map(async (plan) => {
      const activeCount = await prisma.organization.count({
        where: { planId: plan.id, subscriptionStatus: 'ACTIVE' }
      })

      return {
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        price: plan.price,
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
        isActive: plan.isActive,
        isVisible: plan.isVisible,
        isPopular: plan.isPopular,
        activeSubscriptions: activeCount,
        createdAt: plan.createdAt.toISOString(),
        updatedAt: plan.updatedAt.toISOString()
      }
    }))

    return NextResponse.json({ plans: plansWithCount })
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}

// POST - Create a new plan
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      slug, 
      description, 
      price, 
      yearlyPrice, 
      billingCycle,
      features,
      maxResidences,
      maxAdmins,
      maxApartments,
      maxResidents,
      hasAdvancedReports,
      hasPrioritySupport,
      hasApiAccess,
      isVisible,
      isPopular
    } = body

    if (!name || !slug || price === undefined) {
      return NextResponse.json({ error: 'Name, slug, and price are required' }, { status: 400 })
    }

    // Check if slug already exists
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { slug }
    })

    if (existingPlan) {
      return NextResponse.json({ error: 'A plan with this slug already exists' }, { status: 400 })
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        yearlyPrice: yearlyPrice ? parseFloat(yearlyPrice) : null,
        billingCycle: billingCycle || 'MONTHLY',
        features: JSON.stringify(features || []),
        maxResidences: maxResidences || 1,
        maxAdmins: maxAdmins || 1,
        maxApartments: maxApartments || 50,
        maxResidents: maxResidents || 100,
        hasAdvancedReports: hasAdvancedReports || false,
        hasPrioritySupport: hasPrioritySupport || false,
        hasApiAccess: hasApiAccess || false,
        isActive: true,
        isVisible: isVisible !== false,
        isPopular: isPopular || false
      }
    })

    // Log activity
    await logActivity({
      action: 'CREATE',
      target: 'SubscriptionPlan',
      targetId: plan.id,
      description: `Created new subscription plan "${plan.name}"`,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role
    })

    return NextResponse.json({
      success: true,
      plan: {
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        price: plan.price
      }
    })
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}

// PUT - Update a plan
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, ...updateData } = body

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // If updating slug, check uniqueness
    if (updateData.slug && updateData.slug !== existingPlan.slug) {
      const slugExists = await prisma.subscriptionPlan.findUnique({
        where: { slug: updateData.slug }
      })
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 400 })
      }
    }

    const dataToUpdate: any = { ...updateData }
    if (updateData.price !== undefined) dataToUpdate.price = parseFloat(updateData.price)
    if (updateData.yearlyPrice !== undefined) dataToUpdate.yearlyPrice = updateData.yearlyPrice ? parseFloat(updateData.yearlyPrice) : null
    if (updateData.features !== undefined) dataToUpdate.features = JSON.stringify(updateData.features)
    if (updateData.maxResidences !== undefined) dataToUpdate.maxResidences = parseInt(updateData.maxResidences)
    if (updateData.maxAdmins !== undefined) dataToUpdate.maxAdmins = parseInt(updateData.maxAdmins)
    if (updateData.maxApartments !== undefined) dataToUpdate.maxApartments = parseInt(updateData.maxApartments)
    if (updateData.maxResidents !== undefined) dataToUpdate.maxResidents = parseInt(updateData.maxResidents)

    const plan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: dataToUpdate
    })

    // Log activity
    await logActivity({
      action: 'UPDATE',
      target: 'SubscriptionPlan',
      targetId: plan.id,
      description: `Updated subscription plan "${plan.name}"`,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role
    })

    return NextResponse.json({
      success: true,
      plan: {
        id: plan.id,
        name: plan.name,
        isVisible: plan.isVisible,
        isPopular: plan.isPopular,
        isActive: plan.isActive
      }
    })
  } catch (error) {
    console.error('Error updating plan:', error)
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
  }
}

// DELETE - Delete a plan
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('planId')

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await prisma.organization.count({
      where: { planId, subscriptionStatus: 'ACTIVE' }
    })

    if (activeSubscriptions > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete plan with active subscriptions. Deactivate it instead.' 
      }, { status: 400 })
    }

    await prisma.subscriptionPlan.delete({
      where: { id: planId }
    })

    // Log activity
    await logActivity({
      action: 'DELETE',
      target: 'SubscriptionPlan',
      targetId: planId,
      description: `Deleted subscription plan "${existingPlan.name}"`,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role
    })

    return NextResponse.json({ success: true, message: 'Plan deleted' })
  } catch (error) {
    console.error('Error deleting plan:', error)
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
  }
}
