import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get admin's residence ID if ADMIN
    let residenceId = null
    if (session.user.role === 'ADMIN' && session.user.residenceId) {
      residenceId = session.user.residenceId
    }

    const residents = await prisma.user.findMany({
      where: {
        role: 'RESIDENT',
        ...(residenceId ? {
          apartment: {
            residenceId
          }
        } : {})
      },
      include: {
        apartment: {
          include: {
            residence: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedResidents = residents.map(resident => ({
      id: resident.id,
      name: resident.name,
      email: resident.email,
      phone: resident.phone,
      apartment: resident.apartment ? {
        number: resident.apartment.number,
        building: resident.apartment.building,
        type: resident.apartment.type,
        status: resident.apartment.status,
        residenceName: resident.apartment.residence.name
      } : null,
      createdAt: resident.createdAt
    }))

    return NextResponse.json(formattedResidents)
  } catch (error) {
    console.error('Error fetching residents:', error)
    return NextResponse.json({ error: 'Failed to fetch residents' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, apartmentId } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Get organization ID from session
    const organizationId = session.user.organizationId
    const adminResidenceId = session.user.residenceId

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
    }

    if (!adminResidenceId) {
      return NextResponse.json({ error: 'Residence not assigned' }, { status: 400 })
    }

    // If apartment is provided, verify it belongs to this admin's residence
    if (apartmentId) {
      const apartment = await prisma.apartment.findFirst({
        where: {
          id: apartmentId,
          residenceId: adminResidenceId
        }
      })

      if (!apartment) {
        return NextResponse.json({ error: 'Apartment not found in your residence' }, { status: 403 })
      }
    }

    // Create the resident user
    const residentData: any = {
      name,
      email,
      phone: phone || null,
      role: 'RESIDENT',
      organizationId,
    }

    if (apartmentId) {
      residentData.apartmentId = apartmentId
    }

    const resident = await prisma.user.create({
      data: residentData,
      include: {
        apartment: true
      }
    })

    // If apartment is assigned, update its status
    if (apartmentId) {
      await prisma.apartment.update({
        where: { id: apartmentId },
        data: { status: 'OCCUPIED' }
      })
    }

    return NextResponse.json(resident)
  } catch (error) {
    console.error('Error creating resident:', error)
    return NextResponse.json({ error: 'Failed to create resident' }, { status: 500 })
  }
}
