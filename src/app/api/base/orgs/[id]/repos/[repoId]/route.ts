import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { errors, handleApiError, successResponse } from '@/utils/responses';

// GET /api/base/orgs/[orgId]/repos/[repoId]
export async function GET(
    req: NextRequest,
    { params }: { params: { orgId: string; repoId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if organization exists and user is a member
        const organization = await prisma.organization.findFirst({
            where: {
                id: params.orgId,
                OR: [
                    { isPublic: true },
                    {
                        members: {
                            some: {
                                userId: session.user.id
                            }
                        }
                    }
                ]
            },
        });

        if (!organization) {
            return errors.notFound('Organization not found or access denied');
        }

        // Get repository with all related data
        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                orgId: params.orgId,
                OR: [
                    { isPrivate: false },
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
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        avatarUrl: true,
                    }
                },
                settings: true,
                teams: {
                    include: {
                        team: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                isPrivate: true,
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        stars: true,
                        issues: true,
                        pullRequests: true,
                        releases: true,
                        contributors: true,
                    }
                }
            }
        });

        if (!repository) {
            return errors.notFound('Repository not found or access denied');
        }

        // Check if user has starred the repository
        const userStar = session.user ? await prisma.star.findFirst({
            where: {
                repositoryId: repository.id,
                userId: session.user.id
            }
        }) : null;

        return successResponse({
            ...repository,
            starCount: repository._count.stars,
            issueCount: repository._count.issues,
            pullRequestCount: repository._count.pullRequests,
            releaseCount: repository._count.releases,
            contributorCount: repository._count.contributors,
            isStarredByUser: !!userStar,
            _count: undefined,
            teams: repository.teams.map(t => ({
                ...t.team,
                permission: t.permission
            }))
        }, 'Repository retrieved successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 