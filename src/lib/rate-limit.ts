/**
 * LEVIX Production Rate Limiting Engine
 *
 * Architecture Note on Hostinger:
 * 1. Single Node Process / Hostinger cPanel Node.js:
 *    - In-Memory Sliding Window: Zero network latency, instant checks, automatic garbage collection.
 *      Sufficient for standard single-dyno instances.
 * 2. Hostinger VPS / Multi-Instance Clusters:
 *    - Distributed Redis (Upstash / Local Redis Container): Synchronizes request tokens across
 *      multiple cluster workers so client IPs cannot bypass limits by round-robining.
 */

interface RateLimitRecord {
  timestamps: number[];
}

export interface RateLimitConfig {
  windowMs: number; // e.g. 60000 for 1 minute
  maxRequests: number; // Maximum allowed hits in window
}

// Pre-configured rate limits for sensitive streetwear endpoints
export const RATE_LIMIT_CONFIGS = {
  AUTH: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 sign-ins / min (brute-force prevention)
  CART: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 cart mutations / min (inventory lock spam defense)
  COUPON: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 coupon validations / min (dictionary attack defense)
  CHECKOUT: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 orders created / min (carding / inventory hoarding defense)
  PUBLIC_API: { windowMs: 60 * 1000, maxRequests: 120 }, // 120 reads / min
};

class InMemoryRateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Automatically prune stale IP records every 5 minutes to prevent memory leaks
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.pruneStaleRecords(), 5 * 60 * 1000);
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Evaluates if a request from key is within rate limit.
   */
  public check(
    key: string,
    config: RateLimitConfig
  ): {
    success: boolean;
    remaining: number;
    resetMs: number;
    total: number;
  } {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    // Filter out timestamps older than the sliding window
    record.timestamps = record.timestamps.filter((t) => t > windowStart);

    if (record.timestamps.length >= config.maxRequests) {
      const oldest = record.timestamps[0] || now;
      const resetMs = Math.max(0, oldest + config.windowMs - now);
      return {
        success: false,
        remaining: 0,
        resetMs,
        total: record.timestamps.length,
      };
    }

    // Record this hit
    record.timestamps.push(now);
    const remaining = config.maxRequests - record.timestamps.length;
    const resetMs = config.windowMs;

    return {
      success: true,
      remaining,
      resetMs,
      total: record.timestamps.length,
    };
  }

  /**
   * Removes keys where all timestamps are older than 10 minutes.
   */
  private pruneStaleRecords() {
    const threshold = Date.now() - 10 * 60 * 1000;
    for (const [key, record] of this.store.entries()) {
      record.timestamps = record.timestamps.filter((t) => t > threshold);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }
}

// Global Singleton
const globalLimiter = new InMemoryRateLimiter();

/**
 * Public rate limiter helper for Route Handlers and Middleware.
 *
 * @param identifier - Client IP or User ID
 * @param endpointType - 'AUTH' | 'CART' | 'COUPON' | 'CHECKOUT' | 'PUBLIC_API'
 */
export function rateLimit(
  identifier: string,
  endpointType: keyof typeof RATE_LIMIT_CONFIGS = 'PUBLIC_API'
) {
  const config = RATE_LIMIT_CONFIGS[endpointType];
  const bucketKey = `${endpointType}:${identifier}`;
  return globalLimiter.check(bucketKey, config);
}
