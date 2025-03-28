import { NextRequest } from 'next/server';
import prisma from '@/lib/database';
import { successResponse, errors, handleApiError } from '@/lib/api/responses';

// GET /api/base/repositories/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const repository = await prisma.repository.findUnique({
            where: {
                id: params.id,
                deletedAt: null
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        image: true,
                    },
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        if (!repository) {
            return errors.notFound('Repository not found');
        }

        return successResponse(repository, 'Repository retrieved successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 