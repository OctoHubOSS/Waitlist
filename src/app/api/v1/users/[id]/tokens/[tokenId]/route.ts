import { NextRequest } from "next/server";
import prisma from "@root/prisma/database";
import { errors, handleApiError, successResponse } from "@/lib/api/responses";
import { ApiClient } from '@/lib/api/client';
import { withAuth } from '@/lib/api/middlewares/auth';

// Create API client instance
const api = new ApiClient(prisma);

// GET /api/base/users/[id]/tokens/[tokenId] - Get a single token by ID
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string, tokenId: string } }
) {
    try {
        return api.handler(withAuth(async (context) => {
            // Extract authenticated user from context
            const { user } = context.data.auth;

            // Check if user is accessing their own tokens or has admin permission
            const isOwnTokens = user.id === params.id;
            const hasAdminAccess = user.isAdmin === true;
            
            if (!isOwnTokens && !hasAdminAccess) {
                return errors.forbidden('You can only view your own tokens');
            }
            
            // Check if token exists and belongs to the specified user
            const token = await prisma.apiToken.findFirst({
                where: {
                    id: params.tokenId,
                    userId: params.id
                },
                include: {
                    usageHistory: {
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: 10,
                        select: {
                            id: true,
                            endpoint: true,
                            method: true,
                            status: true,
                            ipAddress: true,
                            userAgent: true,
                            createdAt: true
                        }
                    },
                    _count: {
                        select: {
                            usageHistory: true
                        }
                    }
                }
            });

            if (!token) {
                return errors.notFound('Token not found');
            }

            // Calculate token status
            const isExpired = token.expiresAt && new Date(token.expiresAt) < new Date();
            const isDeleted = !!token.deletedAt;

            // Return token without sensitive hash
            const { token: _hash, ...tokenData } = token;

            return successResponse({
                ...tokenData,
                isExpired,
                isDeleted,
                status: isDeleted ? 'deleted' : (isExpired ? 'expired' : 'active'),
                rateLimitRemaining: token.rateLimit ? token.rateLimit - token.rateLimitUsed : null,
                totalUsage: token._count.usageHistory
            }, 'Token retrieved successfully');
        }))(api.createContext(req));
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/base/users/[id]/tokens/[tokenId] - Soft delete a token
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string, tokenId: string } }
) {
    try {
        return api.handler(withAuth(async (context) => {
            // Extract authenticated user from context
            const { user } = context.data.auth;

            // Check if user is deleting their own token or has admin permission
            const isOwnToken = user.id === params.id;
            const hasAdminAccess = user.isAdmin === true;
            
            if (!isOwnToken && !hasAdminAccess) {
                return errors.forbidden('You can only delete your own tokens');
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

            // Soft delete the token
            await prisma.apiToken.update({
                where: {
                    id: params.tokenId
                },
                data: {
                    deletedAt: new Date()
                }
            });

            // Log token deletion
            await prisma.userActivity.create({
                data: {
                    userId: user.id,
                    action: 'API_TOKEN_DELETE',
                    metadata: {
                        tokenId: token.id,
                        targetUserId: params.id // Add target user for audit purposes
                    },
                }
            });

            return successResponse(null, 'Token deleted successfully');
        }))(api.createContext(req));
    } catch (error) {
        return handleApiError(error);
    }
}
