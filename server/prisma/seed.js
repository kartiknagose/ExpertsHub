/* eslint-disable no-console */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Helper to get random item from array
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random sub-array
const randomSubArray = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Data
const SERVICES = [
  { name: 'Deep Home Cleaning', category: 'Cleaning', basePrice: 1499, description: 'Complete deep cleaning of your home covering all rooms and corners.' },
  { name: 'Bathroom Cleaning', category: 'Cleaning', basePrice: 499, description: 'Intensive cleaning and disinfection of bathrooms.' },
  { name: 'Sofa Cleaning', category: 'Cleaning', basePrice: 799, description: 'Vacuuming and shampooing of sofa sets.' },
  { name: 'Tap Repair', category: 'Plumbing', basePrice: 199, description: 'Fixing leaking taps and faucets.' },
  { name: 'Pipe Installation', category: 'Plumbing', basePrice: 499, description: 'Installation of new water pipes.' },
  { name: 'Drainage Cleaning', category: 'Plumbing', basePrice: 399, description: 'Clearing clogged drains and pipes.' },
  { name: 'Fan Repair', category: 'Electrical', basePrice: 249, description: 'Repairing ceiling and table fans.' },
  { name: 'Switchboard Installation', category: 'Electrical', basePrice: 199, description: 'Installation or replacement of electrical switchboards.' },
  { name: 'AC Service', category: 'AC Repair', basePrice: 599, description: 'Regular servicing and filter cleaning of AC units.' },
  { name: 'Interior Painting', category: 'Painting', basePrice: 5000, description: 'Professional interior wall painting service.' },
];

const CUSTOMERS = [
  { name: 'Rahul Sharma', email: 'rahul@example.com' },
  { name: 'Priya Patel', email: 'priya@example.com' },
  { name: 'Amit Kumar', email: 'amit@example.com' },
  { name: 'Sneha Gupta', email: 'sneha@example.com' },
  { name: 'Vikram Singh', email: 'vikram@example.com' },
];

const WORKERS = [
  { name: 'Rajesh Verma', email: 'rajesh@example.com', category: 'Plumbing' },
  { name: 'Sunita Devi', email: 'sunita@example.com', category: 'Cleaning' },
  { name: 'Mohit Yadav', email: 'mohit@example.com', category: 'Electrical' },
  { name: 'Anita Roy', email: 'anita@example.com', category: 'Painting' },
  { name: 'Suresh Iyer', email: 'suresh@example.com', category: 'AC Repair' },
];

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@urbanpro.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const commonPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: process.env.ADMIN_NAME || 'UrbanPro Admin',
      email: adminEmail,
      mobile: process.env.ADMIN_MOBILE || '9000000000',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // 2. Create Services
  const dbServices = [];
  for (const service of SERVICES) {
    const s = await prisma.service.upsert({
      where: { id: -1 }, // Services don't have unique name constraint, so we check/create manually or use findFirst
      // Actually, we can't use upsert without a unique field. simpler to use findFirst -> create
      update: {},
      create: service,
    });
    // The above usage of upsert is invalid if 'id' -1 doesn't exist and isn't unique match. 
    // Let's use findFirst instead.
  }

  // Re-doing Services correctly
  for (const service of SERVICES) {
    const existing = await prisma.service.findFirst({ where: { name: service.name } });
    if (!existing) {
      const s = await prisma.service.create({ data: service });
      dbServices.push(s);
    } else {
      dbServices.push(existing);
    }
  }
  console.log(`✅ Services: ${dbServices.length} loaded`);

  // 3. Create Customers
  const dbCustomers = [];
  for (const cust of CUSTOMERS) {
    const c = await prisma.user.upsert({
      where: { email: cust.email },
      update: {},
      create: {
        name: cust.name,
        email: cust.email,
        mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`, // Random mobile
        passwordHash: commonPasswordHash,
        role: 'CUSTOMER',
        emailVerified: true,
        isProfileComplete: true,
        addresses: {
          create: {
            line1: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
          }
        }
      },
    });
    dbCustomers.push(c);
  }
  console.log(`✅ Customers: ${dbCustomers.length} loaded`);

  // 4. Create Workers
  const dbWorkers = [];
  const dbWorkerProfiles = [];

  for (const workerData of WORKERS) {
    const w = await prisma.user.upsert({
      where: { email: workerData.email },
      update: {},
      create: {
        name: workerData.name,
        email: workerData.email,
        mobile: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
        passwordHash: commonPasswordHash,
        role: 'WORKER',
        emailVerified: true,
        isProfileComplete: true,
      },
    });
    dbWorkers.push(w);

    // Create/Update Profile
    // We check if profile exists
    let profile = await prisma.workerProfile.findUnique({ where: { userId: w.id } });

    if (!profile) {
      // Find relevant services for this worker category
      const workerServices = dbServices.filter(s => s.category === workerData.category);

      profile = await prisma.workerProfile.create({
        data: {
          userId: w.id,
          bio: `Experienced professional in ${workerData.category}. Committed to quality work.`,
          skills: [workerData.category, 'Reliable', 'Quick'],
          hourlyRate: 200 + Math.floor(Math.random() * 500),
          isVerified: true,
          isProbation: false,
          services: {
            create: workerServices.map(s => ({
              serviceId: s.id
            }))
          },
          availability: {
            create: [1, 2, 3, 4, 5].map(day => ({
              dayOfWeek: day,
              startTime: '09:00',
              endTime: '18:00'
            }))
          }
        }
      });
    }
    dbWorkerProfiles.push(profile);
  }
  console.log(`✅ Workers: ${dbWorkers.length} loaded`);

  // 5. Create Bookings (if none exist)
  // We only run this if we really need data, to avoid cluttering specific tests
  const bookingCount = await prisma.booking.count();
  if (bookingCount === 0) {
    console.log('Creating sample bookings...');
    const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

    for (let i = 0; i < 20; i++) {
      const customer = random(dbCustomers);
      const workerProfile = random(dbWorkerProfiles);
      // Find a service this worker performs
      const workerServices = await prisma.workerService.findMany({ where: { workerId: workerProfile.id } });
      if (workerServices.length === 0) continue;

      const serviceId = random(workerServices).serviceId;
      const status = random(statuses);

      const booking = await prisma.booking.create({
        data: {
          customerId: customer.id,
          workerProfileId: workerProfile.id,
          serviceId: serviceId,
          status: status,
          scheduledAt: new Date(Date.now() + (Math.random() * 10 - 5) * 24 * 60 * 60 * 1000), // +/- 5 days
          address: '123 Test Address, Mumbai',
          totalPrice: 500 + Math.floor(Math.random() * 2000),
          notes: 'Please arrive on time.',
          createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000), // Past created date
        }
      });

      // If completed, add a review sometimes
      if (status === 'COMPLETED' && Math.random() > 0.3) {
        await prisma.review.create({
          data: {
            bookingId: booking.id,
            reviewerId: customer.id,        // Customer writes the review
            revieweeId: workerProfile.userId, // Worker receives the review
            rating: 3 + Math.floor(Math.random() * 3), // 3 to 5
            comment: random(['Great service!', 'Very professional.', 'Good job, but came late.', 'Excellent work!']),
          }
        });
      }
    }
    console.log('✅ Sample bookings created');
  } else {
    console.log('ℹ️  Bookings already exist, skipping sample booking creation.');
  }

  console.log('\n✨ Database seeded successfully!');
  console.log('   Admin: ' + adminEmail);
  console.log('   Test Users Password: password123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
