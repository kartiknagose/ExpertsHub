require('dotenv').config();
const { sendVerificationEmail } = require('../src/common/utils/mailer');

async function testEmail() {
    console.log('Testing SMTP Configuration...');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`User: ${process.env.SMTP_USER}`);

    try {
        const info = await sendVerificationEmail({
            to: process.env.SMTP_USER, // Send to self for testing
            link: 'http://localhost:5173/verify-email?token=test-token'
        });
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
    } catch (error) {
        console.error('❌ Email sending failed:');
        console.error(error);
    }
}

testEmail();
