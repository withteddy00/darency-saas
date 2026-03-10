import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// Generate payment reference
function generatePaymentReference(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = randomBytes(3).toString('hex').toUpperCase()
  return `DRN-${year}${month}${day}-${random}`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      fullName,
      email,
      phone,
      organizationName,
      residenceName,
      address,
      city,
      country,
      numberOfBuildings,
      numberOfFloors,
      numberOfApartments,
      planId,
      billingCycle,
      notes,
      ice,
      rc,
      taxId,
      website
    } = body

    // Validate required fields
    if (!fullName || !email || !phone || !organizationName || !residenceName || !address || !city || !numberOfApartments) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get plan if provided
    let plan = null
    if (planId) {
      plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId, isActive: true }
      })
    }

    // Split full name
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Check if email already exists in a subscription request
    const existingRequest = await prisma.subscriptionRequest.findFirst({
      where: { email },
    })

    if (existingRequest) {
      return NextResponse.json({ error: 'A request with this email already exists' }, { status: 400 })
    }

    // Generate payment reference
    const paymentReference = generatePaymentReference()

    // Create the subscription request
    const subscriptionRequest = await prisma.subscriptionRequest.create({
      data: {
        fullName,
        email,
        phone,
        organizationName,
        residenceName,
        address,
        city,
        country: country || 'Maroc',
        numberOfBuildings: numberOfBuildings || 1,
        numberOfFloors: numberOfFloors || 1,
        numberOfApartments: parseInt(String(numberOfApartments)),
        planId: planId || null,
        selectedPlanSlug: plan?.slug || planId || 'unknown',
        billingCycle: billingCycle || 'monthly',
        notes: notes || null,
        ice: ice || null,
        rc: rc || null,
        taxId: taxId || null,
        website: website || null,
        paymentReference,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    // Create history entry
    await prisma.subscriptionRequestHistory.create({
      data: {
        subscriptionRequestId: subscriptionRequest.id,
        action: 'CREATED',
        description: `Demande d'abonnement créée pour ${organizationName || residenceName}`,
      },
    })

    return NextResponse.json({ success: true, id: subscriptionRequest.id })
  } catch (error) {
    console.error('Error creating subscription request:', error)
    return NextResponse.json({ error: 'Failed to create subscription request' }, { status: 500 })
  }
}
