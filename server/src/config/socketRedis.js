// Redis adapter config for Socket.IO (using ioredis)
// If REDIS_URL is not set, Socket.IO will use in-memory adapter (localhost/dev mode).
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  // Redis is optional for localhost development.
  // Socket.IO will gracefully fall back to in-memory adapter in socket.js.
  throw new Error('REDIS_URL is not configured; Socket.IO Redis adapter will be skipped.');
}

const pubClient = new Redis(redisUrl);
const subClient = pubClient.duplicate();

pubClient.on('error', (err) => {
  console.warn('Socket Redis pub client error:', err.message);
});

subClient.on('error', (err) => {
  console.warn('Socket Redis sub client error:', err.message);
});

module.exports = { createAdapter, pubClient, subClient };
