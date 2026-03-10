import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// Generate payment reference: DRN-YYYYMMDD-XXXXXX
function generatePaymentReference(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = randomBytes(3).toString('hex').toUpperCase()
  return `DRN-${year}${month}${day}-${random}`
}

// POST - Create a new subscription request from landing page
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      // Contact / Account Information
      fullName,
      email,
      phone,
      password,
      preferredLanguage,
      // Residence / Organization Information
      organizationName,
      residenceName,
      address,
      city,
      country,
      numberOfBuildings,
      numberOfFloors,
      numberOfApartments,
      estimatedNumberOfResidents,
      // Subscription Information
      selectedPlanSlug,
      planId,
      billingCycle,
      notes,
      // Optional Business Information
      ice,
      rc,
      taxId,
      website
    } = body

    // Validation - Contact
    if (!fullName || !email || !phone) {
      return NextResponse.json({
        error: 'Les informations de contact sont requises'
      }, { status: 400 })
    }

    // Validation - Residence
    if (!organizationName || !residenceName || !address || !city || !numberOfApartments) {
      return NextResponse.json({
        error: 'Les informations de la résidence sont requises'
      }, { status: 400 })
    }

    // Validation - Plan
    if (!planId && !selectedPlanSlug) {
      return NextResponse.json({
        error: 'Un plan doit être sélectionné'
      }, { status: 400 })
    }

    // Verify plan exists and is active (if planId provided)
    let plan = null
    if (planId) {
      plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId, isActive: true, isVisible: true }
      })
    } else if (selectedPlanSlug) {
      plan = await prisma.subscriptionPlan.findUnique({
        where: { slug: selectedPlanSlug, isActive: true, isVisible: true }
      })
    }

    if (!plan) {
      return NextResponse.json({
        error: 'Plan invalide ou non disponible'
      }, { status: 400 })
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Generate payment reference
    const paymentReference = generatePaymentReference()

    // Determine initial status
    const status = 'PENDING'

    // Calculate amount
    const cycle = billingCycle || 'monthly'
    const amount = cycle === 'yearly' ? (plan.yearlyPrice || plan.price * 12) : plan.price

    // Create subscription request with all new fields
    const subscriptionRequest = await prisma.subscriptionRequest.create({
      data: {
        // Contact / Account Information
        fullName,
        email,
        phone,
        passwordTemp: password || null,
        preferredLanguage: preferredLanguage || 'fr',
        
        // Residence / Organization Information
        organizationName,
        residenceName,
        address,
        city,
        country: country || 'Maroc',
        numberOfBuildings: numberOfBuildings || 1,
        numberOfFloors: numberOfFloors || 1,
        numberOfApartments: parseInt(String(numberOfApartments)),
        estimatedNumberOfResidents: estimatedNumberOfResidents ? parseInt(String(estimatedNumberOfResidents)) : null,
        
        // Subscription Information
        planId: plan.id,
        selectedPlanSlug: plan.slug,
        billingCycle: cycle,
        notes: notes || null,
        
        // Optional Business Information
        ice: ice || null,
        rc: rc || null,
        taxId: taxId || null,
        website: website || null,
        
        // Payment Information
        paymentReference,
        
        // Status
        status,
        expiresAt
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Votre demande d\'abonnement a été soumise avec succès!',
      requestId: subscriptionRequest.id,
      paymentReference,
      amount,
      status
    })
  } catch (error) {
    console.error('Error creating subscription request:', error)
    return NextResponse.json({
      error: 'Erreur lors de la soumission de la demande'
    }, { status: 500 })
  }
}
