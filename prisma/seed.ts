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

  // Apartments for Residence 1 (Al-Manar) - 8 apartments
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
    }),
    prisma.apartment.create({
      data: {
        number: 'C1',
        floor: 3,
        building: 'C',
        type: 'Studio',
        status: 'OCCUPIED',
        area: 55,
        bedrooms: 1,
        bathrooms: 1,
        rentAmount: 2800,
        residenceId: residence1.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: 'C2',
        floor: 3,
        building: 'C',
        type: 'T2',
        status: 'VACANT',
        area: 80,
        bedrooms: 2,
        bathrooms: 1,
        rentAmount: 3600,
        residenceId: residence1.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: 'D1',
        floor: 4,
        building: 'D',
        type: 'T5',
        status: 'OCCUPIED',
        area: 150,
        bedrooms: 4,
        bathrooms: 3,
        rentAmount: 7000,
        residenceId: residence1.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: 'D2',
        floor: 4,
        building: 'D',
        type: 'T4',
        status: 'MAINTENANCE',
        area: 130,
        bedrooms: 3,
        bathrooms: 2,
        rentAmount: 6000,
        residenceId: residence1.id
      }
    })
  ])
  console.log('✅ Created', apartments1.length, 'apartments for Residence 1')

  // Apartments for Residence 2 (Assa) - 6 apartments
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
        building: 'A',
        type: 'T3',
        status: 'OCCUPIED',
        area: 110,
        bedrooms: 3,
        bathrooms: 2,
        rentAmount: 4500,
        residenceId: residence2.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: '202',
        floor: 2,
        building: 'A',
        type: 'T2',
        status: 'OCCUPIED',
        area: 90,
        bedrooms: 2,
        bathrooms: 1,
        rentAmount: 3600,
        residenceId: residence2.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: '301',
        floor: 3,
        building: 'B',
        type: 'T4',
        status: 'VACANT',
        area: 125,
        bedrooms: 3,
        bathrooms: 2,
        rentAmount: 5200,
        residenceId: residence2.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: '302',
        floor: 3,
        building: 'B',
        type: 'T3',
        status: 'OCCUPIED',
        area: 105,
        bedrooms: 2,
        bathrooms: 2,
        rentAmount: 4200,
        residenceId: residence2.id
      }
    })
  ])
  console.log('✅ Created', apartments2.length, 'apartments for Residence 2')

  // Apartments for Residence 3 (Oasis) - 6 apartments
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
        building: 'A',
        type: 'T2',
        status: 'OCCUPIED',
        area: 80,
        bedrooms: 2,
        bathrooms: 1,
        rentAmount: 3200,
        residenceId: residence3.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: 'B2',
        floor: 2,
        building: 'A',
        type: 'T3',
        status: 'OCCUPIED',
        area: 95,
        bedrooms: 2,
        bathrooms: 2,
        rentAmount: 3800,
        residenceId: residence3.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: 'C1',
        floor: 3,
        building: 'B',
        type: 'T4',
        status: 'OCCUPIED',
        area: 130,
        bedrooms: 4,
        bathrooms: 2,
        rentAmount: 6000,
        residenceId: residence3.id
      }
    }),
    prisma.apartment.create({
      data: {
        number: 'C2',
        floor: 3,
        building: 'B',
        type: 'T5',
        status: 'VACANT',
        area: 160,
        bedrooms: 4,
        bathrooms: 3,
        rentAmount: 7500,
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
  // Residence 1 (Al-Manar) - 5 residents
  const residentsRes1 = await Promise.all([
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
    prisma.user.create({
      data: {
        email: 'karim@darency.ma',
        password: residentPassword,
        name: 'Karim Bensaid',
        role: 'RESIDENT',
        phone: '+212 669 901 234',
        organizationId: org.id,
        apartmentId: apartments1[4].id
      }
    }),
    prisma.user.create({
      data: {
        email: 'lamia@darency.ma',
        password: residentPassword,
        name: 'Lamia Tahiri',
        role: 'RESIDENT',
        phone: '+212 670 123 456',
        organizationId: org.id,
        apartmentId: apartments1[6].id
      }
    })
  ])
  
  // Residence 2 (Assa) - 4 residents
  const residentsRes2 = await Promise.all([
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
    prisma.user.create({
      data: {
        email: 'salma@darency.ma',
        password: residentPassword,
        name: 'Salma El Idrissi',
        role: 'RESIDENT',
        phone: '+212 671 234 567',
        organizationId: org.id,
        apartmentId: apartments2[2].id
      }
    }),
    prisma.user.create({
      data: {
        email: 'othman@darency.ma',
        password: residentPassword,
        name: 'Othman El Fassi',
        role: 'RESIDENT',
        phone: '+212 672 345 678',
        organizationId: org.id,
        apartmentId: apartments2[3].id
      }
    }),
    prisma.user.create({
      data: {
        email: 'hind@darency.ma',
        password: residentPassword,
        name: 'Hind El Mensouri',
        role: 'RESIDENT',
        phone: '+212 673 456 789',
        organizationId: org.id,
        apartmentId: apartments2[5].id
      }
    })
  ])
  
  // Residence 3 (Oasis) - 4 residents
  const residentsRes3 = await Promise.all([
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
    }),
    prisma.user.create({
      data: {
        email: 'imane@darency.ma',
        password: residentPassword,
        name: 'Imane El Ghazali',
        role: 'RESIDENT',
        phone: '+212 674 567 890',
        organizationId: org.id,
        apartmentId: apartments3[2].id
      }
    }),
    prisma.user.create({
      data: {
        email: 'yassine@darency.ma',
        password: residentPassword,
        name: 'Yassine Bouali',
        role: 'RESIDENT',
        phone: '+212 675 678 901',
        organizationId: org.id,
        apartmentId: apartments3[3].id
      }
    }),
    prisma.user.create({
      data: {
        email: 'sara@darency.ma',
        password: residentPassword,
        name: 'Sara El Alami',
        role: 'RESIDENT',
        phone: '+212 676 789 012',
        organizationId: org.id,
        apartmentId: apartments3[4].id
      }
    })
  ])
  
  const residents = [...residentsRes1, ...residentsRes2, ...residentsRes3]
  console.log('✅ Created RESIDENT users:', residents.length)

  // =====================================================
  // CREATE CHARGES FOR EACH RESIDENCE
  // =====================================================
  
  // Create charges for Residence 1 (Al-Manar) - multiple apartments, multiple months
  const charges1 = await Promise.all([
    // January 2026 charges
    prisma.charge.create({ data: { title: 'Charges communes Janvier 2026', category: 'OTHER', amount: 450, month: 1, year: 2026, dueDate: new Date('2026-01-31'), residenceId: residence1.id, apartmentId: apartments1[0].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Janvier 2026', category: 'OTHER', amount: 500, month: 1, year: 2026, dueDate: new Date('2026-01-31'), residenceId: residence1.id, apartmentId: apartments1[1].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Janvier 2026', category: 'OTHER', amount: 600, month: 1, year: 2026, dueDate: new Date('2026-01-31'), residenceId: residence1.id, apartmentId: apartments1[3].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Janvier 2026', category: 'OTHER', amount: 350, month: 1, year: 2026, dueDate: new Date('2026-01-31'), residenceId: residence1.id, apartmentId: apartments1[4].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Janvier 2026', category: 'OTHER', amount: 700, month: 1, year: 2026, dueDate: new Date('2026-01-31'), residenceId: residence1.id, apartmentId: apartments1[6].id }}),
    // February 2026 charges
    prisma.charge.create({ data: { title: 'Charges communes Février 2026', category: 'OTHER', amount: 450, month: 2, year: 2026, dueDate: new Date('2026-02-28'), residenceId: residence1.id, apartmentId: apartments1[0].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Février 2026', category: 'OTHER', amount: 500, month: 2, year: 2026, dueDate: new Date('2026-02-28'), residenceId: residence1.id, apartmentId: apartments1[1].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Février 2026', category: 'OTHER', amount: 600, month: 2, year: 2026, dueDate: new Date('2026-02-28'), residenceId: residence1.id, apartmentId: apartments1[3].id }}),
  ])
  console.log('✅ Created charges for Residence 1')

  // Create charges for Residence 2 (Assa)
  const charges2 = await Promise.all([
    prisma.charge.create({ data: { title: 'Charges communes Janvier 2026', category: 'OTHER', amount: 400, month: 1, year: 2026, dueDate: new Date('2026-01-31'), residenceId: residence2.id, apartmentId: apartments2[0].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Janvier 2026', category: 'OTHER', amount: 450, month: 1, year: 2026, dueDate: new Date('2026-01-31'), residenceId: residence2.id, apartmentId: apartments2[2].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Janvier 2026', category: 'OTHER', amount: 420, month: 1, year: 2026, dueDate: new Date('2026-01-31'), residenceId: residence2.id, apartmentId: apartments2[3].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Janvier 2026', category: 'OTHER', amount: 480, month: 1, year: 2026, dueDate: new Date('2026-01-31'), residenceId: residence2.id, apartmentId: apartments2[5].id }}),
    // February 2026
    prisma.charge.create({ data: { title: 'Charges communes Février 2026', category: 'OTHER', amount: 400, month: 2, year: 2026, dueDate: new Date('2026-02-28'), residenceId: residence2.id, apartmentId: apartments2[0].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Février 2026', category: 'OTHER', amount: 450, month: 2, year: 2026, dueDate: new Date('2026-02-28'), residenceId: residence2.id, apartmentId: apartments2[2].id }}),
  ])
  console.log('✅ Created charges for Residence 2')

  // Create charges for Residence 3 (Oasis)
  const charges3 = await Promise.all([
    prisma.charge.create({ data: { title: 'Charges communes Janvier 2026', category: 'OTHER', amount: 350, month: 1, year: 2026, dueDate: new Date('2026-01-31'), residenceId: residence3.id, apartmentId: apartments3[0].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Janvier 2026', category: 'OTHER', amount: 380, month: 1, year: 2026, dueDate: new Date('2026-01-31'), residenceId: residence3.id, apartmentId: apartments3[2].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Janvier 2026', category: 'OTHER', amount: 400, month: 1, year: 2026, dueDate: new Date('2026-01-31'), residenceId: residence3.id, apartmentId: apartments3[3].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Janvier 2026', category: 'OTHER', amount: 550, month: 1, year: 2026, dueDate: new Date('2026-01-31'), residenceId: residence3.id, apartmentId: apartments3[4].id }}),
    // February 2026
    prisma.charge.create({ data: { title: 'Charges communes Février 2026', category: 'OTHER', amount: 350, month: 2, year: 2026, dueDate: new Date('2026-02-28'), residenceId: residence3.id, apartmentId: apartments3[0].id }}),
    prisma.charge.create({ data: { title: 'Charges communes Février 2026', category: 'OTHER', amount: 380, month: 2, year: 2026, dueDate: new Date('2026-02-28'), residenceId: residence3.id, apartmentId: apartments3[2].id }}),
  ])
  console.log('✅ Created charges for Residence 3')

  // =====================================================
  // CREATE EXPENSES FOR EACH RESIDENCE
  // =====================================================
  
  // Expenses for Residence 1 (Al-Manar)
  await Promise.all([
    prisma.expense.create({
      data: {
        description: 'Nettoyage espaces communs',
        amount: 1500,
        category: 'Services',
        date: new Date('2026-01-15'),
        residenceId: residence1.id
      }
    }),
    prisma.expense.create({
      data: {
        description: 'Entretien espaces verts',
        amount: 2500,
        category: 'Maintenance',
        date: new Date('2026-01-20'),
        residenceId: residence1.id
      }
    }),
    prisma.expense.create({
      data: {
        description: 'Réparation ascenseur',
        amount: 4500,
        category: 'Maintenance',
        date: new Date('2026-02-10'),
        residenceId: residence1.id
      }
    }),
    prisma.expense.create({
      data: {
        description: 'Électricité communs',
        amount: 3200,
        category: 'Utilities',
        date: new Date('2026-02-01'),
        residenceId: residence1.id
      }
    })
  ])
  console.log('✅ Created expenses for Residence 1')

  // Expenses for Residence 2 (Assa)
  await Promise.all([
    prisma.expense.create({
      data: {
        description: 'Sécurité',
        amount: 4000,
        category: 'Services',
        date: new Date('2026-01-15'),
        residenceId: residence2.id
      }
    }),
    prisma.expense.create({
      data: {
        description: 'Nettoyage',
        amount: 1800,
        category: 'Services',
        date: new Date('2026-02-01'),
        residenceId: residence2.id
      }
    }),
    prisma.expense.create({
      data: {
        description: 'Entretien piscine',
        amount: 2200,
        category: 'Maintenance',
        date: new Date('2026-02-15'),
        residenceId: residence2.id
      }
    })
  ])
  console.log('✅ Created expenses for Residence 2')

  // Expenses for Residence 3 (Oasis)
  await Promise.all([
    prisma.expense.create({
      data: {
        description: 'Sécurité et gardiennage',
        amount: 5000,
        category: 'Services',
        date: new Date('2026-01-15'),
        residenceId: residence3.id
      }
    }),
    prisma.expense.create({
      data: {
        description: 'Entretien jardin',
        amount: 2000,
        category: 'Maintenance',
        date: new Date('2026-02-01'),
        residenceId: residence3.id
      }
    })
  ])
  console.log('✅ Created expenses for Residence 3')

  // =====================================================
  // CREATE MAINTENANCE REQUESTS
  // =====================================================
  
  // Maintenance requests for Residence 1 (Al-Manar)
  const maintenanceRes1 = await Promise.all([
    prisma.maintenanceRequest.create({
      data: {
        title: 'Fuite d\'eau dans la cuisine',
        description: 'Il y a une fuite d\'eau sous l\'évier de la cuisine depuis 2 jours',
        status: 'PENDING',
        priority: 'HIGH',
        category: 'PLUMBING',
        residenceId: residence1.id,
        apartmentId: apartments1[0].id,
        reportedById: residentsRes1[0].id
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
        reportedById: residentsRes1[1].id
      }
    }),
    prisma.maintenanceRequest.create({
      data: {
        title: 'Porte d\'entrée endommagée',
        description: 'La porte d\'entrée du bâtiment A ne ferme plus correctement',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        category: 'OTHER',
        residenceId: residence1.id,
        apartmentId: apartments1[2].id,
        reportedById: residentsRes1[2].id,
        resolvedAt: new Date('2026-02-15')
      }
    }),
    prisma.maintenanceRequest.create({
      data: {
        title: 'Bruit suspect dans la plumbing',
        description: 'Il y a un bruit strange dans les tuyaux d\'eau',
        status: 'PENDING',
        priority: 'LOW',
        category: 'PLUMBING',
        residenceId: residence1.id,
        apartmentId: apartments1[3].id,
        reportedById: residentsRes1[2].id
      }
    })
  ])
  
  // Maintenance requests for Residence 2 (Assa)
  const maintenanceRes2 = await Promise.all([
    prisma.maintenanceRequest.create({
      data: {
        title: 'Climatisation ne fonctionne pas',
        description: 'La climatisation ne cooling pas correctement',
        status: 'PENDING',
        priority: 'MEDIUM',
        category: 'HVAC',
        residenceId: residence2.id,
        apartmentId: apartments2[0].id,
        reportedById: residentsRes2[0].id
      }
    }),
    prisma.maintenanceRequest.create({
      data: {
        title: 'Piscine besoin d\'entretien',
        description: 'L\'eau de la piscine est trouble',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        category: 'MAINTENANCE',
        residenceId: residence2.id,
        apartmentId: apartments2[1].id,
        reportedById: residentsRes2[1].id
      }
    }),
    prisma.maintenanceRequest.create({
      data: {
        title: 'Interphone ne fonctionne pas',
        description: 'L\'interphone du bâtiment A est cassé',
        status: 'COMPLETED',
        priority: 'LOW',
        category: 'ELECTRICAL',
        residenceId: residence2.id,
        apartmentId: apartments2[2].id,
        reportedById: residentsRes2[1].id,
        resolvedAt: new Date('2026-02-18')
      }
    })
  ])
  
  // Maintenance requests for Residence 3 (Oasis)
  const maintenanceRes3 = await Promise.all([
    prisma.maintenanceRequest.create({
      data: {
        title: 'Éclairage couloir',
        description: 'L\'ampoule du couloir du 2ème étage est grillée',
        status: 'COMPLETED',
        priority: 'LOW',
        category: 'ELECTRICAL',
        residenceId: residence3.id,
        apartmentId: apartments3[2].id,
        reportedById: residentsRes3[1].id,
        resolvedAt: new Date('2026-02-20')
      }
    }),
    prisma.maintenanceRequest.create({
      data: {
        title: 'Jardin besoin d\'arrosage',
        description: 'Les plantes du jardin ont besoin d\'être arrosées',
        status: 'PENDING',
        priority: 'LOW',
        category: 'MAINTENANCE',
        residenceId: residence3.id,
        apartmentId: apartments3[3].id,
        reportedById: residentsRes3[2].id
      }
    }),
    prisma.maintenanceRequest.create({
      data: {
        title: 'Porte garage endommagée',
        description: 'La porte du garage ne s\'ouvre plus',
        status: 'PENDING',
        priority: 'HIGH',
        category: 'OTHER',
        residenceId: residence3.id,
        apartmentId: apartments3[4].id,
        reportedById: residentsRes3[3].id
      }
    })
  ])
  
  console.log('✅ Created maintenance requests')

  // =====================================================
  // CREATE PAYMENTS FOR CHARGES
  // =====================================================
  
  // Get charges for each residence
  const allCharges = await prisma.charge.findMany({
    include: { apartment: true }
  })

  // Create some payments (some PAID, some PENDING)
  // Note: dueDate is required for all payments in the schema
  const payments = await Promise.all([
    // Payment for Residence 1 - PAID
    prisma.payment.create({
      data: {
        amount: 450,
        status: 'PAID',
        paidDate: new Date('2026-01-15'),
        dueDate: new Date('2026-01-31'),
        chargeId: charges1[0].id,
        apartmentId: apartments1[0].id
      }
    }),
    // Payment for Residence 1 - PENDING (unpaid)
    prisma.payment.create({
      data: {
        amount: 450,
        status: 'PENDING',
        dueDate: new Date('2026-02-28'),
        chargeId: charges1[1].id,
        apartmentId: apartments1[0].id
      }
    }),
    // Payment for Residence 1 - PAID
    prisma.payment.create({
      data: {
        amount: 500,
        status: 'PAID',
        paidDate: new Date('2026-01-20'),
        dueDate: new Date('2026-01-31'),
        chargeId: charges1[2].id,
        apartmentId: apartments1[1].id
      }
    }),
    // Payment for Residence 2 - PAID
    prisma.payment.create({
      data: {
        amount: 400,
        status: 'PAID',
        paidDate: new Date('2026-01-18'),
        dueDate: new Date('2026-01-31'),
        chargeId: charges2[0].id,
        apartmentId: apartments2[0].id
      }
    }),
    // Payment for Residence 3 - PAID
    prisma.payment.create({
      data: {
        amount: 350,
        status: 'PAID',
        paidDate: new Date('2026-01-22'),
        dueDate: new Date('2026-01-31'),
        chargeId: charges3[0].id,
        apartmentId: apartments3[0].id
      }
    })
  ])
  console.log('✅ Created payments')

  console.log('\n🎉 Seed completed successfully!\n')
  console.log('Demo credentials:')
  console.log('  OWNER:    owner@darency.ma       / Owner123!   (global - all residences)')
  console.log('  ADMIN:    admin@darency.ma       / Admin123!   (Al-Manar only)')
  console.log('  ADMIN 2:  admin-rabat@darency.ma / Admin123!   (Assa only)')
  console.log('  RESIDENT: resident@darency.ma    / Resident123!')
  console.log('\nData Summary:')
  console.log('  3 Residences:')
  console.log('    - Résidence Al-Manar (Casablanca): 8 apartments, 5 residents, Admin: Fatima')
  console.log('    - Résidence Assa (Rabat): 6 apartments, 4 residents, Admin: Youssef')
  console.log('    - Résidence Oasis (Marrakech): 6 apartments, 4 residents, No admin')
  console.log('  Total: 20 apartments, 13 residents, 2 admins, 2 owners')
  console.log('  Charges, expenses, payments, and maintenance requests included')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
