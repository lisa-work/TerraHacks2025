"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCache = exports.getCache = exports.setCache = exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("redis");
let redisClient = null;
const connectRedis = async () => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        console.log('ℹ️ REDIS_URL not set, skipping Redis connection');
        return;
    }
    try {
        redisClient = (0, redis_1.createClient)({
            url: redisUrl
        });
        redisClient.on('error', (error) => {
            console.warn('⚠️ Redis connection issue:', error);
        });
        redisClient.on('connect', () => {
            console.log('✅ Redis connected successfully');
        });
        redisClient.on('disconnect', () => {
            console.log('📤 Redis disconnected');
        });
        await redisClient.connect();
        process.on('SIGINT', async () => {
            await redisClient?.quit();
            console.log('📤 Redis connection closed due to app termination');
        });
    }
    catch (error) {
        console.error('❌ Redis connection failed:', error);
        console.log('⚠️ Continuing without Redis caching');
    }
};
exports.connectRedis = connectRedis;
const getRedisClient = () => {
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const setCache = async (key, value, expireInSeconds = 3600) => {
    try {
        if (redisClient && redisClient.isReady) {
            await redisClient.setEx(key, expireInSeconds, JSON.stringify(value));
        }
    }
    catch (error) {
        console.error('Cache set error:', error);
    }
};
exports.setCache = setCache;
const getCache = async (key) => {
    try {
        if (redisClient && redisClient.isReady) {
            const cached = await redisClient.get(key);
            return cached ? JSON.parse(cached) : null;
        }
        return null;
    }
    catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
};
exports.getCache = getCache;
const deleteCache = async (key) => {
    try {
        if (redisClient && redisClient.isReady) {
            await redisClient.del(key);
        }
    }
    catch (error) {
        console.error('Cache delete error:', error);
    }
};
exports.deleteCache = deleteCache;
//# sourceMappingURL=redis.js.map