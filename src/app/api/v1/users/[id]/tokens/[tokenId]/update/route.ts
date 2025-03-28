import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/database";
import { validateBody } from "@/lib/api/validation";
import { errors, handleApiError, successResponse } from "@/lib/api/responses";
import { z } from "zod";
import { API_SCOPES, ApiScope } from "@/lib/api/scopes";

// Validation schema for token update
const updateTokenSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    scopes: z.array(z.string()).refine(
        (scopes) => scopes.every(scope => 
            Object.values({...API_SCOPES.READ, ...API_SCOPES.WRITE, ...API_SCOPES.ADMIN})
                .includes(scope as ApiScope)
        ),
        { message: 'Invalid scope provided' }
    ).optional(),
    expiresIn: z.number().min(1).max(365).optional(), // Days until expiration
    rateLimit: z.number().min(1).max(10000).optional(), // Requests per hour
    allowedIps: z.array(z.string()).max(100).optional(), // IP addresses or CIDR ranges
    allowedReferrers: z.array(z.string()).max(100).optional(), // Allowed referrer domains
});

// PATCH /api/base/users/[id]/tokens/[tokenId]/update
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string, tokenId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if user is updating their own token or has admin permission
        const isOwnToken = session.user.id === params.id;
        const hasAdminAccess = session.user.isAdmin === true;
        
        if (!isOwnToken && !hasAdminAccess) {
            return errors.forbidden('You can only update your own tokens');
        }
        
        // Check if token exists and belongs to the specified user
        const token = await prisma.apiToken.findFirst({
            where: {
                id: params.tokenId,
                userId: params.id,
                deletedAt: null
            }
        });

        if (!token) {
            return errors.notFound('Token not found');
        }

        // Parse and validate request body
        const body = await req.json();
        const validation = updateTokenSchema.safeParse(body);

        if (!validation.success) {
            return errors.badRequest('Invalid token data', validation.error);
        }

        const { expiresIn, ...updateData } = validation.data;

        // Calculate new expiration date if provided
        const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000) : undefined;

        // Validate scopes based on token type
        if (updateData.scopes && token.type === 'BASIC' && updateData.scopes.some(scope => 
            Object.values({...API_SCOPES.WRITE, ...API_SCOPES.ADMIN})
                .includes(scope as ApiScope)
        )) {
            return errors.badRequest('Basic tokens can only have read scopes');
        }

        // Update token in database
        const updatedToken = await prisma.apiToken.update({
            where: {
                id: params.tokenId
            },
            data: {
                ...updateData,
                ...(expiresAt && { expiresAt }),
                updatedAt: new Date()
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
                updatedAt: true,
            }
        });

        // Log token update
        await prisma.userActivity.create({
            data: {
                userId: session.user.id,
                action: 'API_TOKEN_UPDATE',
                metadata: {
                    tokenId: token.id,
                    updatedFields: Object.keys(updateData),
                    targetUserId: params.id // Add target user for audit purposes
                },
            }
        });

        return successResponse(updatedToken, 'Token updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
