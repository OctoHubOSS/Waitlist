// A simple in-memory cache implementation

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  /**
   * Get a value from the cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry is expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }
  
  /**
   * Set a value in the cache with optional TTL (in seconds)
   */
  async set<T>(key: string, value: T, ttl: number = 60): Promise<void> {
    const expiresAt = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiresAt });
  }
  
  /**
   * Delete a value from the cache
   */
  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
  
  /**
   * Clear the entire cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }
  
  /**
   * Get the number of entries in the cache
   */
  size(): number {
    return this.cache.size;
  }
  
  /**
   * Perform cache maintenance by removing expired entries
   */
  async prune(): Promise<number> {
    const now = Date.now();
    let pruned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        pruned++;
      }
    }
    
    return pruned;
  }
}

// Create Redis cache class if Redis is available
// This would use Redis instead of memory for distributed caching
// If Redis is not available, fall back to memory cache

// For now, export a singleton memory cache instance
export const cache = new MemoryCache();

// Schedule periodic pruning of expired cache entries
setInterval(() => {
  cache.prune().catch(console.error);
}, 60 * 1000); // Run every minute
