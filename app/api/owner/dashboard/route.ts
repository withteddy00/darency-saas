export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Platform-wide statistics
    const [
      totalResidences,
      totalAdmins,
      totalResidents,
      totalOrganizations,
      activeSubscriptions,
      pendingRequests,
      allPayments,
      allCharges,
      allExpenses,
      plans
    ] = await Promise.all([
      prisma.residence.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'RESIDENT' } }),
      prisma.organization.count(),
      prisma.organization.count({ where: { subscriptionStatus: 'ACTIVE' } }),
      prisma.subscriptionRequest.count({ where: { status: 'PENDING' } }),
      prisma.payment.findMany({ where: { status: 'PAID' } }),
      prisma.charge.findMany(),
      prisma.expense.findMany(),
      prisma.subscriptionPlan.findMany({ orderBy: { price: 'asc' } })
    ])

    // Calculate revenue
    const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0)
    const totalCharges = allCharges.reduce((sum, c) => sum + c.amount, 0)
    const totalExpensesAmount = allExpenses.reduce((sum, e) => sum + e.amount, 0)

    // Monthly revenue (last 12 months)
    const now = new Date()
    const monthlyRevenue: { month: string; revenue: number }[] = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      const monthPayments = allPayments.filter(p => {
        const paidDate = p.paidDate
        return paidDate && paidDate.getMonth() === month && paidDate.getFullYear() === year
      })

      monthlyRevenue.push({
        month: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0)
      })
    }

    // Recent subscription requests
    const recentRequests = await prisma.subscriptionRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { plan: true }
    })

    // Recent organizations
    const recentOrganizations = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { 
        plan: true,
        _count: { select: { residences: true, users: true } }
      }
    })

    // Get top residences by revenue
    const residences = await prisma.residence.findMany({
      include: {
        apartments: true,
        charges: true,
        _count: { select: { apartments: true } }
      }
    })

    const residenceStats = await Promise.all(residences.map(async (r) => {
      const charges = await prisma.charge.findMany({ where: { residenceId: r.id } })
      const payments = await prisma.payment.findMany({
        where: { charge: { residenceId: r.id }, status: 'PAID' }
      })
      const revenue = payments.reduce((sum, p) => sum + p.amount, 0)
      const residents = await prisma.user.count({
        where: { role: 'RESIDENT', apartment: { residenceId: r.id } }
      })

      return {
        id: r.id,
        name: r.name,
        city: r.city,
        apartments: r._count.apartments,
        residents,
        revenue,
        status: r.status
      }
    }))

    residenceStats.sort((a, b) => b.revenue - a.revenue)
    const topResidences = residenceStats.slice(0, 5)

    return NextResponse.json({
      stats: {
        totalResidences,
        totalAdmins,
        totalResidents,
        totalOrganizations,
        activeSubscriptions,
        pendingRequests,
        totalRevenue,
        totalCharges,
        totalExpenses: totalExpensesAmount,
        netRevenue: totalRevenue - totalExpensesAmount,
        unpaidAmount: totalCharges - totalRevenue
      },
      monthlyRevenue,
      recentRequests: recentRequests.map(r => ({
        id: r.id,
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        residenceName: r.residenceName,
        city: r.city,
        numberOfApartments: r.numberOfApartments,
        plan: r.plan.name,
        createdAt: r.createdAt.toISOString()
      })),
      recentOrganizations: recentOrganizations.map(o => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        city: o.city,
        plan: o.plan?.name || 'None',
        residences: o._count.residences,
        users: o._count.users,
        status: o.subscriptionStatus,
        createdAt: o.createdAt.toISOString()
      })),
      topResidences,
      plans: plans.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        yearlyPrice: p.yearlyPrice,
        billingCycle: p.billingCycle,
        maxResidences: p.maxResidences,
        maxAdmins: p.maxAdmins,
        maxApartments: p.maxApartments,
        isVisible: p.isVisible,
        isPopular: p.isPopular,
        isActive: p.isActive
      }))
    })
  } catch (error) {
    console.error('Error fetching owner dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
