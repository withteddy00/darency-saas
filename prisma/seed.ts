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

  // =====================================================
  // CREATE MULTIPLE RESIDENCES (for testing admin scoping)
  // =====================================================
  
  // Residence 1: Al-Manar (Casablanca)
  const residence1 = await prisma.residence.create({
    data: {
      name: 'Résidence Al-Manar',
      address: '45 Boulevard Zerktouni',
      city: 'Casablanca',
      postalCode: '20100',
      description: 'Modern residential building in the heart of Casablanca',
      organizationId: org.id
    }
  })
  console.log('✅ Created Residence:', residence1.name)

  // Residence 2: Assa (Rabat)
  const residence2 = await prisma.residence.create({
    data: {
      name: 'Résidence Assa',
      address: '12 Avenue Hassan II',
      city: 'Rabat',
      postalCode: '10000',
      description: 'Elegant residence in Rabat',
      organizationId: org.id
    }
  })
  console.log('✅ Created Residence:', residence2.name)

  // Residence 3: Oasis (Marrakech)
  const residence3 = await prisma.residence.create({
    data: {
      name: 'Résidence Oasis',
      address: '88 Rue Mohammed V',
      city: 'Marrakech',
      postalCode: '40000',
      description: 'Luxurious residence in Marrakech',
      organizationId: org.id
    }
  })
  console.log('✅ Created Residence:', residence3.name)

  // =====================================================
  // CREATE APARTMENTS FOR EACH RESIDENCE
  // =====================================================

  // Apartments for Residence 1 (Al-Manar)
  const apartments1 = await Promise.all([
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
        residenceId: residence1.id
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
        residenceId: residence1.id
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
        residenceId: residence1.id
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
        residenceId: residence1.id
      }
    })
  ])
  console.log('✅ Created', apartments1.length, 'apartments for Residence 1')

  // Apartments for Residence 2 (Assa)
  const apartments2 = await Promise.all([
    prisma.apartment.create({
      data: {
        number: '101',
        floor: 1,
        building: 'A',
        type: 'T2',
        status: 'OCCUPIED',
        area: 80,
        bedrooms: 2,
        bathrooms: 1,
        rentAmount: 3200,
        residenceId: residence2.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: '102',
        floor: 1,
        building: 'A',
        type: 'T2',
        status: 'VACANT',
        area: 85,
        bedrooms: 2,
        bathrooms: 1,
        rentAmount: 3400,
        residenceId: residence2.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: '201',
        floor: 2,
        building: 'B',
        type: 'T3',
        status: 'OCCUPIED',
        area: 110,
        bedrooms: 3,
        bathrooms: 2,
        rentAmount: 4500,
        residenceId: residence2.id
      }
    })
  ])
  console.log('✅ Created', apartments2.length, 'apartments for Residence 2')

  // Apartments for Residence 3 (Oasis)
  const apartments3 = await Promise.all([
    prisma.apartment.create({
      data: {
        number: 'A1',
        floor: 1,
        building: 'A',
        type: 'Studio',
        status: 'OCCUPIED',
        area: 45,
        bedrooms: 1,
        bathrooms: 1,
        rentAmount: 2500,
        residenceId: residence3.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: 'A2',
        floor: 1,
        building: 'A',
        type: 'T2',
        status: 'VACANT',
        area: 75,
        bedrooms: 2,
        bathrooms: 1,
        rentAmount: 3000,
        residenceId: residence3.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: 'B1',
        floor: 2,
        building: 'B',
        type: 'T4',
        status: 'OCCUPIED',
        area: 130,
        bedrooms: 4,
        bathrooms: 2,
        rentAmount: 6000,
        residenceId: residence3.id
      }
    })
  ])
  console.log('✅ Created', apartments3.length, 'apartments for Residence 3')

  // Hash passwords
  const ownerPassword = await bcrypt.hash('Owner123!', 10)
  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const residentPassword = await bcrypt.hash('Resident123!', 10)

  // =====================================================
  // CREATE USERS WITH PROPER ROLE SCOPING
  // =====================================================

  // =====================================================
  // OWNER: Global platform admin - NOT tied to any residence
  // Can see ALL residences in the organization
  // =====================================================
  const owner = await prisma.user.create({
    data: {
      email: 'owner@darency.ma',
      password: ownerPassword,
      name: 'Mohamed Owner',
      role: 'OWNER',
      phone: '+212 661 123 456',
      organizationId: org.id
      // NOTE: adminForResidenceId is NULL for OWNER - this is intentional
      // OWNER is global and can access all residences
    }
  })
  console.log('✅ Created OWNER user:', owner.email, '(global, no residence assigned)')

  // =====================================================
  // ADMIN: Syndic/Manager - MUST be linked to ONE residence
  // Each admin manages exactly one residence
  // =====================================================
  
  // Admin 1: Manages Residence 1 (Al-Manar)
  const admin1 = await prisma.user.create({
    data: {
      email: 'admin@darency.ma',
      password: adminPassword,
      name: 'Fatima Admin',
      role: 'ADMIN',
      phone: '+212 662 234 567',
      organizationId: org.id,
      adminForResidenceId: residence1.id  // Required for ADMIN role
    }
  })
  console.log('✅ Created ADMIN user:', admin1.email, '(assigned to:', residence1.name + ')')

  // Create ADMIN profile in Admin table
  await prisma.admin.create({
    data: {
      userId: admin1.id,
      residenceId: residence1.id
    }
  })

  // Admin 2: Manages Residence 2 (Assa) - for testing single-residence constraint
  const admin2 = await prisma.user.create({
    data: {
      email: 'admin-rabat@darency.ma',
      password: adminPassword,
      name: 'Youssef Admin',
      role: 'ADMIN',
      phone: '+212 663 345 678',
      organizationId: org.id,
      adminForResidenceId: residence2.id  // Different residence - different admin
    }
  })
  console.log('✅ Created ADMIN user:', admin2.email, '(assigned to:', residence2.name + ')')

  await prisma.admin.create({
    data: {
      userId: admin2.id,
      residenceId: residence2.id
    }
  })

  // =====================================================
  // RESIDENTS: Linked to specific apartments
  // =====================================================
  const residents = await Promise.all([
    prisma.user.create({
      data: {
        email: 'resident@darency.ma',
        password: residentPassword,
        name: 'Ahmed Resident',
        role: 'RESIDENT',
        phone: '+212 664 456 789',
        organizationId: org.id,
        apartmentId: apartments1[0].id
      }
    }),
    prisma.user.create({
      data: {
        email: 'youssef@darency.ma',
        password: residentPassword,
        name: 'Youssef Amrani',
        role: 'RESIDENT',
        phone: '+212 665 567 890',
        organizationId: org.id,
        apartmentId: apartments1[1].id
      }
    }),
    prisma.user.create({
      data: {
        email: 'fatima@darency.ma',
        password: residentPassword,
        name: 'Fatima El Amrani',
        role: 'RESIDENT',
        phone: '+212 666 678 901',
        organizationId: org.id,
        apartmentId: apartments1[3].id
      }
    }),
    // Resident in Residence 2 (Assa)
    prisma.user.create({
      data: {
        email: 'rachid@darency.ma',
        password: residentPassword,
        name: 'Rachid Benali',
        role: 'RESIDENT',
        phone: '+212 667 789 012',
        organizationId: org.id,
        apartmentId: apartments2[0].id
      }
    }),
    // Resident in Residence 3 (Oasis)
    prisma.user.create({
      data: {
        email: 'naima@darency.ma',
        password: residentPassword,
        name: 'Naima Khadija',
        role: 'RESIDENT',
        phone: '+212 668 890 123',
        organizationId: org.id,
        apartmentId: apartments3[0].id
      }
    })
  ])
  console.log('✅ Created RESIDENT users:', residents.length)

  // =====================================================
  // CREATE CHARGES FOR EACH RESIDENCE
  // =====================================================
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  // Create charges for Residence 1 (Al-Manar)
  const charges1 = await Promise.all([
    prisma.charge.create({
      data: {
        title: 'Charges communes Janvier 2026',
        category: 'OTHER',
        amount: 450,
        month: 1,
        year: 2026,
        dueDate: new Date('2026-01-31'),
        residenceId: residence1.id,
        apartmentId: apartments1[0].id
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
        residenceId: residence1.id,
        apartmentId: apartments1[0].id
      }
    }),
    prisma.charge.create({
      data: {
        title: 'Charges communes Janvier 2026',
        category: 'OTHER',
        amount: 500,
        month: 1,
        year: 2026,
        dueDate: new Date('2026-01-31'),
        residenceId: residence1.id,
        apartmentId: apartments1[1].id
      }
    })
  ])
  console.log('✅ Created charges for Residence 1')

  // Create charges for Residence 2 (Assa)
  const charges2 = await Promise.all([
    prisma.charge.create({
      data: {
        title: 'Charges communes Janvier 2026',
        category: 'OTHER',
        amount: 400,
        month: 1,
        year: 2026,
        dueDate: new Date('2026-01-31'),
        residenceId: residence2.id,
        apartmentId: apartments2[0].id
      }
    })
  ])
  console.log('✅ Created charges for Residence 2')

  // Create charges for Residence 3 (Oasis)
  const charges3 = await Promise.all([
    prisma.charge.create({
      data: {
        title: 'Charges communes Janvier 2026',
        category: 'OTHER',
        amount: 350,
        month: 1,
        year: 2026,
        dueDate: new Date('2026-01-31'),
        residenceId: residence3.id,
        apartmentId: apartments3[0].id
      }
    })
  ])
  console.log('✅ Created charges for Residence 3')

  // =====================================================
  // CREATE EXPENSES FOR EACH RESIDENCE
  // =====================================================
  
  // Expenses for Residence 1
  await Promise.all([
    prisma.expense.create({
      data: {
        description: 'Nettoyage espaces communs',
        amount: 1500,
        category: 'Services',
        date: new Date('2026-02-01'),
        residenceId: residence1.id
      }
    }),
    prisma.expense.create({
      data: {
        description: 'Entretien espaces verts',
        amount: 2500,
        category: 'Maintenance',
        date: new Date('2026-02-15'),
        residenceId: residence1.id
      }
    })
  ])
  console.log('✅ Created expenses for Residence 1')

  // Expenses for Residence 2
  await Promise.all([
    prisma.expense.create({
      data: {
        description: 'Sécurité',
        amount: 4000,
        category: 'Services',
        date: new Date('2026-02-01'),
        residenceId: residence2.id
      }
    })
  ])
  console.log('✅ Created expenses for Residence 2')

  // =====================================================
  // CREATE MAINTENANCE REQUESTS
  // =====================================================
  await Promise.all([
    prisma.maintenanceRequest.create({
      data: {
        title: 'Fuite d\'eau dans la cuisine',
        description: 'Il y a une fuite d\'eau sous l\'évier de la cuisine depuis 2 jours',
        status: 'PENDING',
        priority: 'HIGH',
        category: 'PLUMBING',
        residenceId: residence1.id,
        apartmentId: apartments1[0].id,
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
        residenceId: residence1.id,
        apartmentId: apartments1[1].id,
        reportedById: residents[1].id
      }
    }),
    prisma.maintenanceRequest.create({
      data: {
        title: 'Climatisation ne fonctionne pas',
        description: 'La climatisation ne cooling pas correctement',
        status: 'PENDING',
        priority: 'MEDIUM',
        category: 'HVAC',
        residenceId: residence2.id,
        apartmentId: apartments2[0].id,
        reportedById: residents[3].id
      }
    }),
    prisma.maintenanceRequest.create({
      data: {
        title: 'Éclairage couloir',
        description: 'L\'ampoule du couloir du 2ème étage est grillée',
        status: 'COMPLETED',
        priority: 'LOW',
        category: 'ELECTRICAL',
        residenceId: residence3.id,
        apartmentId: apartments3[2].id,
        reportedById: residents[4].id,
        resolvedAt: new Date('2026-02-20')
      }
    })
  ])
  console.log('✅ Created maintenance requests')

  console.log('\n🎉 Seed completed successfully!\n')
  console.log('Demo credentials:')
  console.log('  OWNER:    owner@darency.ma     / Owner123!   (global - all residences)')
  console.log('  ADMIN:    admin@darency.ma     / Admin123!   (Al-Manar only)')
  console.log('  ADMIN 2:  admin-rabat@darency.ma / Admin123!  (Assa only)')
  console.log('  RESIDENT: resident@darency.ma  / Resident123!')
  console.log('\nResidences:')
  console.log('  1. Résidence Al-Manar (Casablanca) - 4 apartments - Admin: Fatima Admin')
  console.log('  2. Résidence Assa (Rabat) - 3 apartments - Admin: Youssef Admin')
  console.log('  3. Résidence Oasis (Marrakech) - 3 apartments - No admin (for testing)')
}
