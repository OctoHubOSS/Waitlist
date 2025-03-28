import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateBody } from '@/lib/api/validation';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';
import { z } from 'zod';

const updateLabelSchema = z.object({
    name: z.string().min(1, "Label name is required").max(50).optional(),
    description: z.string().max(200).optional(),
    color: z.string().regex(/^[0-9a-fA-F]{6}$/, "Color must be a valid hex color without #").optional(),
});

// PATCH /api/base/repos/[repoId]/issues/labels/[labelId]/update
export async function PATCH(
    req: NextRequest,
    { params }: { params: { repoId: string; labelId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if repository exists and user has write access
        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                OR: [
                    { ownerId: session.user.id },
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

        if (!repository) {
            return errors.notFound('Repository not found or write access denied');
        }

        // Check if label exists
        const existingLabel = await prisma.label.findFirst({
            where: {
                id: params.labelId,
                repositoryId: params.repoId,
            },
        });

        if (!existingLabel) {
            return errors.notFound('Label not found');
        }

        // Validate request body
        const validation = await validateBody(req, updateLabelSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid label data', validation.error);
        }

        // If name is being updated, check for conflicts
        if (validation.data.name && validation.data.name !== existingLabel.name) {
            const nameConflict = await prisma.label.findFirst({
                where: {
                    repositoryId: params.repoId,
                    name: validation.data.name,
                    id: { not: params.labelId },
                },
            });

            if (nameConflict) {
                return errors.conflict('Label with this name already exists');
            }
        }

        // Update the label
        const label = await prisma.label.update({
            where: {
                id: params.labelId,
            },
            data: {
                name: validation.data.name,
                description: validation.data.description,
                color: validation.data.color,
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

        return successResponse({
            ...label,
            issueCount: label._count.issues,
            pullRequestCount: label._count.pullRequests,
            _count: undefined
        }, 'Label updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 