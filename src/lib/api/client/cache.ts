import { RequestCache, RequestOptions } from '@/types/apiClient';

/**
 * Cache service for API requests
 */
export class ApiCache {
    private cache: Map<string, RequestCache> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Clean up expired cache entries every minute
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }

    /**
     * Get cached data for a request
     */
    get(key: string): any | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        // Check if cache is expired
        if (Date.now() - cached.timestamp > 60000) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    /**
     * Set cache data for a request
     */
    set(key: string, data: any, options?: RequestOptions): void {
        const ttl = options?.cache?.ttl || 60000; // Default 1 minute
        this.cache.set(key, {
            data,
            timestamp: Date.now() + ttl
        });
    }

    /**
     * Delete cache entry
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Clean up expired cache entries
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, cached] of this.cache.entries()) {
            if (now > cached.timestamp) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Stop cleanup interval
     */
    destroy(): void {
        clearInterval(this.cleanupInterval);
    }
} 