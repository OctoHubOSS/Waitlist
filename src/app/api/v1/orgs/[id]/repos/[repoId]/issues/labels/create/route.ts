import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateBody } from '@/lib/api/validation';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';
import { z } from 'zod';

const createLabelSchema = z.object({
    name: z.string().min(1, "Label name is required").max(50),
    description: z.string().max(200).optional(),
    color: z.string().regex(/^[0-9a-fA-F]{6}$/, "Color must be a valid hex color without #").optional(),
});

// POST /api/base/orgs/[orgId]/repos/[repoId]/issues/labels/create
export async function POST(
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
                members: {
                    some: {
                        userId: session.user.id
                    }
                }
            },
            include: {
                members: {
                    where: {
                        userId: session.user.id
                    },
                    select: {
                        role: true
                    }
                }
            }
        });

        if (!organization) {
            return errors.notFound('Organization not found or access denied');
        }

        // Check if repository exists and user has write access
        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                orgId: params.orgId,
                OR: [
                    {
                        teams: {
                            some: {
                                permission: { in: ['WRITE', 'ADMIN'] },
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

        // Allow org owners and admins to manage labels regardless of team membership
        const isOrgAdmin = organization.members[0]?.role === 'ADMIN' || organization.members[0]?.role === 'OWNER';
        if (!repository && !isOrgAdmin) {
            return errors.notFound('Repository not found or write access denied');
        }

        // Validate request body
        const validation = await validateBody(req, createLabelSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid label data', validation.error);
        }

        // Check if label with same name already exists
        const existingLabel = await prisma.label.findFirst({
            where: {
                repositoryId: params.repoId,
                name: validation.data.name,
            },
        });

        if (existingLabel) {
            return errors.conflict('Label with this name already exists');
        }

        // Create the label
        const label = await prisma.label.create({
            data: {
                name: validation.data.name,
                description: validation.data.description,
                color: validation.data.color || '000000', // Default to black if no color provided
                repository: { connect: { id: params.repoId } },
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

        return successResponse(
            {
                ...label,
                issueCount: label._count.issues,
                pullRequestCount: label._count.pullRequests,
                _count: undefined
            },
            'Label created successfully',
            undefined,
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
} 