import { NextRequest } from 'next/server';
import prisma from '@root/prisma/database';
import { ApiToken } from '@prisma/client';

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