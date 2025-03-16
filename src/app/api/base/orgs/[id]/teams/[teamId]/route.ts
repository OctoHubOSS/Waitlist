import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { successResponse, errors, handleApiError } from '@/utils/responses';

// GET /api/base/organizations/[orgId]/teams/[teamId]
export async function GET(
    req: NextRequest,
    { params }: { params: { orgId: string; teamId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

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
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                image: true,
                            },
                        },
                    },
                },
                repoAccess: {
                    include: {
                        repository: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                isPrivate: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        members: true,
                        repoAccess: true,
                    },
                },
            },
        });

        if (!team) {
            return errors.notFound('Team not found');
        }

        return successResponse(team, 'Team retrieved successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 