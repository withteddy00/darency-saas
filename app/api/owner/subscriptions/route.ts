import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

// GET - List all organizations with subscriptions
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const planId = searchParams.get('planId')

    const where: any = {}
    if (status) where.subscriptionStatus = status
    if (planId) where.planId = planId

    const organizations = await prisma.organization.findMany({
      where,
      include: {
        plan: true,
        subscriptions: {
          orderBy: { startDate: 'desc' },
          take: 1
        },
        residences: {
          select: { id: true, name: true, city: true, status: true }
        },
        _count: { select: { users: true, residences: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate revenue for each organization based on subscription payments
    const orgsWithStats = await Promise.all(organizations.map(async (org) => {
      // Get the current/active subscription
      const activeSubscription = org.subscriptions && org.subscriptions.length > 0 
        ? org.subscriptions[0] 
        : null
      
      // Calculate revenue from subscription payments
      let totalRevenue = 0
      if (activeSubscription) {
        // Get all PAID payments for this subscription
        const subscriptionPayments = await prisma.payment.findMany({
          where: { 
            subscriptionId: activeSubscription.id,
            status: 'PAID'
          }
        })
        totalRevenue = subscriptionPayments.reduce((sum, p) => sum + p.amount, 0)
      }

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        email: org.email,
        city: org.city,
        plan: org.plan ? {
          id: org.plan.id,
          name: org.plan.name,
          price: activeSubscription?.price || org.plan.price,
          billingCycle: activeSubscription?.billingCycle || org.billingCycle || 'MONTHLY'
        } : null,
        subscriptionStatus: activeSubscription?.status || org.subscriptionStatus,
        subscriptionId: activeSubscription?.id || null,
        planStartDate: activeSubscription?.startDate?.toISOString() || org.planStartDate.toISOString(),
        planEndDate: activeSubscription?.endDate?.toISOString() || org.planEndDate?.toISOString(),
        billingCycle: activeSubscription?.billingCycle || org.billingCycle || 'MONTHLY',
        residences: org.residences,
        usersCount: org._count.users,
        residencesCount: org._count.residences,
        totalRevenue,
        createdAt: org.createdAt.toISOString()
      }
    }))

    // Get stats summary
    const [totalActive, totalSuspended, totalCancelled] = await Promise.all([
      prisma.organization.count({ where: { subscriptionStatus: 'ACTIVE' } }),
      prisma.organization.count({ where: { subscriptionStatus: 'SUSPENDED' } }),
      prisma.organization.count({ where: { subscriptionStatus: 'CANCELLED' } })
    ])

    return NextResponse.json({
      subscriptions: orgsWithStats,
      stats: {
        totalActive,
        totalSuspended,
        totalCancelled,
        total: organizations.length
      }
    })
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

// POST - Update subscription (renew, cancel, upgrade, downgrade, suspend)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { organizationId, action, planId, duration } = body

    if (!organizationId || !action) {
      return NextResponse.json({ error: 'Organization ID and action are required' }, { status: 400 })
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true, residences: true }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    let updatedOrg
    let message

    switch (action) {
      case 'renew':
        const renewalDays = duration || 30
        const newEndDate = organization.planEndDate && organization.planEndDate > new Date()
          ? new Date(organization.planEndDate.getTime() + renewalDays * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + renewalDays * 24 * 60 * 60 * 1000)

        updatedOrg = await prisma.organization.update({
          where: { id: organizationId },
          data: {
            subscriptionStatus: 'ACTIVE',
            planStartDate: new Date(),
            planEndDate: newEndDate
          }
        })
        message = `Subscription renewed for ${renewalDays} days`

        await logActivity({
          action: 'RENEW',
          target: 'Organization',
          targetId: organizationId,
          description: `Renewed subscription for "${organization.name}" until ${newEndDate.toLocaleDateString()}`,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role,
          organizationId
        })
        break

      case 'cancel':
        updatedOrg = await prisma.organization.update({
          where: { id: organizationId },
          data: { subscriptionStatus: 'CANCELLED' }
        })
        message = 'Subscription cancelled'

        await logActivity({
          action: 'CANCEL',
          target: 'Organization',
          targetId: organizationId,
          description: `Cancelled subscription for "${organization.name}"`,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role,
          organizationId
        })
        break

      case 'suspend':
        updatedOrg = await prisma.organization.update({
          where: { id: organizationId },
          data: { subscriptionStatus: 'SUSPENDED' }
        })
        message = 'Subscription suspended'

        await logActivity({
          action: 'SUSPEND',
          target: 'Organization',
          targetId: organizationId,
          description: `Suspended subscription for "${organization.name}"`,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role,
          organizationId
        })
        break

      case 'reactivate':
        updatedOrg = await prisma.organization.update({
          where: { id: organizationId },
          data: { subscriptionStatus: 'ACTIVE' }
        })
        message = 'Subscription reactivated'

        await logActivity({
          action: 'REACTIVATE',
          target: 'Organization',
          targetId: organizationId,
          description: `Reactivated subscription for "${organization.name}"`,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role,
          organizationId
        })
        break

      case 'upgrade':
      case 'downgrade':
        if (!planId) {
          return NextResponse.json({ error: 'New plan ID is required for upgrade/downgrade' }, { status: 400 })
        }

        const newPlan = await prisma.subscriptionPlan.findUnique({
          where: { id: planId }
        })

        if (!newPlan) {
          return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
        }

        updatedOrg = await prisma.organization.update({
          where: { id: organizationId },
          data: {
            planId,
            subscriptionStatus: 'ACTIVE',
            planStartDate: new Date()
          }
        })
        message = `Subscription ${action === 'upgrade' ? 'upgraded' : 'downgraded'} to ${newPlan.name}`

        await logActivity({
          action: action.toUpperCase(),
          target: 'Organization',
          targetId: organizationId,
          description: `${action === 'upgrade' ? 'Upgraded' : 'Downgraded'} subscription for "${organization.name}" from ${organization.plan?.name || 'None'} to ${newPlan.name}`,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role,
          organizationId
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message,
      subscription: {
        id: updatedOrg.id,
        status: updatedOrg.subscriptionStatus,
        planEndDate: updatedOrg.planEndDate?.toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}
