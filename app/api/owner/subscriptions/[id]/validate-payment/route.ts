import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

// POST - Validate payment for a subscription (mark as paid)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptionId = params.id
    const body = await request.json()
    const { amount, method = 'TRANSFER', notes } = body

    // Find the subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        organization: true,
        plan: true
      }
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.status === 'ACTIVE') {
      return NextResponse.json({ error: 'Subscription is already active' }, { status: 400 })
    }

    // Validate amount matches subscription price
    const expectedAmount = subscription.price
    if (amount && amount !== expectedAmount) {
      return NextResponse.json({ 
        error: `Amount must be ${expectedAmount} for ${subscription.billingCycle.toLowerCase()}ly billing` 
      }, { status: 400 })
    }

    // Use subscription price if not provided
    const paymentAmount = amount || subscription.price

    // Create payment record and update subscription in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.payment.create({
        data: {
          amount: paymentAmount,
          status: 'PAID',
          method: method,
          paidDate: new Date(),
          dueDate: new Date(),
          subscriptionId: subscription.id,
          notes: notes || `Payment for ${subscription.billingCycle.toLowerCase()}ly subscription`
        }
      })

      // Update subscription status to ACTIVE
      const updatedSubscription = await tx.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'ACTIVE'
        }
      })

      // Update organization subscription status
      await tx.organization.update({
        where: { id: subscription.organizationId },
        data: {
          subscriptionStatus: 'ACTIVE'
        }
      })

      return { payment, subscription: updatedSubscription }
    })

    // Log activity
    await logActivity({
      action: 'PAYMENT_VALIDATED',
      target: 'Subscription',
      userId: session.user.id,
      organizationId: subscription.organizationId,
      metadata: {
        subscriptionId: subscription.id,
        organizationName: subscription.organization.name,
        amount: paymentAmount,
        billingCycle: subscription.billingCycle,
        paymentId: result.payment.id
      }
    })

    return NextResponse.json({
      success: true,
      subscription: result.subscription,
      payment: result.payment,
      message: `Payment of ${paymentAmount} MAD validated successfully`
    })
  } catch (error) {
    console.error('Error validating payment:', error)
    return NextResponse.json({ error: 'Failed to validate payment' }, { status: 500 })
  }
}
