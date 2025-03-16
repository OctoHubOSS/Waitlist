import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateBody } from '@/utils/validation';
import { errors, handleApiError, successResponse } from '@/utils/responses';
import { z } from 'zod';

const updateRepoSchema = z.object({
    name: z.string()
        .min(1, "Repository name is required")
        .max(100)
        .regex(/^[a-zA-Z0-9-_.]+$/, "Repository name can only contain letters, numbers, hyphens, underscores, and dots")
        .optional(),
    description: z.string().max(1000).optional(),
    isPrivate: z.boolean().optional(),
    defaultBranch: z.string().optional(),
    language: z.string().optional().nullable(),
    settings: z.object({
        hasIssues: z.boolean().optional(),
        hasPullRequests: z.boolean().optional(),
        hasWiki: z.boolean().optional(),
        hasPages: z.boolean().optional(),
        hasProjects: z.boolean().optional(),
        hasDiscussions: z.boolean().optional(),
        hasPackages: z.boolean().optional(),
        hasReleases: z.boolean().optional(),
        allowMergeCommit: z.boolean().optional(),
        allowSquashMerge: z.boolean().optional(),
        allowRebaseMerge: z.boolean().optional(),
        defaultBranchProtection: z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']).optional(),
        webhooksEnabled: z.boolean().optional(),
        automationEnabled: z.boolean().optional(),
        analyticsEnabled: z.boolean().optional(),
    }).optional(),
});

// PATCH /api/base/orgs/[orgId]/repos/[repoId]/update
export async function PATCH(
    req: NextRequest,
    { params }: { params: { orgId: string; repoId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if organization exists and user has admin/owner access
        const organization = await prisma.organization.findFirst({
            where: {
                id: params.orgId,
                members: {
                    some: {
                        userId: session.user.id,
                        role: { in: ['ADMIN', 'OWNER'] }
                    }
                }
            },
        });

        if (!organization) {
            return errors.notFound('Organization not found or insufficient permissions');
        }

        // Check if repository exists
        const existingRepo = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                orgId: params.orgId,
            },
            include: {
                settings: true
            }
        });

        if (!existingRepo) {
            return errors.notFound('Repository not found');
        }

        // Validate request body
        const validation = await validateBody(req, updateRepoSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid repository data', validation.error);
        }

        // If name is being updated, check for conflicts
        if (validation.data.name && validation.data.name !== existingRepo.name) {
            const nameConflict = await prisma.repository.findFirst({
                where: {
                    orgId: params.orgId,
                    name: validation.data.name,
                    id: { not: params.repoId },
                },
            });

            if (nameConflict) {
                return errors.conflict('Repository with this name already exists in the organization');
            }
        }

        // Update the repository
        const repository = await prisma.repository.update({
            where: {
                id: params.repoId,
            },
            data: {
                name: validation.data.name,
                description: validation.data.description,
                isPrivate: validation.data.isPrivate,
                defaultBranch: validation.data.defaultBranch,
                language: validation.data.language,
                settings: validation.data.settings ? {
                    update: validation.data.settings
                } : undefined
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

        // Check if user has starred the repository
        const userStar = await prisma.star.findFirst({
            where: {
                repositoryId: repository.id,
                userId: session.user.id
            }
        });

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
        }, 'Repository updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 