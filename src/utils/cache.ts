import NodeCache from 'node-cache';

// Create a global cache instance
let globalCache: NodeCache;

export function getCache(): NodeCache {
    if (!globalCache) {
        globalCache = new NodeCache({
            stdTTL: 14400,  // 4 hours
            checkperiod: 600, // Check for expired keys every 10 minutes
            useClones: false // Store actual references for better performance
        });
    }
    return globalCache;
}

// Helper functions for common cache operations
export function getCached<T>(key: string): T | null {
    return getCache().get<T>(key) || null;
}

export function setCached<T>(key: string, value: T, ttl: number = 14400): boolean {
    return getCache().set<T>(key, value, ttl);
}

export function deleteCached(key: string): number {
    return getCache().del(key);
}

export function clearCache(): void {
    return getCache().flushAll();
}

// Stats about the cache
export function getCacheStats() {
    const cache = getCache();
    return {
        keys: cache.keys().length,
        hits: cache.getStats().hits,
        misses: cache.getStats().misses,
        ksize: cache.getStats().ksize,
        vsize: cache.getStats().vsize
    };
}