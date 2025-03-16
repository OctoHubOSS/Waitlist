import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateBody } from '@/utils/validation';
import { errors, handleApiError, successResponse } from '@/utils/responses';
import { z } from 'zod';

const createRepoSchema = z.object({
    name: z.string()
        .min(1, "Repository name is required")
        .max(100)
        .regex(/^[a-zA-Z0-9-_.]+$/, "Repository name can only contain letters, numbers, hyphens, underscores, and dots"),
    description: z.string().max(1000).optional(),
    isPrivate: z.boolean().default(false),
    defaultBranch: z.string().default("main"),
    language: z.string().optional(),
});

// POST /api/base/orgs/[orgId]/repos/create
export async function POST(
    req: NextRequest,
    { params }: { params: { orgId: string } }
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

        // Validate request body
        const validation = await validateBody(req, createRepoSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid repository data', validation.error);
        }

        // Check if repository name is already taken in the organization
        const existingRepo = await prisma.repository.findFirst({
            where: {
                orgId: params.orgId,
                name: validation.data.name,
            },
        });

        if (existingRepo) {
            return errors.conflict('Repository with this name already exists in the organization');
        }

        // Create the repository
        const repository = await prisma.repository.create({
            data: {
                name: validation.data.name,
                description: validation.data.description,
                isPrivate: validation.data.isPrivate,
                defaultBranch: validation.data.defaultBranch,
                language: validation.data.language,
                organization: { connect: { id: params.orgId } },
                source: 'OCTOFLOW',
                settings: {
                    create: {
                        hasIssues: true,
                        hasPullRequests: true,
                        hasWiki: false,
                        hasPages: false,
                        hasProjects: false,
                        hasDiscussions: false,
                        hasPackages: false,
                        hasReleases: true,
                        allowMergeCommit: true,
                        allowSquashMerge: true,
                        allowRebaseMerge: true,
                        defaultBranchProtection: 'NONE',
                        webhooksEnabled: false,
                        automationEnabled: false,
                        analyticsEnabled: true,
                    }
                }
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

        return successResponse(
            {
                ...repository,
                starCount: repository._count.stars,
                issueCount: repository._count.issues,
                pullRequestCount: repository._count.pullRequests,
                releaseCount: repository._count.releases,
                contributorCount: repository._count.contributors,
                _count: undefined
            },
            'Repository created successfully',
            undefined,
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
} 