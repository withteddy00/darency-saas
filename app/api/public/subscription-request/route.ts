import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Create a new subscription request from landing page
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      organizationName,
      managerName,
      email,
      phone,
      city,
      numberOfApartments,
      planId,
      billingCycle,
      notes
    } = body

    // Validation
    if (!organizationName || !managerName || !email || !phone || !city || !numberOfApartments || !planId) {
      return NextResponse.json({ 
        error: 'Tous les champs obligatoires doivent être remplis' 
      }, { status: 400 })
    }

    // Verify plan exists and is active
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId, isActive: true, isVisible: true }
    })

    if (!plan) {
      return NextResponse.json({ 
        error: 'Plan invalide ou non disponible' 
      }, { status: 400 })
    }

    // Split manager name into first and last name
    const nameParts = managerName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Calculate expiration date (7 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create subscription request
    const subscriptionRequest = await prisma.subscriptionRequest.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        residenceName: organizationName,
        residenceAddress: '', // Will be filled when approved
        city,
        numberOfApartments: parseInt(numberOfApartments),
        planId,
        billingCycle: billingCycle || 'monthly',
        status: 'PENDING',
        expiresAt
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Votre demande d\'abonnement a été soumise avec succès!',
      requestId: subscriptionRequest.id
    })
  } catch (error) {
    console.error('Error creating subscription request:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la soumission de la demande' 
    }, { status: 500 })
  }
}
