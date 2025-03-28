import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';

// POST /api/base/users/[id]/tokens/[tokenId]/revoke
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string; tokenId: string } }
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

        // Only allow users to revoke their own tokens
        if (user.id !== session.user.id) {
            return errors.forbidden('You can only revoke your own tokens');
        }

        // Check if token exists and belongs to user
        const token = await prisma.apiToken.findFirst({
            where: {
                id: params.tokenId,
                userId: user.id,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
                type: true,
                scopes: true,
            }
        });

        if (!token) {
            return errors.notFound('Token not found or already revoked');
        }

        // Revoke token by soft deleting it
        await prisma.apiToken.update({
            where: {
                id: token.id,
            },
            data: {
                deletedAt: new Date(),
            }
        });

        // Log token revocation
        await prisma.userActivity.create({
            data: {
                userId: user.id,
                action: 'API_TOKEN_REVOKE',
                metadata: {
                    tokenId: token.id,
                    type: token.type,
                    scopes: token.scopes,
                },
            }
        });

        return successResponse({
            tokenId: token.id,
            name: token.name,
        }, 'API token revoked successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 