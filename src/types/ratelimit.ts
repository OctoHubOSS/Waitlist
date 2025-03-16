import { ApiToken } from '@prisma/client';

export interface RateLimitConfig {
    // Default limits for unauthenticated requests
    defaultLimit: number;        // Number of requests
    defaultWindow: number;       // Time window in seconds

    // Limits for authenticated requests (with API token)
    tokenDefaultLimit: number;   // Default limit for API tokens if not specified
    tokenDefaultWindow: number;  // Default window for API tokens if not specified

    // Redis configuration
    prefix?: string;            // Prefix for Redis keys
    blockDuration?: number;     // How long to block if limit exceeded (seconds)
}

export interface RateLimitInfo {
    limit: number;              // Maximum requests allowed
    remaining: number;          // Remaining requests in current window
    reset: number;             // Timestamp when the limit resets
    isBlocked: boolean;        // Whether the client is currently blocked
    retryAfter?: number;       // Seconds until retry is allowed (if blocked)
}

export interface RateLimitContext {
    identifier: string;         // IP address or other identifier
    token?: ApiToken;          // API token if present
    endpoint?: string;         // API endpoint being accessed
    method?: string;           // HTTP method being used
}

export interface RateLimitResult {
    success: boolean;          // Whether the request should be allowed
    info: RateLimitInfo;      // Rate limit information
}

export interface RateLimitRule {
    endpoint?: string;
    method?: string;
    limit: number;
    window: number;
    blockFor?: number;
    tokenLimit?: number;
    tokenWindow?: number;
}

export interface RateLimitOptions {
    defaultRule: RateLimitRule;
    rules?: RateLimitRule[];
} 