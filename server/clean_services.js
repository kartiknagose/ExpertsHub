const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
    try {
        await prisma.service.deleteMany();
        console.log('Cleared services table');
    } catch (error) {
        console.error('Error clearing services:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clean();
