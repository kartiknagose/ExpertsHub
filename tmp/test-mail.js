const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

async function test() {
  console.log('--- SMTP TEST START ---');
  console.log('HOST:', process.env.SMTP_HOST);
  console.log('PORT:', process.env.SMTP_PORT);
  console.log('USER:', process.env.SMTP_USER);
  console.log('SECURE:', process.env.SMTP_SECURE);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection verified!');

    console.log('Sending test mail...');
    const info = await transporter.sendMail({
      from: `UrbanPro <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'SMTP Test - UrbanPro',
      text: 'If you see this, your SMTP configuration is working!',
    });
    console.log('✅ Test mail sent!', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Error:', error);
  }
}

test();
