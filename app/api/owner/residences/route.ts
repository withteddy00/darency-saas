import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization ID from session
    const organizationId = session.user.organizationId

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
    }

    // Get all residences with full details
    const residences = await prisma.residence.findMany({
      where: { organizationId },
      include: {
        apartments: true,
        adminUsers: true,
        charges: true,
        maintenanceRequests: true
      },
      orderBy: { createdAt: 'desc' }
    }) as any[]

    // Get all apartments for each residence to calculate stats
    const formattedResidences = await Promise.all(residences.map(async (residence) => {
      // Count apartments
      const totalApartments = residence.apartments.length
      const occupiedApartments = (residence.apartments as any[]).filter((a: any) => a.status === 'OCCUPIED').length
      const vacantApartments = totalApartments - occupiedApartments
      const occupancyRate = totalApartments > 0 
        ? Math.round((occupiedApartments / totalApartments) * 100) 
        : 0

      // Count residents (users with RESIDENT role linked to apartments in this residence)
      const residentCount = await prisma.user.count({
        where: {
          role: 'RESIDENT',
          apartment: {
            residenceId: residence.id
          }
        }
      })

      // Count admins for this residence
      const adminCount = residence.adminUsers.length

      // Calculate unpaid charges
      const charges = await prisma.charge.findMany({
        where: { residenceId: residence.id }
      })

      const payments = await prisma.payment.findMany({
        where: {
          charge: { residenceId: residence.id }
        }
      })

      let unpaidChargesTotal = 0
      for (const charge of charges) {
        const chargePayments = payments.filter(p => p.chargeId === charge.id)
        const paidAmount = chargePayments
          .filter(p => p.status === 'PAID')
          .reduce((sum, p) => sum + p.amount, 0)
        if (paidAmount < charge.amount) {
          unpaidChargesTotal += (charge.amount - paidAmount)
        }
      }

      // Count open maintenance requests
      const maintenanceRequests = await prisma.maintenanceRequest.findMany({
        where: { residenceId: residence.id }
      })
      const openMaintenanceRequests = maintenanceRequests.filter(
        m => m.status !== 'COMPLETED' && m.status !== 'CANCELLED'
      ).length

      return {
        id: residence.id,
        name: residence.name,
        address: residence.address,
        city: residence.city,
        postalCode: residence.postalCode,
        description: residence.description,
        imageUrl: residence.imageUrl,
        apartments: totalApartments,
        occupiedApartments,
        vacantApartments,
        occupancyRate,
        residents: residentCount,
        admins: adminCount,
        unpaidCharges: unpaidChargesTotal,
        openMaintenanceRequests,
        createdAt: residence.createdAt
      }
    }))

    return NextResponse.json(formattedResidences)
  } catch (error) {
    console.error('Error fetching residences:', error)
    return NextResponse.json({ error: 'Failed to fetch residences' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, address, city, postalCode, description } = body

    if (!name || !address || !city) {
      return NextResponse.json({ error: 'Name, address, and city are required' }, { status: 400 })
    }

    const organizationId = session.user.organizationId

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
    }

    const residence = await prisma.residence.create({
      data: {
        name,
        address,
        city,
        postalCode: postalCode || null,
        description: description || null,
        organizationId
      }
    })

    return NextResponse.json(residence)
  } catch (error) {
    console.error('Error creating residence:', error)
    return NextResponse.json({ error: 'Failed to create residence' }, { status: 500 })
  }
}
