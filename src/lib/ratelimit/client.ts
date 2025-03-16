import { PrismaClient } from '@prisma/client';
import { RateLimitContext, RateLimitInfo, RateLimitOptions, RateLimitResult } from '@/types/ratelimit';

export class RateLimitClient {
    private prisma: PrismaClient;
    private options: RateLimitOptions;

    constructor(prisma: PrismaClient, options: RateLimitOptions) {
        this.prisma = prisma;
        this.options = options;
    }

    /**
     * Check if a request should be allowed based on rate limits
     */
    async check(context: RateLimitContext): Promise<RateLimitResult> {
        const now = new Date();

        // Find applicable rule
        const rule = await this.findRule(context);

        // Get limits based on whether request is authenticated
        const limit = context.token ? (rule.tokenLimit ?? context.token.rateLimit ?? rule.limit) : rule.limit;
        const window = context.token ? (rule.tokenWindow ?? context.token.rateLimit ?? rule.window) : rule.window;

        // Create a unique identifier that includes endpoint and method if present
        const identifier = [
            context.identifier,
            context.endpoint || '_all',
            context.method || '_all'
        ].join(':');

        // Get or create rate limit record
        const rateLimit = await this.prisma.rateLimit.upsert({
            where: {
                identifier_endpoint_method: {
                    identifier,
                    endpoint: context.endpoint || '_all',
                    method: context.method || '_all',
                }
            },
            create: {
                identifier,
                endpoint: context.endpoint || '_all',
                method: context.method || '_all',
                count: 0,
                resetAt: new Date(now.getTime() + window * 1000),
            },
            update: {},
        });

        // Check if currently blocked
        if (rateLimit.blockedUntil && rateLimit.blockedUntil > now) {
            return {
                success: false,
                info: {
                    limit,
                    remaining: 0,
                    reset: Math.floor(rateLimit.resetAt.getTime() / 1000),
                    isBlocked: true,
                    retryAfter: Math.floor((rateLimit.blockedUntil.getTime() - now.getTime()) / 1000),
                }
            };
        }

        // Reset count if window expired
        if (rateLimit.resetAt <= now) {
            await this.prisma.rateLimit.update({
                where: { id: rateLimit.id },
                data: {
                    count: 1,
                    resetAt: new Date(now.getTime() + window * 1000),
                    blockedUntil: null,
                }
            });

            return {
                success: true,
                info: {
                    limit,
                    remaining: limit - 1,
                    reset: Math.floor((now.getTime() + window * 1000) / 1000),
                    isBlocked: false,
                }
            };
        }

        // Check if limit exceeded
        if (rateLimit.count >= limit) {
            // Block if configured
            if (rule.blockFor) {
                await this.prisma.rateLimit.update({
                    where: { id: rateLimit.id },
                    data: {
                        blockedUntil: new Date(now.getTime() + rule.blockFor * 1000),
                    }
                });
            }

            return {
                success: false,
                info: {
                    limit,
                    remaining: 0,
                    reset: Math.floor(rateLimit.resetAt.getTime() / 1000),
                    isBlocked: true,
                    retryAfter: rule.blockFor || undefined,
                }
            };
        }

        // Increment count
        await this.prisma.rateLimit.update({
            where: { id: rateLimit.id },
            data: {
                count: { increment: 1 },
            }
        });

        return {
            success: true,
            info: {
                limit,
                remaining: limit - (rateLimit.count + 1),
                reset: Math.floor(rateLimit.resetAt.getTime() / 1000),
                isBlocked: false,
            }
        };
    }

    /**
     * Find the most specific rule that applies to this request
     */
    private async findRule(context: RateLimitContext) {
        // Try to find a specific rule for this endpoint/method
        if (context.endpoint && context.method) {
            const specificRule = this.options.rules?.find(
                r => r.endpoint === context.endpoint && r.method === context.method
            );
            if (specificRule) return specificRule;
        }

        // Try to find a rule for just the endpoint
        if (context.endpoint) {
            const endpointRule = this.options.rules?.find(
                r => r.endpoint === context.endpoint && !r.method
            );
            if (endpointRule) return endpointRule;
        }

        // Try to find a rule for just the method
        if (context.method) {
            const methodRule = this.options.rules?.find(
                r => !r.endpoint && r.method === context.method
            );
            if (methodRule) return methodRule;
        }

        // Fall back to default rule
        return this.options.defaultRule;
    }
} 