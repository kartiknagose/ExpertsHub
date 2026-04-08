const prisma = require('./src/config/prisma');

async function main() {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    console.log('PRISMA_QUERY_OK=true');
  } catch (error) {
    console.log('PRISMA_QUERY_OK=false');
    console.log(error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
