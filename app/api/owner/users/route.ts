export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Owner can see all users across all organizations
    const users = await prisma.user.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        apartment: {
          include: {
            residence: {
              select: {
                name: true
              }
            }
          }
        },
        adminForResidence: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization?.name || null,
      apartment: user.apartment ? {
        number: user.apartment.number,
        building: user.apartment.building,
        residence: user.apartment.residence?.name
      } : null,
      residence: user.adminForResidence?.name || null,
      createdAt: user.createdAt
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organizationId
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
    }

    const body = await request.json()
    const { name, email, phone, role, residenceId, apartmentId, password } = body

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email and role are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // For ADMIN role, residenceId is required
    if (role === 'ADMIN' && !residenceId) {
      return NextResponse.json({ error: 'Admin must be assigned to a residence' }, { status: 400 })
    }

    // For RESIDENT role, apartmentId is required
    if (role === 'RESIDENT' && !apartmentId) {
      return NextResponse.json({ error: 'Resident must be assigned to an apartment' }, { status: 400 })
    }

    // Hash password before storing
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password || 'TempPassword123!', saltRounds)

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role,
        organizationId,
        adminForResidenceId: role === 'ADMIN' ? residenceId : null,
        apartmentId: role === 'RESIDENT' ? apartmentId : null,
      }
    })

    // If ADMIN, also create in Admin table
    if (role === 'ADMIN' && residenceId) {
      await prisma.admin.create({
        data: {
          userId: user.id,
          residenceId
        }
      })
    }

    // If RESIDENT and apartment assigned, update apartment status
    if (role === 'RESIDENT' && apartmentId) {
      await prisma.apartment.update({
        where: { id: apartmentId },
        data: { status: 'OCCUPIED' }
      })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, phone, adminForResidenceId, apartmentId } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Update user
    const updateData: any = {}
    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (adminForResidenceId !== undefined) updateData.adminForResidenceId = adminForResidenceId
    if (apartmentId !== undefined) updateData.apartmentId = apartmentId

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Don't allow deleting yourself
    if (existingUser.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // If user is ADMIN, remove from Admin table
    if (existingUser.role === 'ADMIN') {
      await prisma.admin.deleteMany({
        where: { userId: id }
      })
    }

    // Delete the user
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
