const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing database...');

    const props = await prisma.property.findMany({
      where: {
        category: 'PROPERTY_SALE',
        moderationStatus: 'APPROVED',
        isActive: true
      }
    });

    console.log('Approved property sales:', props.length);
    props.forEach(p => console.log(p.title, p.id));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
