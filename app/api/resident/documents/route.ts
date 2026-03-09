export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List documents for resident
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'RESIDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get resident's apartment and residence
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

    if (!user?.apartment?.residenceId) {
      return NextResponse.json([])
    }

    const documents = await prisma.document.findMany({
      where: {
        residenceId: user.apartment.residenceId
      },
      include: {
        uploadedBy: {
          select: { name: true }
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
      uploadedBy: d.uploadedBy.name,
      createdAt: d.createdAt.toISOString()
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}
