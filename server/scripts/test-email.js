const fs = require('fs');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

async function testEmail() {
    const envPath = '.env';
    console.log('--- Debug: Loading .env ---');
    console.log('Current Directory:', process.cwd());

    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file NOT FOUND!');
        return;
    }

    const raw = fs.readFileSync(envPath, 'utf8');
    console.log('Raw .env length:', raw.length);
    // Log first few chars to check UTF flag?
    console.log('First 50 chars:', raw.substring(0, 50).replace(/\r/g, '\\r').replace(/\n/g, '\\n'));

    const parsed = dotenv.parse(raw);
    console.log('Parsed Keys:', Object.keys(parsed));

    // Merge into process.env
    Object.assign(process.env, parsed);

    console.log('\n--- SMTP Config Check ---');
    console.log(`SMTP Host: ${process.env.SMTP_HOST}`);
    console.log(`SMTP Port: ${process.env.SMTP_PORT}`);
    console.log(`SMTP User: ${process.env.SMTP_USER}`);
    console.log(`SMTP Pass: ${process.env.SMTP_PASS ? '********' : 'MISSING'}`);
    console.log(`SMTP Secure: ${process.env.SMTP_SECURE}`);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ ERROR: SMTP credentials missing in .env');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true', // 'false' for 587 usually
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        // Debug options
        logger: true,
        debug: true
    });

    try {
        console.log('\n1. Verifying Verification Connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        console.log('\n2. Sending Test Email...');
        const info = await transporter.sendMail({
            from: `"UrbanPro Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to yourself to test
            subject: 'UrbanPro SMTP Test',
            text: 'If you see this, your email configuration is working perfectly!',
            html: '<b>If you see this, your email configuration is working perfectly!</b>'
        });

        console.log('✅ Email Sent Successfully to ' + process.env.SMTP_USER);
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('\n❌ EMAIL TEST FAILED:');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        if (error.response) console.error('SMTP Response:', error.response);
    }
}

testEmail().catch(console.error);
