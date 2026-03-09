export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get single residence
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Residence ID is required' }, { status: 400 })
    }

    const residence = await prisma.residence.findFirst({
      where: { id, organizationId: session.user.organizationId },
      include: {
        apartments: {
          include: {
            residentUser: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        adminUsers: {
          select: { id: true, name: true, email: true, phone: true }
        },
        _count: {
          select: {
            apartments: true,
            charges: true,
            maintenanceRequests: true
          }
        }
      }
    })

    if (!residence) {
      return NextResponse.json({ error: 'Residence not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: residence.id,
      name: residence.name,
      address: residence.address,
      city: residence.city,
      postalCode: residence.postalCode,
      description: residence.description,
      imageUrl: residence.imageUrl,
      numberOfBuildings: residence.numberOfBuildings,
      numberOfApartments: residence.numberOfApartments,
      contactPhone: residence.contactPhone,
      email: residence.email,
      notes: residence.notes,
      status: residence.status,
      apartments: residence.apartments,
      admins: residence.adminUsers,
      stats: {
        totalApartments: residence._count.apartments,
        totalCharges: residence._count.charges,
        totalMaintenanceRequests: residence._count.maintenanceRequests
      },
      createdAt: residence.createdAt.toISOString()
    })
  } catch (error) {
    console.error('Error fetching residence:', error)
    return NextResponse.json({ error: 'Failed to fetch residence' }, { status: 500 })
  }
}
