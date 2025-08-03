import { RedisClientType } from 'redis';
export declare const connectRedis: () => Promise<void>;
export declare const getRedisClient: () => RedisClientType | null;
export declare const setCache: (key: string, value: unknown, expireInSeconds?: number) => Promise<void>;
export declare const getCache: (key: string) => Promise<unknown>;
export declare const deleteCache: (key: string) => Promise<void>;
//# sourceMappingURL=redis.d.ts.map