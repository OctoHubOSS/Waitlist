# Rate Limiting System

This directory contains the core rate limiting implementation used throughout the application.

## Architecture

The rate limiting system is structured as follows:

1. **Core Implementation**: 
   - `RateLimitClient`: The base client that handles rate limit checks against the database
   - `CachedRateLimitClient`: A caching wrapper that reduces database load

2. **Integration**:
   - API Middleware: Located at `src/lib/api/middlewares/ratelimit.ts`
   - This middleware is a thin wrapper around the core implementation

3. **Database Model**:
   - Uses the `RateLimit` model from the Prisma schema
   - Stores rate limit data with identifier, endpoint, method, count, and reset time

## Usage

### Direct Usage

```typescript
import { RateLimitClient } from '@/lib/ratelimit/client';
import { CachedRateLimitClient } from '@/lib/ratelimit/cache';

// Create a rate limit client
const rateLimitClient = new RateLimitClient({
  defaultRule: {
    limit: 100,
    window: 3600, // 1 hour
    blockFor: 300, // 5 minutes if exceeded
    tokenLimit: 1000,
    tokenWindow: 3600
  },
  rules: [
    // Specific rules for different endpoints/methods
    {
      method: 'GET',
      limit: 200,

// Wrap with caching to reduce database load
const cachedClient = new CachedRateLimitClient(rateLimitClient, {
  ttl: 5000 // 5 seconds cache
});

// Check a request
const result = await cachedClient.check({
  identifier: 'ip:127.0.0.1',
  endpoint: '/api/users',
  method: 'GET'
});
```

### As API Middleware

```typescript
import { createRateLimitMiddleware } from '@/lib/api/middlewares/ratelimit';

// Create the middleware
const withRateLimit = createRateLimitMiddleware(cachedClient, {
  includeHeaders: true,
  includeEndpoint: true,
  includeMethod: true
});

// Use in your API routes
api.use(withRateLimit);
```

## Best Practices

1. Always use the cached client in production to reduce database load
2. Set appropriate limits based on endpoint sensitivity
3. Consider higher limits for authenticated users vs anonymous
4. Use the middleware for API routes and the client directly for other rate limiting needs
