import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { errors, handleApiError, paginatedResponse } from '@/lib/api/responses';
import { validateQuery } from '@/lib/api/validation';
import { z } from 'zod';
import { TokenType } from '@prisma/client';

const querySchema = z.object({
    take: z.coerce.number().min(1).max(100).default(30),
    skip: z.coerce.number().min(0).default(0),
    sort: z.enum(['createdAt', 'lastUsedAt', 'name']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
    type: z.enum(['all', 'basic', 'advanced']).default('all'),
    status: z.enum(['all', 'active', 'expired', 'deleted']).default('active'),
});

// GET /api/base/users/[id]/tokens
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: {
                id: params.id,
                deletedAt: null,
            },
            select: { id: true }
        });

        if (!user) {
            return errors.notFound('User not found');
        }

        // Only allow users to view their own tokens
        if (user.id !== session.user.id) {
            return errors.forbidden('You can only view your own API tokens');
        }

        // Validate query parameters
        const validation = await validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { take = 30, skip = 0, sort = 'createdAt', order = 'desc', search, type = 'all', status = 'active' } = validation.data;

        // Build where clause for token filtering
        const where = {
            userId: params.id,
            ...(status === 'active' ? {
                deletedAt: null,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            } : status === 'expired' ? {
                deletedAt: null,
                expiresAt: { lt: new Date() }
            } : status === 'deleted' ? {
                deletedAt: { not: null }
            } : {}),
            ...(type !== 'all' ? {
                type: type === 'basic' ? TokenType.BASIC : TokenType.ADVANCED
            } : {}),
            ...(search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            } : {})
        };

        // Get tokens with pagination
        const [tokens, total] = await Promise.all([
            prisma.apiToken.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    type: true,
                    scopes: true,
                    expiresAt: true,
                    lastUsedAt: true,
                    createdAt: true,
                    updatedAt: true,
                    rateLimit: true,
                    rateLimitUsed: true,
                    resetAt: true,
                    allowedIps: true,
                    allowedReferrers: true,
                    usageHistory: {
                        select: {
                            id: true
                        }
                    }
                },
                orderBy: {
                    [sort]: order
                },
                take,
                skip,
            }),
            prisma.apiToken.count({ where })
        ]);

        // Transform tokens to remove sensitive data and add computed fields
        const transformedTokens = tokens.map(token => ({
            ...token,
            isExpired: token.expiresAt ? new Date(token.expiresAt) < new Date() : false,
            usageCount: token.usageHistory.length,
            rateLimitRemaining: token.rateLimit ? token.rateLimit - token.rateLimitUsed : null,
            usageHistory: undefined
        }));

        return paginatedResponse(
            transformedTokens,
            Math.floor(skip / take) + 1,
            take,
            total,
            'API tokens retrieved successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
} 