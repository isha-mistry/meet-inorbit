// src/utils/cacheWrapper.ts
import Redis from "ioredis";

interface CacheWrapper {
  isAvailable: boolean;
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, expireSeconds?: number) => Promise<void>;
}

class RedisCacheWrapper implements CacheWrapper {
  private redis: Redis | null = null;
  isAvailable: boolean = false;

  constructor() {
    try {
      this.redis = new Redis();
      // Test connection
      this.redis
        .ping()
        .then(() => {
          this.isAvailable = true;
          console.log("Redis connection established successfully");
        })
        .catch((err) => {
          this.handleConnectionError(err);
        });

      // Handle runtime errors
      this.redis.on("error", (err) => {
        this.handleConnectionError(err);
      });
    } catch (err) {
      this.handleConnectionError(err);
    }
  }

  private handleConnectionError(err: any): void {
    this.isAvailable = false;
    this.redis?.disconnect();
    this.redis = null;
    // console.log(
    //   "Redis connection failed, falling back to direct database access",
    //   err
    // );
  }

  async get(key: string): Promise<string | null> {
    if (!this.isAvailable || !this.redis) {
      return null;
    }
  
    // Add environment prefix to key
    const redisPrefix = process.env.REDIS_PREFIX || 'prod';
    const prefixedKey = `${redisPrefix}:${key}`;
  
    try {
      return await this.redis.get(prefixedKey);
    } catch (err) {
      this.handleConnectionError(err);
      return null;
    }
  }
  
  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    if (!this.isAvailable || !this.redis) {
      return;
    }
  
    // Add environment prefix to key
    const redisPrefix = process.env.REDIS_PREFIX || 'prod';
    const prefixedKey = `${redisPrefix}:${key}`;
  
    try {
      await this.redis.set(prefixedKey, value);
      if (expireSeconds) {
        await this.redis.expire(prefixedKey, expireSeconds);
      }
    } catch (err) {
      this.handleConnectionError(err);
    }
  }


  async delete(key: string) {
    if (!this.isAvailable || !this.redis) {
      return;
    }
    
    // Add environment prefix to key
    const redisPrefix = process.env.REDIS_PREFIX || 'prod';
    const prefixedKey = `${redisPrefix}:${key}`;
    
    try {
      await this.redis.del(prefixedKey);
    } catch (err) {
      console.error("Redis delete error:", err);
      this.handleConnectionError(err);
    }
  }
}

// Export a singleton instance
export const cacheWrapper = new RedisCacheWrapper();
