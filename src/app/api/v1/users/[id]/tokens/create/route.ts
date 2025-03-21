import { NextRequest } from "next/server";
import prisma from "@root/prisma/database";
import { validateBody } from "@/lib/api/validation";
import { errors, handleApiError, successResponse } from "@/lib/api/responses";
import { z } from "zod";
import { TokenType } from "@prisma/client";
import { randomBytes, createHash } from "crypto";
import { API_SCOPES, ApiScope } from "@/lib/api/scopes";
import { ApiClient } from '@/lib/api/client';
import { withAuth } from '@/lib/api/middlewares/auth';

// Create API client instance
const api = new ApiClient(prisma);

// Validation schema for token creation
const createTokenSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    type: z.enum(['basic', 'advanced']),
    scopes: z.array(z.string()).refine(
        (scopes) => scopes.every(scope => 
            Object.values({...API_SCOPES.READ, ...API_SCOPES.WRITE, ...API_SCOPES.ADMIN})
                .includes(scope as ApiScope)
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
        // Validate request body
        const validation = await validateBody(req, createTokenSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid token data', validation.error);
        }

        const { name, description, type, scopes, expiresIn, rateLimit, allowedIps, allowedReferrers } = validation.data;

        // Create handler with auth middleware
        return api.handler(withAuth(async (context) => {
            // Extract authenticated user from context
            const { user } = context.data.auth;

            // Check if user is creating their own token or has admin permission
            const isOwnToken = user.id === params.id;
            const hasAdminAccess = user.isAdmin === true;
            
            if (!isOwnToken && !hasAdminAccess) {
                return errors.forbidden('You can only create tokens for yourself');
            }

            // Validate scopes based on token type
            if (type === 'basic' && scopes.some(scope => 
                Object.values({...API_SCOPES.WRITE, ...API_SCOPES.ADMIN})
                    .includes(scope as ApiScope)
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
                    userId: params.id,
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
                    userId: user.id, // Log the creator (admin or self)
                    action: 'API_TOKEN_CREATE',
                    metadata: {
                        tokenId: token.id,
                        type: token.type,
                        scopes: token.scopes,
                        targetUserId: params.id // Add target user for audit purposes
                    },
                }
            });

            return successResponse({
                ...token,
                token: tokenValue,
            }, 'API token created successfully');
        }))(api.createContext(req));
    } catch (error) {
        return handleApiError(error);
    }
}