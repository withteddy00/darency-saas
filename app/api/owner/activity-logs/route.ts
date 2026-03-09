import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List activity logs
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const organizationId = searchParams.get('organizationId')
    const action = searchParams.get('action')
    const target = searchParams.get('target')

    const where: any = {}
    if (userId) where.userId = userId
    if (organizationId) where.organizationId = organizationId
    if (action) where.action = action
    if (target) where.target = target

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit
      }),
      prisma.activityLog.count({ where })
    ])

    // Get unique users for filtering
    const uniqueUsers = await prisma.activityLog.findMany({
      select: { userId: true, userName: true, userEmail: true, userRole: true },
      distinct: ['userId'],
      where: { userId: { not: null } }
    })

    return NextResponse.json({
      logs: logs.map(log => ({
        id: log.id,
        action: log.action,
        target: log.target,
        targetId: log.targetId,
        description: log.description,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
        userId: log.userId,
        userName: log.userName,
        userEmail: log.userEmail,
        userRole: log.userRole,
        organizationId: log.organizationId,
        residenceId: log.residenceId,
        residenceName: log.residenceName,
        createdAt: log.createdAt.toISOString()
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        users: uniqueUsers.map(u => ({
          id: u.userId,
          name: u.userName,
          email: u.userEmail,
          role: u.userRole
        })).filter(u => u.id)
      }
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
  }
}
