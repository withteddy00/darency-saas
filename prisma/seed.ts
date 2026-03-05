import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data
  await prisma.maintenanceRequest.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.apartment.deleteMany()
  await prisma.admin.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.residence.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  // Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Darency Property Management',
      slug: 'darency',
      email: 'contact@darency.ma',
      phone: '+212 522 123 456',
      address: '123 Avenue Mohammed V, Casablanca',
      city: 'Casablanca'
    }
  })
  console.log('✅ Created Organization:', org.name)

  // Create Residence
  const residence = await prisma.residence.create({
    data: {
      name: 'Résidence Al-Manar',
      address: '45 Boulevard Zerktouni',
      city: 'Casablanca',
      postalCode: '20100',
      description: 'Modern residential building in the heart of Casablanca',
      organizationId: org.id
    }
  })
  console.log('✅ Created Residence:', residence.name)

  // Create Apartments
  const apartments = await Promise.all([
    prisma.apartment.create({
      data: {
        number: 'A1',
        floor: 1,
        building: 'A',
        area: 85,
        bedrooms: 2,
        bathrooms: 1,
        rentAmount: 3500,
        residenceId: residence.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: 'A2',
        floor: 1,
        building: 'A',
        area: 95,
        bedrooms: 2,
        bathrooms: 2,
        rentAmount: 4000,
        residenceId: residence.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: 'B1',
        floor: 2,
        building: 'B',
        area: 120,
        bedrooms: 3,
        bathrooms: 2,
        rentAmount: 5500,
        residenceId: residence.id
      }
    })
  ])
  console.log('✅ Created', apartments.length, 'apartments')

  // Hash passwords
  const ownerPassword = await bcrypt.hash('Owner123!', 10)
  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const residentPassword = await bcrypt.hash('Resident123!', 10)

  // Create OWNER user
  const owner = await prisma.user.create({
    data: {
      email: 'owner@darency.ma',
      password: ownerPassword,
      name: 'Mohamed Owner',
      role: 'OWNER',
      phone: '+212 661 123 456',
      organizationId: org.id
    }
  })
  console.log('✅ Created OWNER user:', owner.email)

  // Create ADMIN user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@darency.ma',
      password: adminPassword,
      name: 'Fatima Admin',
      role: 'ADMIN',
      phone: '+212 662 234 567',
      organizationId: org.id,
      adminForResidenceId: residence.id
    }
  })
  console.log('✅ Created ADMIN user:', admin.email)

  // Create ADMIN profile
  await prisma.admin.create({
    data: {
      userId: admin.id,
      residenceId: residence.id
    }
  })

  // Create RESIDENT user
  const resident = await prisma.user.create({
    data: {
      email: 'resident@darency.ma',
      password: residentPassword,
      name: 'Ahmed Resident',
      role: 'RESIDENT',
      phone: '+212 663 345 678',
      organizationId: org.id,
      apartmentId: apartments[0].id
    }
  })
  console.log('✅ Created RESIDENT user:', resident.email)

  // Create sample expenses
  await Promise.all([
    prisma.expense.create({
      data: {
        description: 'Cleaning services',
        amount: 1500,
        category: 'Services',
        date: new Date('2026-02-01'),
        residenceId: residence.id
      }
    }),
    prisma.expense.create({
      data: {
        description: 'Elevator maintenance',
        amount: 2500,
        category: 'Maintenance',
        date: new Date('2026-02-15'),
        residenceId: residence.id
      }
    }),
    prisma.expense.create({
      data: {
        description: 'Security guard',
        amount: 4000,
        category: 'Services',
        date: new Date('2026-02-01'),
        residenceId: residence.id
      }
    })
  ])
  console.log('✅ Created sample expenses')

  // Create sample payments
  await Promise.all([
    prisma.payment.create({
      data: {
        amount: 3500,
        month: 3,
        year: 2026,
        status: 'PENDING',
        dueDate: new Date('2026-03-05'),
        apartmentId: apartments[0].id
      }
    }),
    prisma.payment.create({
      data: {
        amount: 4000,
        month: 3,
        year: 2026,
        status: 'PAID',
        dueDate: new Date('2026-03-01'),
        paidDate: new Date('2026-02-28'),
        apartmentId: apartments[1].id
      }
    }),
    prisma.payment.create({
      data: {
        amount: 5500,
        month: 3,
        year: 2026,
        status: 'PENDING',
        dueDate: new Date('2026-03-10'),
        apartmentId: apartments[2].id
      }
    })
  ])
  console.log('✅ Created sample payments')

  // Create sample maintenance requests
  await Promise.all([
    prisma.maintenanceRequest.create({
      data: {
        title: 'Fuite d\'eau dans la cuisine',
        description: 'Il y a une fuite d\'eau sous l\'évier de la cuisine',
        status: 'PENDING',
        priority: 'HIGH',
        residenceId: residence.id,
        apartmentId: apartments[0].id,
        reportedById: resident.id
      }
    }),
    prisma.maintenanceRequest.create({
      data: {
        title: 'Panne d\'ascenseur',
        description: 'L\'ascenseur ne fonctionne plus depuis hier',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        residenceId: residence.id,
        apartmentId: apartments[1].id,
        reportedById: admin.id
      }
    }),
    prisma.maintenanceRequest.create({
      data: {
        title: 'Éclairage couloir',
        description: 'L\'ampoule du couloir du 2ème étage est grillée',
        status: 'COMPLETED',
        priority: 'LOW',
        residenceId: residence.id,
        apartmentId: apartments[2].id,
        reportedById: resident.id,
        resolvedAt: new Date('2026-02-20')
      }
    })
  ])
  console.log('✅ Created sample maintenance requests')

  console.log('\n🎉 Seed completed successfully!\n')
  console.log('Demo credentials:')
  console.log('  OWNER:    owner@darency.ma    / Owner123!')
  console.log('  ADMIN:    admin@darency.ma    / Admin123!')
  console.log('  RESIDENT: resident@darency.ma / Resident123!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
