import { ApiToken } from '@prisma/client';

/**
 * Rate limit rule configuration
 */
export interface RateLimitRule {
    endpoint?: string;
    method?: string;
    limit: number;
    window: number;
    blockFor?: number;
    tokenLimit?: number;
    tokenWindow?: number;
}

/**
 * Rate limit options
 */
export interface RateLimitOptions {
    defaultRule: RateLimitRule;
    rules?: RateLimitRule[];
}

/**
 * Context for a rate limit check
 */
export interface RateLimitContext {
    identifier: string;
    token?: ApiToken;
    endpoint?: string;
    method?: string;
}

/**
 * Information about the current rate limit status
 */
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
    isBlocked: boolean;
    retryAfter?: number;
}

/**
 * Result of a rate limit check
 */
export interface RateLimitResult {
    success: boolean;
    info: RateLimitInfo;
}