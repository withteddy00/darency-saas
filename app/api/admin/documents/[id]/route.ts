export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get single document
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER' && session.user.role !== 'RESIDENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    const document = await prisma.document.findUnique({
      where: { id },
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
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // For ADMIN, check residence access
    if (session.user.role === 'ADMIN' && session.user.residenceId !== document.residenceId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      id: document.id,
      name: document.name,
      description: document.description,
      type: document.type,
      fileUrl: document.fileUrl,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      category: document.category,
      residence: document.residence,
      apartment: document.apartment,
      uploadedBy: document.uploadedBy,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 })
  }
}

// PUT - Update document
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let residenceId: string | undefined
    if (session.user.role === 'ADMIN') {
      residenceId = session.user.residenceId || undefined
    }

    const body = await request.json()
    const { id, name, description, type, fileUrl, fileSize, mimeType, category, apartmentId } = body

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Verify document belongs to this residence (for ADMIN)
    const filter: any = { id }
    if (residenceId) {
      filter.residenceId = residenceId
    }

    const existing = await prisma.document.findFirst({
      where: filter
    })

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (fileUrl !== undefined) updateData.fileUrl = fileUrl
    if (fileSize !== undefined) updateData.fileSize = fileSize
    if (mimeType !== undefined) updateData.mimeType = mimeType
    if (category !== undefined) updateData.category = category
    if (apartmentId !== undefined) updateData.apartmentId = apartmentId

    const document = await prisma.document.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 })
  }
}

// DELETE - Delete document
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let residenceId: string | undefined
    if (session.user.role === 'ADMIN') {
      residenceId = session.user.residenceId || undefined
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Verify document belongs to this residence (for ADMIN)
    const filter: any = { id }
    if (residenceId) {
      filter.residenceId = residenceId
    }

    const existing = await prisma.document.findFirst({
      where: filter
    })

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    await prisma.document.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
