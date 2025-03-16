import { RateLimitContext, RateLimitResult } from '@/types/ratelimit';
import { RateLimitClient } from './client';

interface CacheEntry {
    result: RateLimitResult;
    expiresAt: number;
}

export class CachedRateLimitClient {
    private client: RateLimitClient;
    private cache: Map<string, CacheEntry>;
    private ttl: number;

    constructor(client: RateLimitClient, options?: { ttl?: number }) {
        this.client = client;
        this.cache = new Map();
        // Default TTL of 1 second
        this.ttl = options?.ttl ?? 1000;
    }

    /**
     * Generate a cache key from the context
     */
    private getCacheKey(context: RateLimitContext): string {
        return [
            context.identifier,
            context.endpoint || '_all',
            context.method || '_all',
            context.token?.id || 'anon'
        ].join(':');
    }

    /**
     * Check if a request should be allowed based on rate limits
     * Uses in-memory cache to reduce database load
     */
    async check(context: RateLimitContext): Promise<RateLimitResult> {
        const now = Date.now();
        const cacheKey = this.getCacheKey(context);

        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiresAt > now) {
            // Update remaining requests and reset time
            const timePassed = Math.floor((now - (cached.expiresAt - this.ttl)) / 1000);
            const result = { ...cached.result };

            // Only update if not blocked
            if (!result.info.isBlocked) {
                result.info.remaining = Math.max(0, result.info.remaining - 1);
                result.info.reset = Math.max(result.info.reset - timePassed, 0);
            } else if (result.info.retryAfter) {
                result.info.retryAfter = Math.max(0, result.info.retryAfter - timePassed);
            }

            return result;
        }

        // Cache miss or expired, call underlying client
        const result = await this.client.check(context);

        // Cache the result
        this.cache.set(cacheKey, {
            result,
            expiresAt: now + this.ttl
        });

        return result;
    }

    /**
     * Clear the entire cache
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Clear cache entries for a specific identifier
     */
    clearForIdentifier(identifier: string): void {
        const entries = Array.from(this.cache.entries());
        for (const [key] of entries) {
            if (key.startsWith(identifier + ':')) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        const now = Date.now();
        const total = this.cache.size;
        const expired = Array.from(this.cache.values())
            .filter(entry => entry.expiresAt <= now)
            .length;

        return {
            total,
            active: total - expired,
            expired
        };
    }

    /**
     * Clean expired entries from cache
     */
    cleanExpired(): number {
        const now = Date.now();
        let cleaned = 0;
        const entries = Array.from(this.cache.entries());

        for (const [key, entry] of entries) {
            if (entry.expiresAt <= now) {
                this.cache.delete(key);
                cleaned++;
            }
        }

        return cleaned;
    }
} 