export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List active announcements for resident's residence
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

    const now = new Date()

    const announcements = await prisma.announcement.findMany({
      where: {
        residenceId: user.apartment.residenceId,
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      include: {
        createdBy: {
          select: { name: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    const formatted = announcements.map(a => ({
      id: a.id,
      title: a.title,
      content: a.content,
      type: a.type,
      priority: a.priority,
      startDate: a.startDate.toISOString(),
      endDate: a.endDate?.toISOString() || null,
      createdBy: a.createdBy.name,
      createdAt: a.createdAt.toISOString()
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}
