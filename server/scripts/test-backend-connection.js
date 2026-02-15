const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET',
    headers: {
        'Origin': 'http://localhost:5174'
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    // Check CORS header
    const corsHeader = res.headers['access-control-allow-origin'];
    if (corsHeader === 'http://localhost:5174') {
        console.log('SUCCESS: CORS configured correctly for port 5174');
    } else {
        console.log('FAILURE: CORS header missing or incorrect: ' + corsHeader);
    }

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
