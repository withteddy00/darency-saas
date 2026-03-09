export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ADMIN must have an assigned residence to access this endpoint
    if (session.user.role === 'ADMIN' && !session.user.residenceId) {
      return NextResponse.json({ error: 'Admin residence not assigned. Please contact the owner.' }, { status: 403 })
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

    // ADMIN must have an assigned residence to perform this action
    const adminResidenceId = session.user.residenceId

    if (!adminResidenceId) {
      return NextResponse.json({ error: 'Admin residence not assigned. Please contact the owner.' }, { status: 403 })
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

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
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
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash('TempPassword123!', saltRounds)

    const residentData: any = {
      name,
      email,
      password: hashedPassword,
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

// PATCH - Update resident
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, phone, apartmentId } = body

    if (!id) {
      return NextResponse.json({ error: 'Resident ID is required' }, { status: 400 })
    }

    let residenceFilter = {}
    if (session.user.role === 'ADMIN' && session.user.residenceId) {
      residenceFilter = { residenceId: session.user.residenceId }
    }

    // Verify resident exists and belongs to accessible residence
    const existing = await prisma.user.findFirst({
      where: { 
        id, 
        role: 'RESIDENT',
        ...(session.user.role === 'ADMIN' ? { apartment: { residenceId: session.user.residenceId } } : { organizationId: session.user.organizationId })
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    
    // Handle apartment change
    if (apartmentId !== undefined) {
      // If changing to a new apartment
      if (apartmentId && apartmentId !== existing.apartmentId) {
        // Free up old apartment
        if (existing.apartmentId) {
          await prisma.apartment.update({
            where: { id: existing.apartmentId },
            data: { status: 'VACANT' }
          })
        }
        // Occupy new apartment
        await prisma.apartment.update({
          where: { id: apartmentId },
          data: { status: 'OCCUPIED' }
        })
        updateData.apartmentId = apartmentId
      } else if (!apartmentId && existing.apartmentId) {
        // Removing apartment assignment
        await prisma.apartment.update({
          where: { id: existing.apartmentId },
          data: { status: 'VACANT' }
        })
        updateData.apartmentId = null
      }
    }

    const resident = await prisma.user.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(resident)
  } catch (error) {
    console.error('Error updating resident:', error)
    return NextResponse.json({ error: 'Failed to update resident' }, { status: 500 })
  }
}

// DELETE - Delete resident
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Resident ID is required' }, { status: 400 })
    }

    // Verify resident exists
    const existing = await prisma.user.findFirst({
      where: { 
        id, 
        role: 'RESIDENT',
        ...(session.user.role === 'ADMIN' ? { apartment: { residenceId: session.user.residenceId } } : { organizationId: session.user.organizationId })
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    // If apartment is assigned, free it up
    if (existing.apartmentId) {
      await prisma.apartment.update({
        where: { id: existing.apartmentId },
        data: { status: 'VACANT' }
      })
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting resident:', error)
    return NextResponse.json({ error: 'Failed to delete resident' }, { status: 500 })
  }
}
