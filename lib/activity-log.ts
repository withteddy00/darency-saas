import { prisma } from './prisma'

export interface LogParams {
  action: string
  target: string
  targetId?: string
  description?: string
  metadata?: Record<string, any>
  userId?: string
  userName?: string
  userEmail?: string
  userRole?: string
  organizationId?: string
  residenceId?: string
  residenceName?: string
}

export async function logActivity(params: LogParams) {
  try {
    await prisma.activityLog.create({
      data: {
        action: params.action,
        target: params.target,
        targetId: params.targetId,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        userId: params.userId,
        userName: params.userName,
        userEmail: params.userEmail,
        userRole: params.userRole,
        organizationId: params.organizationId,
        residenceId: params.residenceId,
        residenceName: params.residenceName
      }
    })
  } catch (error) {
    // Log activity should not break main operations
    console.error('Failed to log activity:', error)
  }
}

export async function getActivities(filters?: {
  userId?: string
  organizationId?: string
  residenceId?: string
  action?: string
  target?: string
  limit?: number
  offset?: number
}) {
  const { userId, organizationId, residenceId, action, target, limit = 50, offset = 0 } = filters || {}

  const where: any = {}
  if (userId) where.userId = userId
  if (organizationId) where.organizationId = organizationId
  if (residenceId) where.residenceId = residenceId
  if (action) where.action = action
  if (target) where.target = target

  const [activities, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    }),
    prisma.activityLog.count({ where })
  ])

  return { activities, total }
}
