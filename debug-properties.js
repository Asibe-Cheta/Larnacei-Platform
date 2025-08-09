const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugProperties() {
  try {
    console.log('=== Debugging Property Issues ===');

    // Get all properties with their details
    const allProperties = await prisma.property.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Total properties: ${allProperties.length}`);

    // Check each property's details
    allProperties.forEach((prop, index) => {
      console.log(`\n${index + 1}. ${prop.title}`);
      console.log(`   ID: ${prop.id}`);
      console.log(`   Status: ${prop.moderationStatus}`);
      console.log(`   Category: ${prop.category}`);
      console.log(`   Active: ${prop.isActive}`);
      console.log(`   Owner: ${prop.owner?.email}`);
      console.log(`   Created: ${prop.createdAt}`);
      console.log(`   Images: ${prop.images.length}`);
    });

    // Check specifically for property sales
    const propertySales = allProperties.filter(p => p.category === 'PROPERTY_SALE');
    console.log(`\nProperty Sales: ${propertySales.length}`);

    const approvedSales = propertySales.filter(p => p.moderationStatus === 'APPROVED' && p.isActive);
    console.log(`Approved & Active Property Sales: ${approvedSales.length}`);

    approvedSales.forEach((prop, index) => {
      console.log(`\nApproved Sale ${index + 1}:`);
      console.log(`   Title: ${prop.title}`);
      console.log(`   ID: ${prop.id}`);
      console.log(`   Status: ${prop.moderationStatus}`);
      console.log(`   Category: ${prop.category}`);
      console.log(`   Active: ${prop.isActive}`);
    });

    // Check if there are any issues with the data
    const issues = [];

    allProperties.forEach(prop => {
      if (!prop.title || prop.title.trim() === '') {
        issues.push(`Property ${prop.id}: Empty title`);
      }
      if (!prop.category) {
        issues.push(`Property ${prop.id}: No category`);
      }
      if (prop.moderationStatus === 'APPROVED' && !prop.isActive) {
        issues.push(`Property ${prop.id}: Approved but not active`);
      }
    });

    if (issues.length > 0) {
      console.log('\n=== Issues Found ===');
      issues.forEach(issue => console.log(issue));
    } else {
      console.log('\n=== No Data Issues Found ===');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProperties();
