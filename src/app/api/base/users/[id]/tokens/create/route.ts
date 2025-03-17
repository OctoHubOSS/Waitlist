import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';
import { z } from 'zod';
import { TokenType } from '@prisma/client';
import { randomBytes, createHash } from 'crypto';

// Available scopes for API tokens
const API_SCOPES = {
    READ: {
        USER: 'user:read',
        REPO: 'repo:read',
        ORG: 'org:read',
        TEAM: 'team:read',
        ISSUE: 'issue:read',
        PR: 'pr:read',
        PACKAGE: 'package:read',
        WIKI: 'wiki:read',
    },
    WRITE: {
        USER: 'user:write',
        REPO: 'repo:write',
        ORG: 'org:write',
        TEAM: 'team:write',
        ISSUE: 'issue:write',
        PR: 'pr:write',
        PACKAGE: 'package:write',
        WIKI: 'wiki:write',
    },
    ADMIN: {
        USER: 'user:admin',
        REPO: 'repo:admin',
        ORG: 'org:admin',
        TEAM: 'team:admin',
    }
} as const;

type ReadScope = typeof API_SCOPES.READ[keyof typeof API_SCOPES.READ];
type WriteScope = typeof API_SCOPES.WRITE[keyof typeof API_SCOPES.WRITE];
type AdminScope = typeof API_SCOPES.ADMIN[keyof typeof API_SCOPES.ADMIN];
type ApiScope = ReadScope | WriteScope | AdminScope;

// Validation schema for token creation
const createTokenSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    type: z.enum(['basic', 'advanced']),
    scopes: z.array(z.string()).refine(
        (scopes): scopes is ApiScope[] => scopes.every(scope =>
            Object.values(API_SCOPES.READ).includes(scope as ReadScope) ||
            Object.values(API_SCOPES.WRITE).includes(scope as WriteScope) ||
            Object.values(API_SCOPES.ADMIN).includes(scope as AdminScope)
        ),
        { message: 'Invalid scope provided' }
    ),
    expiresIn: z.number().min(1).max(365).optional(), // Days until expiration
    rateLimit: z.number().min(1).max(10000).optional(), // Requests per hour
    allowedIps: z.array(z.string()).max(100).optional(), // IP addresses or CIDR ranges
    allowedReferrers: z.array(z.string()).max(100).optional(), // Allowed referrer domains
});

// POST /api/base/users/[id]/tokens/create
export async function POST(
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

        // Only allow users to create their own tokens
        if (user.id !== session.user.id) {
            return errors.forbidden('You can only create tokens for yourself');
        }

        // Parse and validate request body
        const body = await req.json();
        const validation = createTokenSchema.safeParse(body);

        if (!validation.success) {
            return errors.badRequest('Invalid token data', validation.error);
        }

        const { name, description, type, scopes, expiresIn, rateLimit, allowedIps, allowedReferrers } = validation.data;

        // Validate scopes based on token type
        if (type === 'basic' && scopes.some(scope =>
            Object.values(API_SCOPES.WRITE).includes(scope as WriteScope) ||
            Object.values(API_SCOPES.ADMIN).includes(scope as AdminScope)
        )) {
            return errors.badRequest('Basic tokens can only have read scopes');
        }

        // Generate token
        const tokenValue = randomBytes(32).toString('hex');
        const hashedToken = createHash('sha256').update(tokenValue).digest('hex');

        // Calculate expiration date if provided
        const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) : null;

        // Create token in database
        const token = await prisma.apiToken.create({
            data: {
                name,
                description,
                token: hashedToken,
                type: type === 'basic' ? TokenType.BASIC : TokenType.ADVANCED,
                scopes,
                expiresAt,
                rateLimit,
                allowedIps,
                allowedReferrers,
                userId: user.id,
            },
            select: {
                id: true,
                name: true,
                description: true,
                type: true,
                scopes: true,
                expiresAt: true,
                rateLimit: true,
                allowedIps: true,
                allowedReferrers: true,
                createdAt: true,
            }
        });

        // Log token creation
        await prisma.userActivity.create({
            data: {
                userId: user.id,
                action: 'API_TOKEN_CREATE',
                metadata: {
                    tokenId: token.id,
                    type: token.type,
                    scopes: token.scopes,
                },
            }
        });

        // Return token data with the actual token value (only shown once)
        return successResponse({
            ...token,
            token: tokenValue,
        }, 'API token created successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 