import { NextRequest } from 'next/server';
import prisma from '@/lib/database';
import { ApiToken, TokenType, AuditAction, AuditCategory } from '@prisma/client';
import { getToken, generateApiToken, checkTokenScope, revokeToken, hashToken } from './token';
import { API_SCOPES, ApiScope, hasScope } from '@/lib/api/scopes';
import { cache } from '@/lib/api/cache';

export interface TokenWithOwner extends ApiToken {
    user?: {
        id: string;
        name?: string | null;
        email?: string | null;
        role?: string;
    } | null;
    org?: {
        id: string;
        name: string;
        displayName?: string | null;
    } | null;
}

export interface TokenValidationResult {
    valid: boolean;
    token?: TokenWithOwner;
    error?: string;
}

// Token cache constants
const TOKEN_CACHE_PREFIX = 'api:token:';
const TOKEN_CACHE_TTL = 5 * 60; // 5 minutes in seconds

/**
 * Service for managing API tokens throughout the application
 */
export class TokenService {
    /**
     * Validate a token from a request
     */
    async validateRequest(req: NextRequest): Promise<TokenValidationResult> {
        // Get token from Authorization header
        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return { valid: false, error: 'Invalid authorization header' };
        }

        const tokenValue = authHeader.slice(7); // Remove 'Bearer ' prefix
        return this.validateToken(tokenValue);
    }

    /**
     * Validate a token value
     */
    async validateToken(tokenValue: string): Promise<TokenValidationResult> {
        if (!tokenValue) {
            return { valid: false, error: 'No token provided' };
        }

        // Hash the token for comparison
        const hashedToken = hashToken(tokenValue);
        const cacheKey = `${TOKEN_CACHE_PREFIX}${hashedToken}`;
        
        // Try to get token from cache first
        const cachedToken = await cache.get<TokenWithOwner>(cacheKey);
        if (cachedToken) {
            // Still check if token is expired or deleted
            if (cachedToken.deletedAt) {
                return { valid: false, error: 'Token has been revoked' };
            }

            if (cachedToken.expiresAt && new Date(cachedToken.expiresAt) < new Date()) {
                await cache.del(cacheKey);
                return { valid: false, error: 'Token has expired' };
            }

            // Update last used timestamp in background (don't await)
            this.updateLastUsedTimestamp(cachedToken.id).catch(err => {
                console.error('Failed to update token last used timestamp:', err);
            });

            return { valid: true, token: cachedToken };
        }

        // Not found in cache, look up in database
        const token = await prisma.apiToken.findFirst({
            where: {
                token: hashedToken, // Use hashed token
                deletedAt: null,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        displayName: true,
                        role: true,
                    }
                },
                org: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                    }
                }
            }
        });

        if (!token) {
            return { valid: false, error: 'Invalid or expired token' };
        }

        // Store in cache for future requests
        await cache.set(cacheKey, token, TOKEN_CACHE_TTL);

        // Update last used timestamp
        await this.updateLastUsedTimestamp(token.id);

        // Log token usage
        await this.recordTokenUsage(token.id, 'token-validation', 'GET', 200);

        return { valid: true, token: token as TokenWithOwner };
    }

    /**
     * Update last used timestamp without returning the token
     * This is used for background updates to avoid blocking the request
     */
    private async updateLastUsedTimestamp(tokenId: string): Promise<void> {
        await prisma.apiToken.update({
            where: { id: tokenId },
            data: { lastUsedAt: new Date() }
        });
    }

    /**
     * Create a new API token
     */
    async createToken(options: {
        name: string;
        description?: string;
        type: TokenType;
        scopes: string[];
        expiresIn?: number;
        userId?: string;
        orgId?: string;
    }): Promise<{ id: string; token: string }> {
        const result = await generateApiToken(options);

        // Log the token creation
        await this.logTokenAction(
            result.id,
            options.userId || null,
            options.orgId || null,
            'Token created',
            AuditAction.CREATE
        );

        return result;
    }

    /**
     * Check if a token has required permissions
     */
    checkPermission(token: TokenWithOwner, requiredScope: string): boolean {
        // Deleted tokens have no permissions
        if (token.deletedAt) return false;

        // Expired tokens have no permissions
        if (token.expiresAt && new Date(token.expiresAt) < new Date()) {
            return false;
        }

        // Basic tokens can only use read permissions
        if (token.type === TokenType.BASIC && !requiredScope.includes(':read')) {
            return false;
        }

        return hasScope(token.scopes as string[], requiredScope);
    }

    /**
     * Check if a token has all required scopes
     */
    checkAllScopes(token: TokenWithOwner, requiredScopes: string[]): boolean {
        return requiredScopes.every(scope => this.checkPermission(token, scope));
    }

    /**
     * Revoke a token
     */
    async revokeToken(tokenId: string, actorUserId?: string): Promise<boolean> {
        const token = await prisma.apiToken.findUnique({
            where: { id: tokenId },
            select: { id: true, userId: true, orgId: true, token: true }
        });

        if (!token) return false;

        const result = await revokeToken(tokenId);
        
        if (result) {
            // Remove from cache
            await cache.del(`${TOKEN_CACHE_PREFIX}${token.token}`);
            
            // Log the token revocation
            await this.logTokenAction(
                tokenId,
                actorUserId || token.userId || null,
                token.orgId || null,
                'Token revoked',
                AuditAction.DELETE
            );
        }

        return result;
    }

    /**
     * Record token usage
     */
    async recordTokenUsage(
        tokenId: string,
        endpoint: string,
        method: string,
        status: number,
        ipAddress?: string | null,
        userAgent?: string | null
    ): Promise<void> {
        try {
            await prisma.apiTokenUsage.create({
                data: {
                    tokenId,
                    endpoint,
                    method,
                    status,
                    ipAddress,
                    userAgent
                }
            });

            // Update rate limit counters if applicable
            const token = await prisma.apiToken.findUnique({
                where: { id: tokenId },
                select: { rateLimit: true, rateLimitUsed: true }
            });

            if (token?.rateLimit) {
                await prisma.apiToken.update({
                    where: { id: tokenId },
                    data: {
                        rateLimitUsed: (token.rateLimitUsed || 0) + 1
                    }
                });
            }
        } catch (error) {
            console.error('Failed to record token usage:', error);
        }
    }

    /**
     * Reset rate limit for a token
     */
    async resetRateLimit(tokenId: string): Promise<void> {
        await prisma.apiToken.update({
            where: { id: tokenId },
            data: {
                rateLimitUsed: 0,
                resetAt: new Date()
            }
        });
    }

    /**
     * Get tokens for a user
     */
    async getUserTokens(userId: string, includeExpired = false): Promise<ApiToken[]> {
        return prisma.apiToken.findMany({
            where: {
                userId,
                deletedAt: null,
                ...(!includeExpired ? {
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ]
                } : {})
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Get tokens for an organization
     */
    async getOrgTokens(orgId: string, includeExpired = false): Promise<ApiToken[]> {
        return prisma.apiToken.findMany({
            where: {
                orgId,
                deletedAt: null,
                ...(!includeExpired ? {
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ]
                } : {})
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Log token-related actions to the audit log
     */
    private async logTokenAction(
        tokenId: string,
        userId: string | null,
        orgId: string | null,
        message: string,
        action: AuditAction,
        details: any = {}
    ): Promise<void> {
        try {
            await prisma.auditLog.create({
                data: {
                    action,
                    category: AuditCategory.TOKEN,
                    message,
                    details: { tokenId, ...details },
                    actorId: userId,
                    userId,
                    organizationId: orgId
                }
            });
        } catch (error) {
            console.error('Failed to log token action:', error);
        }
    }

    /**
     * Refresh an expired token and return a new token
     * 
     * @param token The expired token
     * @returns A new refreshed token or null if the token cannot be refreshed
     */
    async refreshToken(token: string): Promise<string | null> {
        try {
            // Example implementation: Make a request to the token refresh endpoint
            const response = await fetch('/api/auth/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data.token || null;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            return null;
        }
    }
}

// Export a singleton instance
export const tokenService = new TokenService();
