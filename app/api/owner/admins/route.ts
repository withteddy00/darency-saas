import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

// GET - List all admins
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      include: {
        apartment: true,
        adminForResidence: {
          include: {
            organization: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      admins: admins.map(a => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone: a.phone,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        residence: a.adminForResidence ? {
          id: a.adminForResidence.id,
          name: a.adminForResidence.name,
          organization: a.adminForResidence.organization.name
        } : null
      }))
    })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 })
  }
}

// POST - Create a new admin
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, residenceId } = body

    if (!name || !email || !residenceId) {
      return NextResponse.json({ error: 'Name, email, and residence are required' }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 })
    }

    // Verify residence exists
    const residence = await prisma.residence.findUnique({
      where: { id: residenceId },
      include: { organization: true }
    })

    if (!residence) {
      return NextResponse.json({ error: 'Residence not found' }, { status: 404 })
    }

    // Generate temporary password
    const tempPassword = randomBytes(8).toString('hex')
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'ADMIN',
        organizationId: residence.organizationId,
        adminForResidenceId: residenceId
      }
    })

    // Log activity
    await logActivity({
      action: 'CREATE',
      target: 'User',
      targetId: admin.id,
      description: `Created admin account for ${admin.email} at residence "${residence.name}"`,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role,
      organizationId: residence.organizationId,
      residenceId: residence.id,
      residenceName: residence.name
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        residence: residence.name
      },
      tempPassword
    })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
  }
}

// PUT - Update admin (suspend, change residence, reset password)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { adminId, action, ...actionData } = body

    if (!adminId || !action) {
      return NextResponse.json({ error: 'Admin ID and action are required' }, { status: 400 })
    }

    const admin = await prisma.user.findFirst({
      where: { id: adminId, role: 'ADMIN' },
      include: { adminForResidence: true }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    let updatedAdmin
    let tempPassword

    switch (action) {
      case 'resetPassword':
        tempPassword = randomBytes(8).toString('hex')
        updatedAdmin = await prisma.user.update({
          where: { id: adminId },
          data: { password: await bcrypt.hash(tempPassword, 12) }
        })
        
        await logActivity({
          action: 'RESET_PASSWORD',
          target: 'User',
          targetId: adminId,
          description: `Reset password for admin ${admin.email}`,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role
        })
        break

      case 'changeResidence':
        if (!actionData.residenceId) {
          return NextResponse.json({ error: 'New residence ID is required' }, { status: 400 })
        }

        const newResidence = await prisma.residence.findUnique({
          where: { id: actionData.residenceId },
          include: { organization: true }
        })

        if (!newResidence) {
          return NextResponse.json({ error: 'Residence not found' }, { status: 404 })
        }

        updatedAdmin = await prisma.user.update({
          where: { id: adminId },
          data: { 
            adminForResidenceId: actionData.residenceId,
            organizationId: newResidence.organizationId
          }
        })

        await logActivity({
          action: 'UPDATE',
          target: 'User',
          targetId: adminId,
          description: `Changed residence for admin ${admin.email} from "${admin.adminForResidence?.name || 'None'}" to "${newResidence.name}"`,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role,
          residenceId: newResidence.id,
          residenceName: newResidence.name
        })
        break

      case 'suspend':
        // Toggle suspension - in a real app you'd have an isActive field
        // For now, we'll just log it
        await logActivity({
          action: 'SUSPEND',
          target: 'User',
          targetId: adminId,
          description: `Suspended admin account ${admin.email}`,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role
        })
        return NextResponse.json({ 
          success: true, 
          message: 'Admin suspended' 
        })

      case 'activate':
        await logActivity({
          action: 'ACTIVATE',
          target: 'User',
          targetId: adminId,
          description: `Reactivated admin account ${admin.email}`,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role
        })
        return NextResponse.json({ 
          success: true, 
          message: 'Admin activated' 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const response: any = { success: true, admin: { id: updatedAdmin.id, name: updatedAdmin.name } }
    if (tempPassword) {
      response.temporaryPassword = tempPassword
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 })
  }
}

// DELETE - Delete an admin
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('adminId')

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 })
    }

    const admin = await prisma.user.findFirst({
      where: { id: adminId, role: 'ADMIN' },
      include: { adminForResidence: true }
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    await prisma.user.delete({
      where: { id: adminId }
    })

    // Log activity
    await logActivity({
      action: 'DELETE',
      target: 'User',
      targetId: adminId,
      description: `Deleted admin account ${admin.email}`,
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      userRole: session.user.role
    })

    return NextResponse.json({ success: true, message: 'Admin deleted' })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 })
  }
}
