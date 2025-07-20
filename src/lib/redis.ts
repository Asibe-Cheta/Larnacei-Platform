import { createClient, RedisClientType } from 'redis';

// Redis configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_DB = process.env.REDIS_DB || '0';

// Cache configuration for Nigerian market
const CACHE_CONFIG = {
  // Property listings cache (frequently accessed)
  PROPERTY_LISTINGS: {
    TTL: 300, // 5 minutes
    PREFIX: 'property:listings:'
  },
  // Property details cache (less frequent changes)
  PROPERTY_DETAILS: {
    TTL: 1800, // 30 minutes
    PREFIX: 'property:details:'
  },
  // User data cache
  USER_DATA: {
    TTL: 3600, // 1 hour
    PREFIX: 'user:data:'
  },
  // Search results cache
  SEARCH_RESULTS: {
    TTL: 600, // 10 minutes
    PREFIX: 'search:results:'
  },
  // Analytics cache
  ANALYTICS: {
    TTL: 1800, // 30 minutes
    PREFIX: 'analytics:'
  },
  // Location data cache (rarely changes)
  LOCATION_DATA: {
    TTL: 86400, // 24 hours
    PREFIX: 'location:data:'
  }
};

// Redis client instance
let redisClient: RedisClientType | null = null;

// Initialize Redis connection
export const initRedis = async (): Promise<RedisClientType> => {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: REDIS_URL,
      password: REDIS_PASSWORD,
      database: parseInt(REDIS_DB),
      socket: {
        connectTimeout: 10000,
        lazyConnect: true,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis connection failed after 10 retries');
            return false;
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    // Error handling
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
    });

    redisClient.on('ready', () => {
      console.log('Redis client ready');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw error;
  }
};

// Get Redis client
export const getRedisClient = async (): Promise<RedisClientType> => {
  if (!redisClient) {
    return await initRedis();
  }
  return redisClient;
};

// Cache service class
export class CacheService {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  // Set cache with TTL
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setEx(key, ttl, serializedValue);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Get cache value
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Delete cache key
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Delete multiple keys by pattern
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Increment counter
  async increment(key: string, value: number = 1): Promise<number> {
    try {
      return await this.client.incrBy(key, value);
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  // Set hash field
  async hSet(key: string, field: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.hSet(key, field, serializedValue);
    } catch (error) {
      console.error('Cache hSet error:', error);
    }
  }

  // Get hash field
  async hGet<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hGet(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache hGet error:', error);
      return null;
    }
  }

  // Get all hash fields
  async hGetAll<T>(key: string): Promise<Record<string, T> | null> {
    try {
      const hash = await this.client.hGetAll(key);
      if (!hash || Object.keys(hash).length === 0) {
        return null;
      }

      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value);
      }
      return result;
    } catch (error) {
      console.error('Cache hGetAll error:', error);
      return null;
    }
  }
}

// Cache manager for different data types
export class CacheManager {
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService(redisClient!);
  }

  // Property listings cache
  async getPropertyListings(key: string) {
    return await this.cacheService.get(`${CACHE_CONFIG.PROPERTY_LISTINGS.PREFIX}${key}`);
  }

  async setPropertyListings(key: string, data: any) {
    await this.cacheService.set(
      `${CACHE_CONFIG.PROPERTY_LISTINGS.PREFIX}${key}`,
      data,
      CACHE_CONFIG.PROPERTY_LISTINGS.TTL
    );
  }

  // Property details cache
  async getPropertyDetails(id: string) {
    return await this.cacheService.get(`${CACHE_CONFIG.PROPERTY_DETAILS.PREFIX}${id}`);
  }

  async setPropertyDetails(id: string, data: any) {
    await this.cacheService.set(
      `${CACHE_CONFIG.PROPERTY_DETAILS.PREFIX}${id}`,
      data,
      CACHE_CONFIG.PROPERTY_DETAILS.TTL
    );
  }

  // User data cache
  async getUserData(id: string) {
    return await this.cacheService.get(`${CACHE_CONFIG.USER_DATA.PREFIX}${id}`);
  }

  async setUserData(id: string, data: any) {
    await this.cacheService.set(
      `${CACHE_CONFIG.USER_DATA.PREFIX}${id}`,
      data,
      CACHE_CONFIG.USER_DATA.TTL
    );
  }

  // Search results cache
  async getSearchResults(query: string) {
    return await this.cacheService.get(`${CACHE_CONFIG.SEARCH_RESULTS.PREFIX}${query}`);
  }

  async setSearchResults(query: string, data: any) {
    await this.cacheService.set(
      `${CACHE_CONFIG.SEARCH_RESULTS.PREFIX}${query}`,
      data,
      CACHE_CONFIG.SEARCH_RESULTS.TTL
    );
  }

  // Analytics cache
  async getAnalytics(key: string) {
    return await this.cacheService.get(`${CACHE_CONFIG.ANALYTICS.PREFIX}${key}`);
  }

  async setAnalytics(key: string, data: any) {
    await this.cacheService.set(
      `${CACHE_CONFIG.ANALYTICS.PREFIX}${key}`,
      data,
      CACHE_CONFIG.ANALYTICS.TTL
    );
  }

  // Location data cache
  async getLocationData(key: string) {
    return await this.cacheService.get(`${CACHE_CONFIG.LOCATION_DATA.PREFIX}${key}`);
  }

  async setLocationData(key: string, data: any) {
    await this.cacheService.set(
      `${CACHE_CONFIG.LOCATION_DATA.PREFIX}${key}`,
      data,
      CACHE_CONFIG.LOCATION_DATA.TTL
    );
  }

  // Clear all caches
  async clearAllCaches() {
    await this.cacheService.deletePattern('property:*');
    await this.cacheService.deletePattern('user:*');
    await this.cacheService.deletePattern('search:*');
    await this.cacheService.deletePattern('analytics:*');
    await this.cacheService.deletePattern('location:*');
  }

  // Clear property caches
  async clearPropertyCaches() {
    await this.cacheService.deletePattern('property:*');
  }

  // Clear user caches
  async clearUserCaches() {
    await this.cacheService.deletePattern('user:*');
  }
}

// Initialize cache manager
export const initCacheManager = async (): Promise<CacheManager> => {
  await initRedis();
  return new CacheManager();
};

// Export cache manager instance
export const cacheManager = new CacheManager();

// Graceful shutdown
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

// Health check
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const client = await getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}; 