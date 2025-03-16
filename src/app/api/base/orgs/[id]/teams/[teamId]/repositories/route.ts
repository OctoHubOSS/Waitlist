import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateQuery } from '@/utils/validation';
import { errors, handleApiError, paginatedResponse } from '@/utils/responses';
import { z } from 'zod';

// Validation schema
const querySchema = z.object({
    take: z.coerce.number().min(1).max(100).default(10),
    skip: z.coerce.number().min(0).default(0),
    search: z.string().optional(),
});

// GET /api/base/organizations/[orgId]/teams/[teamId]/repositories
export async function GET(
    req: NextRequest,
    { params }: { params: { orgId: string; teamId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        const validation = validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        // Check if user can view the team
        const team = await prisma.team.findFirst({
            where: {
                id: params.teamId,
                organizationId: params.orgId,
                OR: [
                    { isPrivate: false },
                    {
                        isPrivate: true,
                        members: {
                            some: {
                                userId: session.user.id,
                            },
                        },
                    },
                ],
            },
        });

        if (!team) {
            return errors.notFound('Team not found or access denied');
        }

        const { take = 10, skip = 0, search } = validation.data;

        const repositories = await prisma.teamRepositoryAccess.findMany({
            where: {
                teamId: params.teamId,
                repository: search ? {
                    OR: [
                        { name: { contains: search } },
                        { description: { contains: search } },
                    ],
                } : undefined,
            },
            take,
            skip,
            orderBy: { repository: { name: 'asc' } },
            include: {
                repository: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        isPrivate: true,
                        language: true,
                        defaultBranch: true,
                    },
                },
            },
        });

        const total = await prisma.teamRepositoryAccess.count({
            where: {
                teamId: params.teamId,
                repository: search ? {
                    OR: [
                        { name: { contains: search } },
                        { description: { contains: search } },
                    ],
                } : undefined,
            },
        });

        return paginatedResponse(
            repositories,
            Math.floor(skip / take) + 1,
            take,
            total,
            'Team repositories retrieved successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
} 