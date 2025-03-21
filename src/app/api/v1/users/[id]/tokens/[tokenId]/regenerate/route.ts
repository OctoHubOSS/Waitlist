import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@root/prisma/database";
import { errors, handleApiError, successResponse } from "@/lib/api/responses";
import { randomBytes, createHash } from "crypto";

// POST /api/base/users/[id]/tokens/[tokenId]/regenerate - Create a new token value for an existing token
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string, tokenId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if user is regenerating their own token or has admin permission
        const isOwnToken = session.user.id === params.id;
        const hasAdminAccess = session.user.isAdmin === true;
        
        if (!isOwnToken && !hasAdminAccess) {
            return errors.forbidden('You can only regenerate your own tokens');
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

        // Generate new token value
        const newTokenValue = randomBytes(32).toString('hex');
        const newHashedToken = createHash('sha256').update(newTokenValue).digest('hex');

        // Update token in database
        await prisma.apiToken.update({
            where: {
                id: params.tokenId
            },
            data: {
                token: newHashedToken,
                updatedAt: new Date()
            }
        });

        // Log token regeneration
        await prisma.userActivity.create({
            data: {
                userId: session.user.id,
                action: 'API_TOKEN_REGENERATE',
                metadata: {
                    tokenId: token.id,
                    targetUserId: params.id // Add target user for audit purposes
                },
            }
        });

        return successResponse({
            id: token.id,
            token: newTokenValue
        }, 'Token regenerated successfully');
    } catch (error) {
        return handleApiError(error);
    }
}
