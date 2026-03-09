export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List maintenance requests for resident
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'RESIDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get resident's apartment
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        apartment: true
      }
    })

    if (!user?.apartmentId) {
      return NextResponse.json([])
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: { apartmentId: user.apartmentId },
      include: {
        apartment: {
          select: { number: true, building: true }
        },
        residence: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formatted = requests.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      priority: r.priority,
      category: r.category,
      apartment: r.apartment,
      residence: r.residence,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      resolvedAt: r.resolvedAt?.toISOString() || null
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching maintenance requests:', error)
    return NextResponse.json({ error: 'Failed to fetch maintenance requests' }, { status: 500 })
  }
}

// POST - Create maintenance request
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'RESIDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get resident's apartment
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        apartment: {
          include: {
            residence: true
          }
        }
      }
    })

    if (!user?.apartmentId) {
      return NextResponse.json({ error: 'No apartment assigned' }, { status: 400 })
    }

    const apartment = user.apartment
    if (!apartment) {
      return NextResponse.json({ error: 'Apartment not found' }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, priority, category } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        category: category || 'OTHER',
        residenceId: apartment.residenceId,
        apartmentId: user.apartmentId,
        reportedById: session.user.id
      }
    })

    return NextResponse.json(maintenanceRequest)
  } catch (error) {
    console.error('Error creating maintenance request:', error)
    return NextResponse.json({ error: 'Failed to create maintenance request' }, { status: 500 })
  }
}
