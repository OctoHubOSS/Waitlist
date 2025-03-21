import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateQuery } from '@/lib/api/validation';
import { errors, handleApiError, paginatedResponse } from '@/lib/api/responses';
import { z } from 'zod';

const querySchema = z.object({
    take: z.coerce.number().min(1).max(100).default(30),
    skip: z.coerce.number().min(0).default(0),
    type: z.enum(['all', 'repo', 'issue', 'pr', 'star', 'org', 'team']).default('all'),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
});

// GET /api/base/users/[id]/activity
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if user exists
        const targetUser = await prisma.user.findUnique({
            where: {
                id: params.id,
                deletedAt: null,
            },
            select: { id: true }
        });

        if (!targetUser) {
            return errors.notFound('User not found');
        }

        // Validate query parameters
        const validation = await validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { take = 30, skip = 0, type = 'all', from, to } = validation.data;

        // Build where clause for activity filtering
        const where = {
            userId: params.id,
            ...(from || to ? {
                createdAt: {
                    ...(from ? { gte: from } : {}),
                    ...(to ? { lte: to } : {})
                }
            } : {}),
            ...(type !== 'all' ? {
                action: {
                    startsWith: type.toUpperCase()
                }
            } : {})
        };

        // Get user activity with pagination
        const [activities, total] = await Promise.all([
            prisma.userActivity.findMany({
                where,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            image: true,
                        }
                    }
                },
                take,
                skip,
            }),
            prisma.userActivity.count({ where })
        ]);

        // Enhance activity data with related information
        const enhancedActivities = await Promise.all(activities.map(async activity => {
            const metadata = activity.metadata as Record<string, any>;
            let additionalData = {};

            // Based on activity type, fetch additional data
            switch (activity.action) {
                case 'REPO_CREATE':
                case 'REPO_UPDATE':
                case 'REPO_DELETE':
                    if (metadata.repoId) {
                        const repo = await prisma.repository.findUnique({
                            where: { id: metadata.repoId },
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                isPrivate: true,
                            }
                        });
                        additionalData = { repository: repo };
                    }
                    break;

                case 'ISSUE_CREATE':
                case 'ISSUE_UPDATE':
                case 'ISSUE_CLOSE':
                    if (metadata.issueId) {
                        const issue = await prisma.issue.findUnique({
                            where: { id: metadata.issueId },
                            select: {
                                id: true,
                                title: true,
                                number: true,
                                state: true,
                                repository: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                }
                            }
                        });
                        additionalData = { issue };
                    }
                    break;

                case 'PR_CREATE':
                case 'PR_UPDATE':
                case 'PR_MERGE':
                case 'PR_CLOSE':
                    if (metadata.prId) {
                        const pr = await prisma.pullRequest.findUnique({
                            where: { id: metadata.prId },
                            select: {
                                id: true,
                                title: true,
                                number: true,
                                state: true,
                                repository: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                }
                            }
                        });
                        additionalData = { pullRequest: pr };
                    }
                    break;

                case 'STAR_ADD':
                case 'STAR_REMOVE':
                    if (metadata.repoId) {
                        const repo = await prisma.repository.findUnique({
                            where: { id: metadata.repoId },
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                isPrivate: true,
                            }
                        });
                        additionalData = { repository: repo };
                    }
                    break;

                case 'ORG_JOIN':
                case 'ORG_LEAVE':
                    if (metadata.orgId) {
                        const org = await prisma.organization.findUnique({
                            where: { id: metadata.orgId },
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                avatarUrl: true,
                            }
                        });
                        additionalData = { organization: org };
                    }
                    break;

                case 'TEAM_JOIN':
                case 'TEAM_LEAVE':
                    if (metadata.teamId) {
                        const team = await prisma.team.findUnique({
                            where: { id: metadata.teamId },
                            select: {
                                id: true,
                                name: true,
                                organization: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                }
                            }
                        });
                        additionalData = { team };
                    }
                    break;
            }

            return {
                id: activity.id,
                action: activity.action,
                createdAt: activity.createdAt,
                user: activity.user,
                metadata: {
                    ...metadata,
                    ...additionalData
                }
            };
        }));

        return paginatedResponse(
            enhancedActivities,
            Math.floor(skip / take) + 1,
            take,
            total,
            'User activity retrieved successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
} 