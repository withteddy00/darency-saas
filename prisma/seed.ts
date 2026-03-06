import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up existing data
  await prisma.maintenanceRequest.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.charge.deleteMany()
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
        type: 'T2',
        status: 'OCCUPIED',
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
        type: 'T3',
        status: 'OCCUPIED',
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
        type: 'T4',
        status: 'VACANT',
        area: 120,
        bedrooms: 3,
        bathrooms: 2,
        rentAmount: 5500,
        residenceId: residence.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: 'B2',
        floor: 2,
        building: 'B',
        type: 'T3',
        status: 'OCCUPIED',
        area: 100,
        bedrooms: 2,
        bathrooms: 2,
        rentAmount: 4800,
        residenceId: residence.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: 'C1',
        floor: 3,
        building: 'C',
        type: 'Studio',
        status: 'VACANT',
        area: 45,
        bedrooms: 1,
        bathrooms: 1,
        rentAmount: 2500,
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

  // Create RESIDENT users
  const residents = await Promise.all([
    prisma.user.create({
      data: {
        email: 'resident@darency.ma',
        password: residentPassword,
        name: 'Ahmed Resident',
        role: 'RESIDENT',
        phone: '+212 663 345 678',
        organizationId: org.id,
        apartmentId: apartments[0].id
      }
    }),
    prisma.user.create({
      data: {
        email: 'youssef@darency.ma',
        password: residentPassword,
        name: 'Youssef Amrani',
        role: 'RESIDENT',
        phone: '+212 664 456 789',
        organizationId: org.id,
        apartmentId: apartments[1].id
      }
    }),
    prisma.user.create({
      data: {
        email: 'fatima@darency.ma',
        password: residentPassword,
        name: 'Fatima El Amrani',
        role: 'RESIDENT',
        phone: '+212 665 567 890',
        organizationId: org.id,
        apartmentId: apartments[3].id
      }
    })
  ])
  console.log('✅ Created RESIDENT users:', residents.length)

  // Create Charges
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const charges = await Promise.all([
    // Apartment A1 charges
    prisma.charge.create({
      data: {
        title: 'Charges communes Janvier 2026',
        category: 'OTHER',
        amount: 450,
        month: 1,
        year: 2026,
        dueDate: new Date('2026-01-31'),
        residenceId: residence.id,
        apartmentId: apartments[0].id
      }
    }),
    prisma.charge.create({
      data: {
        title: 'Charges communes Février 2026',
        category: 'OTHER',
        amount: 450,
        month: 2,
        year: 2026,
        dueDate: new Date('2026-02-28'),
        residenceId: residence.id,
        apartmentId: apartments[0].id
      }
    }),
    // Apartment A2 charges
    prisma.charge.create({
      data: {
        title: 'Charges communes Janvier 2026',
        category: 'OTHER',
        amount: 520,
        month: 1,
        year: 2026,
        dueDate: new Date('2026-01-31'),
        residenceId: residence.id,
        apartmentId: apartments[1].id
      }
    }),
    // Apartment B2 charges
    prisma.charge.create({
      data: {
        title: 'Charges communes Janvier 2026',
        category: 'OTHER',
        amount: 480,
        month: 1,
        year: 2026,
        dueDate: new Date('2026-01-31'),
        residenceId: residence.id,
        apartmentId: apartments[3].id
      }
    })
  ])
  console.log('✅ Created', charges.length, 'charges')

  // Create Payments
  const payments = await Promise.all([
    // A1 - Paid for January
    prisma.payment.create({
      data: {
        amount: 450,
        status: 'PAID',
        method: 'TRANSFER',
        dueDate: new Date('2026-01-31'),
        paidDate: new Date('2026-01-28'),
        apartmentId: apartments[0].id,
        chargeId: charges[0].id
      }
    }),
    // A1 - Pending for February
    prisma.payment.create({
      data: {
        amount: 450,
        status: 'PENDING',
        dueDate: new Date('2026-02-28'),
        apartmentId: apartments[0].id,
        chargeId: charges[1].id
      }
    }),
    // A2 - Paid for January
    prisma.payment.create({
      data: {
        amount: 520,
        status: 'PAID',
        method: 'CARD',
        dueDate: new Date('2026-01-31'),
        paidDate: new Date('2026-01-25'),
        apartmentId: apartments[1].id,
        chargeId: charges[2].id
      }
    }),
    // B2 - Paid for January
    prisma.payment.create({
      data: {
        amount: 480,
        status: 'PAID',
        method: 'CASH',
        dueDate: new Date('2026-01-31'),
        paidDate: new Date('2026-01-30'),
        apartmentId: apartments[3].id,
        chargeId: charges[3].id
      }
    })
  ])
  console.log('✅ Created', payments.length, 'payments')

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

  // Create sample maintenance requests
  await Promise.all([
    prisma.maintenanceRequest.create({
      data: {
        title: 'Fuite d\'eau dans la cuisine',
        description: 'Il y a une fuite d\'eau sous l\'évier de la cuisine depuis 2 jours',
        status: 'PENDING',
        priority: 'HIGH',
        category: 'PLUMBING',
        residenceId: residence.id,
        apartmentId: apartments[0].id,
        reportedById: residents[0].id
      }
    }),
    prisma.maintenanceRequest.create({
      data: {
        title: 'Panne d\'ascenseur',
        description: 'L\'ascenseur ne fonctionne plus depuis hier au niveau du bâtiment B',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        category: 'ELEVATOR',
        residenceId: residence.id,
        apartmentId: apartments[1].id,
        reportedById: residents[1].id
      }
    }),
    prisma.maintenanceRequest.create({
      data: {
        title: 'Éclairage couloir',
        description: 'L\'ampoule du couloir du 2ème étage est grillée',
        status: 'COMPLETED',
        priority: 'LOW',
        category: 'ELECTRICAL',
        residenceId: residence.id,
        apartmentId: apartments[2].id,
        reportedById: residents[2].id,
        resolvedAt: new Date('2026-02-20')
      }
    }),
    prisma.maintenanceRequest.create({
      data: {
        title: 'Climatisation ne fonctionne pas',
        description: 'La climatisation ne cooling pas correctement',
        status: 'PENDING',
        priority: 'MEDIUM',
        category: 'HVAC',
        residenceId: residence.id,
        apartmentId: apartments[0].id,
        reportedById: residents[0].id
      }
    })
  ])
  console.log('✅ Created sample maintenance requests')

  console.log('\n🎉 Seed completed successfully!\n')
  console.log('Demo credentials:')
  console.log('  OWNER:    owner@darency.ma    / Owner123!')
  console.log('  ADMIN:    admin@darency.ma    / Admin123!')
  console.log('  RESIDENT: resident@darency.ma / Resident123!')
  console.log('\nApartments:')
  console.log('  A1 (T2) - Ahmed Resident')
  console.log('  A2 (T3) - Youssef Amrani')
  console.log('  B1 (T4) - Vacant')
  console.log('  B2 (T3) - Fatima El Amrani')
  console.log('  C1 (Studio) - Vacant')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
