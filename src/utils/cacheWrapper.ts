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
    console.log(
      "Redis connection failed, falling back to direct database access",
      err
    );
  }

  async get(key: string): Promise<string | null> {
    if (!this.isAvailable || !this.redis) {
      return null;
    }

    try {
      return await this.redis.get(key);
    } catch (err) {
      this.handleConnectionError(err);
      return null;
    }
  }

  async set(key: string, value: string, expireSeconds?: number): Promise<void> {
    if (!this.isAvailable || !this.redis) {
      return;
    }

    try {
      await this.redis.set(key, value);
      if (expireSeconds) {
        await this.redis.expire(key, expireSeconds);
      }
    } catch (err) {
      this.handleConnectionError(err);
    }
  }
  async delete(key: string) {
    try {
      await this.redis?.del(key);
    } catch (err) {
      console.error("Redis delete error:", err);
      this.handleConnectionError(err);
    }
  }
}

// Export a singleton instance
export const cacheWrapper = new RedisCacheWrapper();
