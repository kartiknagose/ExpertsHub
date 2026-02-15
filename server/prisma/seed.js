const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@urbanpro.com' },
        update: {},
        create: {
            name: 'Admin User',
            email: 'admin@urbanpro.com',
            passwordHash: hashedPassword,
            mobile: '1234567890',
            role: 'ADMIN',
            emailVerified: true,
            isProfileComplete: true,
        },
    });

    console.log({ admin });

    // Create Services
    const services = [
        { name: 'Plumbing', category: 'Home Maintenance', basePrice: 500 },
        { name: 'Electrical', category: 'Home Maintenance', basePrice: 400 },
        { name: 'Cleaning', category: 'Home Maintenance', basePrice: 300 },
    ];

    for (const service of services) {
        await prisma.service.upsert({
            where: { name: service.name },
            update: service,
            create: service,
        });
    }

    // Create Test Worker (Verified)
    await prisma.user.upsert({
        where: { email: 'worker@test.com' },
        update: {
            isProfileComplete: false,
            emailVerified: true
        },
        create: {
            name: 'Test Worker',
            email: 'worker@test.com',
            passwordHash: hashedPassword,
            mobile: '1112223333',
            role: 'WORKER',
            emailVerified: true,
            isProfileComplete: false,
            workerProfile: {
                create: {
                    skills: ['Plumbing', 'Electrical'],
                    bio: 'Professional maintenance expert available for home services.',
                    isVerified: true
                }
            }
        }
    });

    // Create Test Customer (Verified)
    await prisma.user.upsert({
        where: { email: 'customer@test.com' },
        update: {
            isProfileComplete: false,
            emailVerified: true
        },
        create: {
            name: 'Test Customer',
            email: 'customer@test.com',
            passwordHash: hashedPassword,
            mobile: '4445556666',
            role: 'CUSTOMER',
            emailVerified: true,
            isProfileComplete: false
        }
    });

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
