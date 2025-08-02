import { createClient } from 'redis';

let redisClient: any;

export const connectRedis = async (): Promise<void> => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl
    });

    redisClient.on('error', (error: any) => {
      console.error('❌ Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redisClient.on('disconnect', () => {
      console.log('📤 Redis disconnected');
    });

    await redisClient.connect();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await redisClient.quit();
      console.log('📤 Redis connection closed due to app termination');
    });

  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    // Don't exit process for Redis failure, continue without caching
    console.log('⚠️ Continuing without Redis caching');
  }
};

export const getRedisClient = () => {
  return redisClient;
};

// Cache utility functions
export const setCache = async (key: string, value: any, expireInSeconds: number = 3600): Promise<void> => {
  try {
    if (redisClient && redisClient.isReady) {
      await redisClient.setEx(key, expireInSeconds, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

export const getCache = async (key: string): Promise<any> => {
  try {
    if (redisClient && redisClient.isReady) {
      const cached = await redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    if (redisClient && redisClient.isReady) {
      await redisClient.del(key);
    }
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};