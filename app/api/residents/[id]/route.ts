export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get single resident
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OWNER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Resident ID is required' }, { status: 400 })
    }

    let filter: any = { id, role: 'RESIDENT' }
    
    if (session.user.role === 'ADMIN' && session.user.residenceId) {
      filter = { id, role: 'RESIDENT', apartment: { residenceId: session.user.residenceId } }
    } else if (session.user.role === 'OWNER') {
      filter = { id, role: 'RESIDENT', organizationId: session.user.organizationId }
    }

    const resident = await prisma.user.findFirst({
      where: filter,
      include: {
        apartment: {
          include: {
            residence: {
              select: { id: true, name: true, city: true }
            }
          }
        }
      }
    })

    if (!resident) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: resident.id,
      name: resident.name,
      email: resident.email,
      phone: resident.phone,
      role: resident.role,
      apartment: resident.apartment ? {
        id: resident.apartment.id,
        number: resident.apartment.number,
        building: resident.apartment.building,
        floor: resident.apartment.floor,
        type: resident.apartment.type,
        status: resident.apartment.status,
        residence: resident.apartment.residence
      } : null,
      createdAt: resident.createdAt.toISOString()
    })
  } catch (error) {
    console.error('Error fetching resident:', error)
    return NextResponse.json({ error: 'Failed to fetch resident' }, { status: 500 })
  }
}
