// Test the properties API
const fetch = require('node-fetch');

async function testPropertiesAPI() {
  try {
    console.log('=== Testing Properties API ===');

    // Test the properties API with category filter
    const response = await fetch('http://localhost:3000/api/properties?category=PROPERTY_SALE&page=1&limit=12');
    const data = await response.json();

    console.log('API Response Status:', response.status);
    console.log('API Response:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log(`\nProperties found: ${data.data.length}`);
      console.log(`Total: ${data.pagination.total}`);

      data.data.forEach((prop, index) => {
        console.log(`${index + 1}. ${prop.title}`);
        console.log(`   Status: ${prop.moderationStatus}`);
        console.log(`   Category: ${prop.category}`);
        console.log(`   Active: ${prop.isActive}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testPropertiesAPI();
