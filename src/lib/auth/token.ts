import { NextRequest } from 'next/server';
import prisma from '@root/prisma/database';
import { ApiToken, TokenType } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';
import { API_SCOPES, ApiScope, hasScope } from '@/lib/api/scopes';

/**
 * Extract and validate API token from request
 */
export async function getToken(req: NextRequest): Promise<ApiToken | null> {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    if (!token) {
        return null;
    }

    // Find and validate token
    const apiToken = await prisma.apiToken.findFirst({
        where: {
            token,
            deletedAt: null,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        }
    });

    if (!apiToken) {
        return null;
    }

    // Update last used timestamp
    await prisma.apiToken.update({
        where: { id: apiToken.id },
        data: { lastUsedAt: new Date() }
    });

    return apiToken;
}

/**
 * Generate a new API token
 */
export async function generateApiToken(options: {
    name: string;
    description?: string;
    type: TokenType;
    scopes: string[];
    expiresIn?: number; // Days until expiration
    userId?: string;
    orgId?: string;
}): Promise<{ id: string; token: string }> {
    // Generate token value
    const tokenValue = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(tokenValue).digest('hex');

    // Calculate expiration date if provided
    const expiresAt = options.expiresIn 
        ? new Date(Date.now() + options.expiresIn * 24 * 60 * 60 * 1000) 
        : null;

    // Create token in database
    const token = await prisma.apiToken.create({
        data: {
            name: options.name,
            description: options.description,
            token: hashedToken,
            type: options.type,
            scopes: options.scopes,
            expiresAt,
            userId: options.userId,
            orgId: options.orgId,
        }
    });

    // Return token with the plaintext value (this is the only time it's available)
    return {
        id: token.id,
        token: tokenValue
    };
}

/**
 * Check if a token has the required scope
 */
export async function checkTokenScope(
    tokenId: string,
    requiredScope: string
): Promise<boolean> {
    const token = await prisma.apiToken.findUnique({
        where: { id: tokenId }
    });

    if (!token) return false;

    // Basic tokens can only use read-only scopes
    if (token.type === TokenType.BASIC && !requiredScope.includes(':read')) {
        return false;
    }

    return hasScope(token.scopes as string[], requiredScope);
}

/**
 * Revoke a token
 */
export async function revokeToken(tokenId: string): Promise<boolean> {
    try {
        await prisma.apiToken.update({
            where: { id: tokenId },
            data: { deletedAt: new Date() }
        });
        return true;
    } catch (error) {
        console.error('Failed to revoke token:', error);
        return false;
    }
}

/**
 * Hash a token for storage or comparison
 */
export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}