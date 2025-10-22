const { createClient } = require('redis');
const { redisUrl } = require('./config');

let client;
let isConnected = false;
const memoryCache = new Map();

if (redisUrl) {
  client = createClient({ url: redisUrl });

  client.on('error', (err) => {
    console.warn('Redis connection error, falling back to in-memory cache:', err.message);
    isConnected = false;
  });

  client.on('connect', () => {
    console.log('Redis connected successfully');
    isConnected = true;
  });

  client.connect().catch((err) => {
    console.warn('Failed to connect to Redis, using in-memory cache:', err.message);
    isConnected = false;
  });
} else {
  console.log('Redis URL not configured, using in-memory cache');
}

const cache = {
  async get(key) {
    if (isConnected && client) {
      try {
        return await client.get(key);
      } catch (err) {
        console.warn('Redis get error, falling back to memory:', err.message);
        isConnected = false;
      }
    }
    return memoryCache.get(key);
  },

  async setEx(key, seconds, value) {
    if (isConnected && client) {
      try {
        return await client.setEx(key, seconds, value);
      } catch (err) {
        console.warn('Redis setEx error, falling back to memory:', err.message);
        isConnected = false;
      }
    }
    memoryCache.set(key, value);
    setTimeout(() => memoryCache.delete(key), seconds * 1000);
    return 'OK';
  },

  async set(key, value) {
    if (isConnected && client) {
      try {
        return await client.set(key, value);
      } catch (err) {
        console.warn('Redis set error, falling back to memory:', err.message);
        isConnected = false;
      }
    }
    memoryCache.set(key, value);
    return 'OK';
  },

  async del(key) {
    if (isConnected && client) {
      try {
        return await client.del(key);
      } catch (err) {
        console.warn('Redis del error, falling back to memory:', err.message);
        isConnected = false;
      }
    }
    return memoryCache.delete(key);
  }
};

module.exports = cache;
