import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      residenceName,
      residenceAddress,
      city,
      numberOfApartments,
      planId,
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !residenceName || !residenceAddress || !city || !numberOfApartments || !planId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email already exists in a subscription request
    const existingRequest = await prisma.subscriptionRequest.findFirst({
      where: { email },
    })

    if (existingRequest) {
      return NextResponse.json({ error: 'A request with this email already exists' }, { status: 400 })
    }

    // Create the subscription request
    const subscriptionRequest = await prisma.subscriptionRequest.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        residenceName,
        residenceAddress,
        city,
        numberOfApartments,
        planId,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    })

    // Create history entry
    await prisma.subscriptionRequestHistory.create({
      data: {
        subscriptionRequestId: subscriptionRequest.id,
        action: 'CREATED',
        description: `Demande d'abonnement créée pour ${residenceName}`,
      },
    })

    return NextResponse.json({ success: true, id: subscriptionRequest.id })
  } catch (error) {
    console.error('Error creating subscription request:', error)
    return NextResponse.json({ error: 'Failed to create subscription request' }, { status: 500 })
  }
}
