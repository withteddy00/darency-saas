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

    if (subscriptionRequest.status !== 'PENDING') {
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
    const tempPassword = randomBytes(8).toString('hex')
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Create organization with the plan
    const organization = await prisma.organization.create({
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
        planEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    })

    // Create residence
    const residence = await prisma.residence.create({
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
    const admin = await prisma.user.create({
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

    // Update subscription request
    await prisma.subscriptionRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        password: tempPassword,
        activatedAt: new Date(),
        adminNotes: notes || 'Approved - Organization and admin created'
      }
    })

    // Create history entry
    await prisma.subscriptionRequestHistory.create({
      data: {
        subscriptionRequestId: requestId,
        action: 'APPROVED',
        description: `Approved - Created organization "${organization.name}" and admin account`,
        performedBy: session.user.email
      }
    })

    // Log activity
    await logActivity({
      action: 'APPROVE',
      target: 'SubscriptionRequest',
      targetId: requestId,
      description: `Approved subscription request - Created organization "${organization.name}" with admin ${admin.email}`,
      metadata: {
        organizationId: organization.id,
        residenceId: residence.id,
        adminId: admin.id
      },
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role,
      organizationId: organization.id,
      residenceId: residence.id,
      residenceName: residence.name
    })

    return NextResponse.json({
      success: true,
      message: 'Request approved - Organization and admin created',
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      },
      residence: {
        id: residence.id,
        name: residence.name
      },
      admin: {
        id: admin.id,
        email: admin.email,
        temporaryPassword: tempPassword
      }
    })
  } catch (error) {
    console.error('Error processing subscription request:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
