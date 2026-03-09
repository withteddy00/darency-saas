import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

// GET - List all residences across organizations
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const organizationId = searchParams.get('organizationId')

    const where: any = {}
    if (status) where.status = status
    if (organizationId) where.organizationId = organizationId

    const residences = await prisma.residence.findMany({
      where,
      include: {
        organization: {
          select: { id: true, name: true, subscriptionStatus: true, plan: true }
        },
        apartments: {
          select: { id: true, status: true }
        },
        _count: {
          select: { apartments: true, charges: true, maintenanceRequests: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats for each residence
    const residencesWithStats = await Promise.all(residences.map(async (residence) => {
      const residents = await prisma.user.count({
        where: { role: 'RESIDENT', apartment: { residenceId: residence.id } }
      })
      
      const charges = await prisma.charge.findMany({ where: { residenceId: residence.id } })
      const payments = await prisma.payment.findMany({
        where: { charge: { residenceId: residence.id }, status: 'PAID' }
      })

      const revenue = payments.reduce((sum, p) => sum + p.amount, 0)
      const occupiedApartments = residence.apartments.filter(a => a.status === 'OCCUPIED').length

      return {
        id: residence.id,
        name: residence.name,
        address: residence.address,
        city: residence.city,
        status: residence.status,
        numberOfApartments: residence.numberOfApartments,
        organization: residence.organization,
        apartments: {
          total: residence._count.apartments,
          occupied: occupiedApartments,
          vacant: residence._count.apartments - occupiedApartments
        },
        residents,
        charges: residence._count.charges,
        maintenanceRequests: residence._count.maintenanceRequests,
        revenue,
        createdAt: residence.createdAt.toISOString()
      }
    }))

    return NextResponse.json({ residences: residencesWithStats })
  } catch (error) {
    console.error('Error fetching residences:', error)
    return NextResponse.json({ error: 'Failed to fetch residences' }, { status: 500 })
  }
}

// PUT - Update residence (suspend, activate, delete)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { residenceId, action, planId } = body

    if (!residenceId || !action) {
      return NextResponse.json({ error: 'Residence ID and action are required' }, { status: 400 })
    }

    const residence = await prisma.residence.findUnique({
      where: { id: residenceId },
      include: { organization: true }
    })

    if (!residence) {
      return NextResponse.json({ error: 'Residence not found' }, { status: 404 })
    }

    let updatedResidence

    switch (action) {
      case 'suspend':
        updatedResidence = await prisma.residence.update({
          where: { id: residenceId },
          data: { status: 'INACTIVE' }
        })

        await logActivity({
          action: 'SUSPEND',
          target: 'Residence',
          targetId: residenceId,
          description: `Suspended residence "${residence.name}"`,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role,
          organizationId: residence.organizationId,
          residenceId,
          residenceName: residence.name
        })
        break

      case 'activate':
        updatedResidence = await prisma.residence.update({
          where: { id: residenceId },
          data: { status: 'ACTIVE' }
        })

        await logActivity({
          action: 'ACTIVATE',
          target: 'Residence',
          targetId: residenceId,
          description: `Activated residence "${residence.name}"`,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role,
          organizationId: residence.organizationId,
          residenceId,
          residenceName: residence.name
        })
        break

      case 'delete':
        // Check if there are active residents
        const activeResidents = await prisma.user.count({
          where: { apartment: { residenceId }, role: 'RESIDENT' }
        })

        if (activeResidents > 0) {
          return NextResponse.json({ 
            error: 'Cannot delete residence with active residents. Please reassign residents first.' 
          }, { status: 400 })
        }

        await prisma.residence.delete({
          where: { id: residenceId }
        })

        await logActivity({
          action: 'DELETE',
          target: 'Residence',
          targetId: residenceId,
          description: `Deleted residence "${residence.name}"`,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role,
          organizationId: residence.organizationId
        })

        return NextResponse.json({ 
          success: true, 
          message: 'Residence deleted' 
        })

      case 'changePlan':
        if (!planId) {
          return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
        }

        const plan = await prisma.subscriptionPlan.findUnique({
          where: { id: planId }
        })

        if (!plan) {
          return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
        }

        await prisma.organization.update({
          where: { id: residence.organizationId },
          data: { planId }
        })

        await logActivity({
          action: 'CHANGE_PLAN',
          target: 'Residence',
          targetId: residenceId,
          description: `Changed plan for residence "${residence.name}" to ${plan.name}`,
          userId: session.user.id,
          userName: session.user.name,
          userEmail: session.user.email,
          userRole: session.user.role,
          organizationId: residence.organizationId,
          residenceId,
          residenceName: residence.name
        })

        return NextResponse.json({ 
          success: true, 
          message: `Plan changed to ${plan.name}` 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      residence: {
        id: updatedResidence.id,
        status: updatedResidence.status
      }
    })
  } catch (error) {
    console.error('Error updating residence:', error)
    return NextResponse.json({ error: 'Failed to update residence' }, { status: 500 })
  }
}
