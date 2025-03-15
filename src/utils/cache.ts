/**
 * Simple cache utility for API responses
 * For production, consider using Redis or other distributed caching solutions
 */

// Using Node.js native caching for simplicity
// In production, replace with Redis, Memcached, or other solution
const cacheStore = new Map<string, { value: any; expiry: number }>();

export const cache = {
    /**
     * Get a value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        const item = cacheStore.get(key);

        if (!item) return null;

        // Check if the item has expired
        if (item.expiry < Date.now()) {
            cacheStore.delete(key);
            return null;
        }

        return item.value as T;
    },

    /**
     * Set a value in cache with optional TTL in seconds
     */
    async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
        const expiry = Date.now() + ttl * 1000;
        cacheStore.set(key, { value, expiry });

        // Optional: Clean up expired items periodically to avoid memory leaks
        if (cacheStore.size > 100) {
            this.cleanup();
        }
    },

    /**
     * Delete a value from cache
     */
    async delete(key: string): Promise<void> {
        cacheStore.delete(key);
    },

    /**
     * Check if a key exists in cache
     */
    async has(key: string): Promise<boolean> {
        const item = cacheStore.get(key);
        if (!item) return false;

        // Check if the item has expired
        if (item.expiry < Date.now()) {
            cacheStore.delete(key);
            return false;
        }

        return true;
    },

    /**
     * Clear all cache entries
     */
    async clear(): Promise<void> {
        cacheStore.clear();
    },

    /**
     * Get all available cache keys
     */
    keys(): string[] {
        const now = Date.now();
        const keys: string[] = [];

        // Use forEach which is compatible with all target versions
        cacheStore.forEach((item, key) => {
            if (item.expiry >= now) {
                keys.push(key);
            }
        });

        return keys;
    },

    /**
     * Get cache size (non-expired items only)
     */
    get size(): number {
        return this.keys().length;
    },

    /**
     * Clean up expired items from cache
     */
    cleanup(): void {
        const now = Date.now();
        // Use forEach instead of entries() for broader compatibility
        cacheStore.forEach((item, key) => {
            if (item.expiry < now) {
                cacheStore.delete(key);
            }
        });
    }
};

// Optional: cleanup every hour
setInterval(() => cache.cleanup(), 3600 * 1000);
