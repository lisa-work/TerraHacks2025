export declare const connectRedis: () => Promise<void>;
export declare const getRedisClient: () => any;
export declare const setCache: (key: string, value: any, expireInSeconds?: number) => Promise<void>;
export declare const getCache: (key: string) => Promise<any>;
export declare const deleteCache: (key: string) => Promise<void>;
//# sourceMappingURL=redis.d.ts.map