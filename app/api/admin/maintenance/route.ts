export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ADMIN must have an assigned residence to access this endpoint
    if (session.user.role === 'ADMIN' && !session.user.residenceId) {
      return NextResponse.json({ error: 'Admin residence not assigned. Please contact the owner.' }, { status: 403 })
    }

    // Get admin's residence ID
    const residenceId = session.user.residenceId

    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        residenceId
      },
      include: {
        apartment: {
          select: {
            number: true,
            building: true,
            type: true
          }
        },
        reportedBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedRequests = requests.map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      status: request.status,
      priority: request.priority,
      category: request.category,
      apartment: request.apartment,
      reportedBy: request.reportedBy,
      createdAt: request.createdAt,
      resolvedAt: request.resolvedAt
    }))

    return NextResponse.json(formattedRequests)
  } catch (error) {
    console.error('Error fetching maintenance requests:', error)
    return NextResponse.json({ error: 'Failed to fetch maintenance requests' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminResidenceId = session.user.residenceId

    if (!adminResidenceId) {
      return NextResponse.json({ error: 'Admin residence not assigned' }, { status: 403 })
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 })
    }

    // Verify the request belongs to this admin's residence
    const existingRequest = await prisma.maintenanceRequest.findFirst({
      where: {
        id,
        residenceId: adminResidenceId
      }
    })

    if (!existingRequest) {
      return NextResponse.json({ error: 'Maintenance request not found in your residence' }, { status: 404 })
    }

    const updateData: any = { status }
    
    // If marking as completed, set resolvedAt
    if (status === 'COMPLETED') {
      updateData.resolvedAt = new Date()
    }

    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedRequest)
  } catch (error) {
    console.error('Error updating maintenance request:', error)
    return NextResponse.json({ error: 'Failed to update maintenance request' }, { status: 500 })
  }
}
