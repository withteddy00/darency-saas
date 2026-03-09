export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List all documents (for admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let residenceFilter = {}
    if (session.user.role === 'ADMIN' && session.user.residenceId) {
      residenceFilter = { residenceId: session.user.residenceId }
    } else if (session.user.role === 'OWNER') {
      // OWNER sees all - no filter
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documents = await prisma.document.findMany({
      where: residenceFilter,
      include: {
        residence: {
          select: { name: true, city: true }
        },
        uploadedBy: {
          select: { name: true, email: true }
        },
        apartment: {
          select: { number: true, building: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formatted = documents.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      type: d.type,
      fileUrl: d.fileUrl,
      fileSize: d.fileSize,
      mimeType: d.mimeType,
      category: d.category,
      residence: d.residence,
      apartment: d.apartment,
      uploadedBy: d.uploadedBy,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString()
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// POST - Create document
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let residenceId: string
    let body: any

    if (session.user.role === 'ADMIN') {
      residenceId = session.user.residenceId || ''
      if (!residenceId) {
        return NextResponse.json({ error: 'Admin residence not assigned' }, { status: 403 })
      }
      body = await request.json()
    } else if (session.user.role === 'OWNER') {
      // For OWNER, get residenceId from body or use first residence
      body = await request.json()
      residenceId = body.residenceId
      
      if (!residenceId) {
        // Get first residence for this organization
        const residence = await prisma.residence.findFirst({
          where: { organizationId: session.user.organizationId }
        })
        residenceId = residence?.id || ''
      }
      
      if (!residenceId) {
        return NextResponse.json({ error: 'No residence found' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, type, fileUrl, fileSize, mimeType, category, apartmentId } = body

    if (!name || !fileUrl || !type) {
      return NextResponse.json({ error: 'Name, fileUrl, and type are required' }, { status: 400 })
    }

    const document = await prisma.document.create({
      data: {
        name,
        description,
        type,
        fileUrl,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        category: category || null,
        residenceId,
        uploadedById: session.user.id,
        apartmentId: apartmentId || null
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error creating document:', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
}
