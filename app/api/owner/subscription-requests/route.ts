import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'

// GET - List all subscription requests
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requests = await prisma.subscriptionRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { plan: true }
    })

    return NextResponse.json({
      requests: requests.map(r => ({
        id: r.id,
        fullName: r.fullName,
        email: r.email,
        phone: r.phone,
        passwordTemp: r.passwordTemp,
        preferredLanguage: r.preferredLanguage,
        organizationName: r.organizationName,
        residenceName: r.residenceName,
        address: r.address,
        city: r.city,
        country: r.country,
        numberOfBuildings: r.numberOfBuildings,
        numberOfFloors: r.numberOfFloors,
        numberOfApartments: r.numberOfApartments,
        estimatedNumberOfResidents: r.estimatedNumberOfResidents,
        plan: r.plan ? {
          id: r.plan.id,
          name: r.plan.name,
          price: r.plan.price,
          yearlyPrice: r.plan.yearlyPrice
        } : null,
        selectedPlanSlug: r.selectedPlanSlug,
        billingCycle: r.billingCycle,
        notes: r.notes,
        ice: r.ice,
        rc: r.rc,
        taxId: r.taxId,
        website: r.website,
        paymentReference: r.paymentReference,
        bankTransferProofUrl: r.bankTransferProofUrl,
        bankTransferProofName: r.bankTransferProofName,
        status: r.status,
        adminNotes: r.adminNotes,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        expiresAt: r.expiresAt?.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error fetching subscription requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

// POST - Approve or reject a subscription request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, requestId, notes } = body

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Request ID and action are required' }, { status: 400 })
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const subscriptionRequest = await prisma.subscriptionRequest.findUnique({
      where: { id: requestId },
      include: { plan: true }
    })

    if (!subscriptionRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (subscriptionRequest.status !== 'PENDING' && subscriptionRequest.status !== 'WAITING_PAYMENT') {
      return NextResponse.json({ error: 'Request has already been processed' }, { status: 400 })
    }

    if (action === 'reject') {
      // Reject the request
      const updated = await prisma.subscriptionRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          adminNotes: notes || 'Rejected by owner'
        }
      })

      // Log activity
      await logActivity({
        action: 'REJECT',
        target: 'SubscriptionRequest',
        targetId: requestId,
        description: `Rejected subscription request from ${subscriptionRequest.email}`,
        userId: session.user.id,
        userName: session.user.name,
        userEmail: session.user.email,
        userRole: session.user.role
      })

      return NextResponse.json({ 
        success: true, 
        message: 'Request rejected',
        request: {
          id: updated.id,
          status: updated.status
        }
      })
    }

    // Approve the request - create organization, residence, and admin
    // Use a transaction to ensure atomicity
    const tempPassword = randomBytes(8).toString('hex')
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: subscriptionRequest.email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'Cannot approve this request because the admin email already exists.',
        code: 'DUPLICATE_EMAIL'
      }, { status: 400 })
    }

    // Check if organization with same name already exists
    const orgName = subscriptionRequest.organizationName || subscriptionRequest.residenceName
    const existingOrg = await prisma.organization.findFirst({
      where: { 
        OR: [
          { email: subscriptionRequest.email },
          { name: orgName }
        ]
      }
    })

    if (existingOrg) {
      return NextResponse.json({ 
        error: 'Cannot approve this request because an organization with this name or email already exists.',
        code: 'DUPLICATE_ORGANIZATION'
      }, { status: 400 })
    }

    // Normalize billingCycle to uppercase for consistency
    const billingCycle = (subscriptionRequest.billingCycle || 'MONTHLY').toUpperCase()
    const isYearly = billingCycle === 'YEARLY'

    // Use transaction to ensure atomicity - all or nothing
    const result = await prisma.$transaction(async (tx) => {
      // Create organization with the plan
      const organization = await tx.organization.create({
        data: {
          name: subscriptionRequest.organizationName || subscriptionRequest.residenceName,
          slug: (subscriptionRequest.organizationName || subscriptionRequest.residenceName).toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
          email: subscriptionRequest.email,
          phone: subscriptionRequest.phone,
          address: subscriptionRequest.address,
          city: subscriptionRequest.city,
          planId: subscriptionRequest.planId,
          subscriptionStatus: 'ACTIVE',
          planStartDate: new Date(),
          planEndDate: isYearly 
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })

      // Create residence
      const residence = await tx.residence.create({
        data: {
          name: subscriptionRequest.residenceName,
          address: subscriptionRequest.address,
          city: subscriptionRequest.city,
          numberOfApartments: subscriptionRequest.numberOfApartments,
          status: 'ACTIVE',
          organizationId: organization.id
        }
      })

      // Create admin user
      const admin = await tx.user.create({
        data: {
          email: subscriptionRequest.email,
          password: hashedPassword,
          name: subscriptionRequest.fullName,
          phone: subscriptionRequest.phone,
          role: 'ADMIN',
          organizationId: organization.id,
          adminForResidenceId: residence.id
        }
      })

      // Create subscription record
      const price = isYearly 
        ? (subscriptionRequest.plan?.yearlyPrice || subscriptionRequest.plan?.price || 0)
        : (subscriptionRequest.plan?.price || 0)
      
      const subscription = await tx.subscription.create({
        data: {
          organizationId: organization.id,
          planId: subscriptionRequest.planId,
          billingCycle: billingCycle,
          price: price,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: isYearly
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      })

      // Update subscription request
      await tx.subscriptionRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          password: tempPassword,
          activatedAt: new Date(),
          adminNotes: notes || 'Approved - Organization and admin created'
        }
      })

      // Create history entry
      await tx.subscriptionRequestHistory.create({
        data: {
          subscriptionRequestId: requestId,
          action: 'APPROVED',
          description: `Approved - Created organization "${organization.name}" and admin account`,
          performedBy: session.user.email
        }
      })

      return { organization, residence, admin, subscription }
    }) // End transaction

    // Log activity (outside transaction - logging should not fail the main operation)
    await logActivity({
      action: 'APPROVE',
      target: 'SubscriptionRequest',
      targetId: requestId,
      description: `Approved subscription request - Created organization "${result.organization.name}" with admin ${result.admin.email}`,
      metadata: {
        organizationId: result.organization.id,
        residenceId: result.residence.id,
        adminId: result.admin.id
      },
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role,
      organizationId: result.organization.id,
      residenceId: result.residence.id,
      residenceName: result.residence.name
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      message: 'Request approved - Organization and admin created',
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        slug: result.organization.slug
      },
      residence: {
        id: result.residence.id,
        name: result.residence.name,
        address: result.residence.address,
        city: result.residence.city,
        numberOfApartments: result.residence.numberOfApartments,
        status: result.residence.status
      },
      admin: {
        id: result.admin.id,
        name: result.admin.name,
        email: result.admin.email,
        phone: result.admin.phone,
        temporaryPassword: tempPassword
      },
      subscription: {
        id: result.subscription.id,
        planName: subscriptionRequest.plan?.name || subscriptionRequest.selectedPlanSlug,
        billingCycle: result.subscription.billingCycle,
        price: result.subscription.price,
        status: result.subscription.status,
        startDate: result.subscription.startDate.toISOString(),
        endDate: result.subscription.endDate.toISOString()
      }
    })
  } catch (error) {
    console.error('Error processing subscription request:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 })
  }
}
