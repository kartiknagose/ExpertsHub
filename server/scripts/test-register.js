
async function testFullFlow() {
    const randomId = Math.floor(Math.random() * 100000);
    const testUser = {
        name: `Test User ${randomId}`,
        email: `test${randomId}@example.com`,
        mobile: `98765${randomId}`,
        password: 'password123',
        role: 'CUSTOMER'
    };

    console.log(`\n🔹 1. Registering user: ${testUser.email}...`);

    try {
        const regRes = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const regData = await regRes.json();

        if (!regRes.ok) {
            console.log('❌ Registration Failed:', regData);
            return;
        }

        console.log('✅ Registration Successful!');
        const link = regData.verificationLink;
        console.log('🔗 Verification Link:', link);

        if (!link) {
            console.log('❌ No verification link returned.');
            return;
        }

        // Extract token
        // Link format: http://localhost:5173/verify-email?token=TOKEN
        // Backend verify endpoint: http://localhost:3000/api/auth/verify-email?token=TOKEN
        const token = link.split('token=')[1];

        console.log(`\n🔹 2. Verifying Email (Token: ${token.substring(0, 10)}...)...`);

        const verifyRes = await fetch(`http://localhost:3000/api/auth/verify-email?token=${token}`);
        const verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
            console.log('❌ Verification Failed:', verifyData);
            return;
        }

        console.log('✅ Email Verified Successfully!');
        console.log('Response:', verifyData);

        console.log('\n🎉 FULL REGISTRATION & VERIFICATION FLOW WORKING!');

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

testFullFlow();
