// Redis adapter config for Socket.IO (using ioredis)
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const pubClient = new Redis(redisUrl);
const subClient = pubClient.duplicate();

module.exports = { createAdapter, pubClient, subClient };
