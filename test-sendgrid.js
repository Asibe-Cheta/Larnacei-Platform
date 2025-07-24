const sgMail = require('@sendgrid/mail');

// Test SendGrid configuration
const SENDGRID_API_KEY = 'SG.zHarZ3ipTUKAxMZJMQuxg.j-t-1kIVW-dBE1tx8t7rBNtOyiHMB-Uy43iwHVGQP1g';
const SENDGRID_FROM_EMAIL = 'info@larnaceiglobal.com';
const SENDGRID_FROM_NAME = 'Larnacei Property Platform';

// Configure SendGrid
sgMail.setApiKey(SENDGRID_API_KEY);

async function testSendGrid() {
  console.log('🧪 Testing SendGrid Integration...');

  try {
    const msg = {
      to: 'test@example.com', // Replace with your test email
      from: `${SENDGRID_FROM_NAME} <${SENDGRID_FROM_EMAIL}>`,
      subject: 'Test Email from Larnacei Platform',
      text: 'This is a test email to verify SendGrid integration is working.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7C0302;">Test Email from Larnacei</h2>
          <p>This is a test email to verify that SendGrid is working correctly.</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3>Test Details</h3>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>SendGrid API:</strong> Configured</p>
            <p><strong>From Email:</strong> ${SENDGRID_FROM_EMAIL}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://larnaceiglobal.com" style="background-color: #7C0302; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Visit Larnacei</a>
          </div>
        </div>
      `
    };

    console.log('📧 Sending test email...');
    const response = await sgMail.send(msg);

    console.log('✅ Test email sent successfully!');
    console.log('📊 Response:', response);

    return true;
  } catch (error) {
    console.error('❌ SendGrid test failed:', error);

    if (error.response) {
      console.error('📊 Error details:', error.response.body);
    }

    return false;
  }
}

// Run the test
testSendGrid()
  .then(success => {
    if (success) {
      console.log('🎉 SendGrid integration test completed successfully!');
    } else {
      console.log('💥 SendGrid integration test failed!');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }); 