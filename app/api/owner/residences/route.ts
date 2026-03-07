export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const organizationId = session.user.organizationId
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
    }
    const residences = await prisma.residence.findMany({
      where: { organizationId },
      include: {
        apartments: true,
        adminUsers: true,
        charges: true,
        maintenanceRequests: true
      },
      orderBy: { createdAt: 'desc' }
    }) as any[]
    const formattedResidences = await Promise.all(residences.map(async (residence) => {
      const totalApartments = residence.apartments.length
      const occupiedApartments = residence.apartments.filter((a: any) => a.status === 'OCCUPIED').length
      const vacantApartments = totalApartments - occupiedApartments
      const occupancyRate = totalApartments > 0 ? Math.round((occupiedApartments / totalApartments) * 100) : 0
      const residentCount = await prisma.user.count({ where: { role: 'RESIDENT', apartment: { residenceId: residence.id } } })
      const admin = residence.adminUsers.length > 0 ? residence.adminUsers[0].user : null
      const charges = await prisma.charge.findMany({ where: { residenceId: residence.id } })
      const payments = await prisma.payment.findMany({ where: { charge: { residenceId: residence.id } } })
      let unpaidChargesTotal = 0
      for (const charge of charges) {
        const chargePayments = payments.filter(p => p.chargeId === charge.id)
        const paidAmount = chargePayments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0)
        if (paidAmount < charge.amount) unpaidChargesTotal += (charge.amount - paidAmount)
      }
      const maintenanceRequests = await prisma.maintenanceRequest.findMany({ where: { residenceId: residence.id } })
      const openMaintenanceRequests = maintenanceRequests.filter(m => m.status !== 'COMPLETED' && m.status !== 'CANCELLED').length
      const paidPayments = payments.filter(p => p.status === 'PAID')
      const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0)
      return { id: residence.id, name: residence.name, address: residence.address, city: residence.city, postalCode: residence.postalCode, description: residence.description, imageUrl: residence.imageUrl, numberOfBuildings: residence.numberOfBuildings, numberOfApartments: residence.numberOfApartments, contactPhone: residence.contactPhone, email: residence.email, notes: residence.notes, status: residence.status, apartments: totalApartments, occupiedApartments, vacantApartments, occupancyRate, residents: residentCount, admin, unpaidCharges: unpaidChargesTotal, totalRevenue, openMaintenanceRequests, createdAt: residence.createdAt }
    }))
    const groupedByCity: Record<string, typeof formattedResidences> = {}
    for (const residence of formattedResidences) {
      const city = residence.city
      if (!groupedByCity[city]) groupedByCity[city] = []
      groupedByCity[city].push(residence)
    }
    return NextResponse.json({ residences: formattedResidences, groupedByCity })
  } catch (error) {
    console.error('Error fetching residences:', error)
    return NextResponse.json({ error: 'Failed to fetch residences' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { name, address, city, postalCode, description, numberOfBuildings, numberOfApartments, contactPhone, email, notes, adminUserId } = body
    if (!name || !address || !city) {
      return NextResponse.json({ error: 'Name, address, and city are required' }, { status: 400 })
    }
    const organizationId = session.user.organizationId
    if (!organizationId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 })
    }
    const residence = await prisma.residence.create({
      data: { name, address, city, postalCode: postalCode || null, description: description || null, numberOfBuildings: numberOfBuildings || null, numberOfApartments: numberOfApartments || null, contactPhone: contactPhone || null, email: email || null, notes: notes || null, organizationId }
    })
    if (adminUserId) {
      await prisma.user.update({ where: { id: adminUserId }, data: { role: 'ADMIN', adminForResidenceId: residence.id } })
      await prisma.admin.create({ data: { userId: adminUserId, residenceId: residence.id } })
    }
    return NextResponse.json(residence)
  } catch (error) {
    console.error('Error creating residence:', error)
    return NextResponse.json({ error: 'Failed to create residence' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { id, name, address, city, postalCode, description, numberOfBuildings, numberOfApartments, contactPhone, email, notes, status, adminUserId } = body
    if (!id) return NextResponse.json({ error: 'Residence ID is required' }, { status: 400 })
    const existingResidence = await prisma.residence.findUnique({ where: { id } })
    if (!existingResidence) return NextResponse.json({ error: 'Residence not found' }, { status: 404 })
    const updateData: any = {}
    if (name) updateData.name = name
    if (address) updateData.address = address
    if (city) updateData.city = city
    if (postalCode !== undefined) updateData.postalCode = postalCode
    if (description !== undefined) updateData.description = description
    if (numberOfBuildings !== undefined) updateData.numberOfBuildings = numberOfBuildings
    if (numberOfApartments !== undefined) updateData.numberOfApartments = numberOfApartments
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone
    if (email !== undefined) updateData.email = email
    if (notes !== undefined) updateData.notes = notes
    if (status) updateData.status = status
    const residence = await prisma.residence.update({ where: { id }, data: updateData })
    if (adminUserId) {
      const currentAdmins = await prisma.admin.findMany({ where: { residenceId: id } })
      for (const admin of currentAdmins) {
        await prisma.user.update({ where: { id: admin.userId }, data: { role: 'RESIDENT', adminForResidenceId: null } })
        await prisma.admin.delete({ where: { id: admin.id } })
      }
      await prisma.user.update({ where: { id: adminUserId }, data: { role: 'ADMIN', adminForResidenceId: id } })
      await prisma.admin.create({ data: { userId: adminUserId, residenceId: id } })
    }
    return NextResponse.json(residence)
  } catch (error) {
    console.error('Error updating residence:', error)
    return NextResponse.json({ error: 'Failed to update residence' }, { status: 500 })
  }
}
