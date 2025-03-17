import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';

// GET /api/base/repos/[repoId]/issues/labels/[labelId]
export async function GET(
    req: NextRequest,
    { params }: { params: { repoId: string; labelId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if repository exists and user has access
        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                OR: [
                    { isPrivate: false },
                    { ownerId: session.user.id },
                    {
                        teams: {
                            some: {
                                team: {
                                    members: {
                                        some: {
                                            userId: session.user.id
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
        });

        if (!repository) {
            return errors.notFound('Repository not found or access denied');
        }

        // Get the label with counts
        const label = await prisma.label.findFirst({
            where: {
                id: params.labelId,
                repositoryId: params.repoId,
            },
            include: {
                _count: {
                    select: {
                        issues: true,
                        pullRequests: true
                    }
                }
            }
        });

        if (!label) {
            return errors.notFound('Label not found');
        }

        return successResponse({
            ...label,
            issueCount: label._count.issues,
            pullRequestCount: label._count.pullRequests,
            _count: undefined
        }, 'Label retrieved successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 