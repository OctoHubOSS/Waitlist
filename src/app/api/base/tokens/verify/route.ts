import { NextRequest, NextResponse } from 'next/server';
import prisma from '@root/prisma/database';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';
import { z } from 'zod';
import { createHash } from 'crypto';

// Add tooManyRequests to errors utility
declare module '@/utils/responses' {
    interface ErrorResponses {
        tooManyRequests(message?: string, details?: any): NextResponse;
    }
}

// Validation schema for token verification
const verifyTokenSchema = z.object({
    token: z.string().min(1),
    scope: z.string().optional(),
    ip: z.string().optional(),
    referrer: z.string().optional(),
});

// POST /api/base/tokens/verify
export async function POST(req: NextRequest) {
    try {
        // Parse and validate request body
        const body = await req.json();
        const validation = verifyTokenSchema.safeParse(body);

        if (!validation.success) {
            return errors.badRequest('Invalid request data', validation.error);
        }

        const { token, scope, ip, referrer } = validation.data;

        // Hash the token for comparison
        const hashedToken = createHash('sha256').update(token).digest('hex');

        // Find the token in the database
        const apiToken = await prisma.apiToken.findFirst({
            where: {
                token: hashedToken,
                deletedAt: null,
            },
            select: {
                id: true,
                type: true,
                scopes: true,
                expiresAt: true,
                rateLimit: true,
                allowedIps: true,
                allowedReferrers: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        deletedAt: true,
                    }
                }
            }
        });

        // Token not found or invalid
        if (!apiToken || !apiToken.user) {
            return errors.unauthorized('Invalid API token');
        }

        // Check if token is expired
        if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
            return errors.unauthorized('API token has expired');
        }

        // Check if user account is deleted
        if (apiToken.user.deletedAt) {
            return errors.unauthorized('User account is no longer active');
        }

        // Check if IP is allowed (if IP restrictions are set)
        const allowedIps = apiToken.allowedIps as string[] | null;
        if (ip && allowedIps?.length && !allowedIps.includes(ip)) {
            return errors.forbidden('IP address not allowed');
        }

        // Check if referrer is allowed (if referrer restrictions are set)
        const allowedReferrers = apiToken.allowedReferrers as string[] | null;
        if (referrer && allowedReferrers?.length) {
            const referrerDomain = new URL(referrer).hostname;
            if (!allowedReferrers.some(allowed => referrerDomain.endsWith(allowed))) {
                return errors.forbidden('Referrer not allowed');
            }
        }

        // Check if scope is allowed (if scope is provided)
        const tokenScopes = apiToken.scopes as string[];
        if (scope && !tokenScopes.includes(scope)) {
            return errors.forbidden('Insufficient scope');
        }

        // Check rate limit
        if (apiToken.rateLimit) {
            const usageCount = await prisma.apiTokenUsage.count({
                where: {
                    tokenId: apiToken.id,
                    createdAt: {
                        gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
                    }
                }
            });

            if (usageCount >= apiToken.rateLimit) {
                return errors.forbidden('Rate limit exceeded');
            }
        }

        // Log token usage
        await prisma.apiTokenUsage.create({
            data: {
                tokenId: apiToken.id,
                method: scope || 'verify',
                endpoint: req.nextUrl.pathname,
                status: 200,
                ipAddress: ip || null,
                userAgent: req.headers.get('user-agent') || null,
            }
        });

        // Return token information
        return successResponse({
            userId: apiToken.user.id,
            userName: apiToken.user.name,
            userEmail: apiToken.user.email,
            tokenType: apiToken.type,
            scopes: tokenScopes,
        }, 'Token verified successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 