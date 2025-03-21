import { RateLimitContext, RateLimitInfo, RateLimitResult, RateLimitRule } from '@/types/ratelimit';
import prisma from '@root/prisma/database';

export class RateLimitClient {
    private defaultRule: RateLimitRule;
    private rules: RateLimitRule[];

    constructor(options: { defaultRule: RateLimitRule; rules?: RateLimitRule[] }) {
        this.defaultRule = options.defaultRule;
        this.rules = options.rules || [];
    }

    /**
     * Find the appropriate rate limit rule for the given context
     */
    private findMatchingRule(context: RateLimitContext): RateLimitRule {
        // First try to find a specific rule for this endpoint+method
        const rule = this.rules.find(rule => {
            const endpointMatches = !rule.endpoint || context.endpoint === rule.endpoint;
            const methodMatches = !rule.method || context.method === rule.method;
            return endpointMatches && methodMatches;
        });

        // Fall back to default rule if no specific rule found
        return rule || this.defaultRule;
    }

    /**
     * Check if a request should be allowed based on rate limits
     */
    async check(context: RateLimitContext): Promise<RateLimitResult> {
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        
        // Ensure we have a rule - use default rule if matching fails
        const rule = this.findMatchingRule(context) || this.defaultRule;
        
        // Safety check - if somehow we still don't have a rule, use safe defaults
        if (!rule) {
            console.error("No rate limit rule found and no default rule available");
            return {
                success: true,
                info: {
                    limit: 100,
                    remaining: 99,
                    reset: 3600,
                    isBlocked: false
                }
            };
        }
        
        // Determine appropriate limits based on token presence
        const limit = context.token && rule.tokenLimit ? rule.tokenLimit : rule.limit;
        const window = context.token && rule.tokenWindow ? rule.tokenWindow : rule.window;
        
        // Find or create rate limit record
        const rateLimit = await prisma.rateLimit.findUnique({
            where: {
                identifier_endpoint_method: {
                    identifier: context.identifier,
                    endpoint: context.endpoint || null,
                    method: context.method || null
                }
            }
        }) || {
            identifier: context.identifier,
            endpoint: context.endpoint || null,
            method: context.method || null,
            count: 0,
            resetAt: new Date(now * 1000 + window * 1000),
            blockedUntil: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Check if currently blocked
        if (rateLimit.blockedUntil && rateLimit.blockedUntil > new Date()) {
            const retryAfter = Math.ceil((rateLimit.blockedUntil.getTime() - Date.now()) / 1000);
            
            return {
                success: false,
                info: {
                    limit,
                    remaining: 0,
                    reset: Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 1000),
                    isBlocked: true,
                    retryAfter
                }
            };
        }

        // Reset count if window has expired
        const resetCount = rateLimit.resetAt <= new Date();
        const newCount = resetCount ? 1 : rateLimit.count + 1;
        const newResetAt = resetCount ? new Date(now * 1000 + window * 1000) : rateLimit.resetAt;
        
        // Check if this request exceeds the limit
        const exceeded = newCount > limit;
        let blockedUntil: Date | null = null;
        
        if (exceeded && rule.blockFor) {
            blockedUntil = new Date(now * 1000 + rule.blockFor * 1000);
        }

        // Update the rate limit record
        await prisma.rateLimit.upsert({
            where: {
                identifier_endpoint_method: {
                    identifier: context.identifier,
                    endpoint: context.endpoint || null,
                    method: context.method || null
                }
            },
            update: {
                count: newCount,
                resetAt: newResetAt,
                blockedUntil,
                updatedAt: new Date()
            },
            create: {
                identifier: context.identifier,
                endpoint: context.endpoint || null,
                method: context.method || null,
                count: newCount,
                resetAt: newResetAt,
                blockedUntil,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });

        // Calculate remaining requests and reset time
        const remaining = Math.max(0, limit - newCount);
        const reset = Math.ceil((newResetAt.getTime() - Date.now()) / 1000);

        // Build response
        const info: RateLimitInfo = {
            limit,
            remaining,
            reset,
            isBlocked: blockedUntil !== null,
            retryAfter: blockedUntil ? Math.ceil((blockedUntil.getTime() - Date.now()) / 1000) : undefined
        };

        return {
            success: !exceeded,
            info
        };
    }
}