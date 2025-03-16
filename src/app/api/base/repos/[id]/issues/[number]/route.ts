import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateBody } from '@/utils/validation';
import { errors, handleApiError, successResponse } from '@/utils/responses';
import { z } from 'zod';

// Validation schema
const updateIssueSchema = z.object({
    title: z.string().min(1, "Title is required").max(255).optional(),
    body: z.string().optional(),
    state: z.enum(['OPEN', 'CLOSED']).optional(),
    assignees: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
});

// GET /api/base/repositories/[repoId]/issues/[number]
export async function GET(
    req: NextRequest,
    { params }: { params: { repoId: string; number: string } }
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

        const issue = await prisma.issue.findFirst({
            where: {
                repositoryId: params.repoId,
                number: parseInt(params.number),
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        image: true,
                    }
                },
                assignees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                image: true,
                            }
                        }
                    }
                },
                labels: {
                    include: {
                        label: true
                    }
                },
                _count: {
                    select: {
                        comments: true
                    }
                }
            }
        });

        if (!issue) {
            return errors.notFound('Issue not found');
        }

        return successResponse(issue, 'Issue retrieved successfully');
    } catch (error) {
        return handleApiError(error);
    }
}

// PATCH /api/base/repositories/[repoId]/issues/[number]
export async function PATCH(
    req: NextRequest,
    { params }: { params: { repoId: string; number: string } }
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

        // Validate request body
        const validation = await validateBody(req, updateIssueSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid issue data', validation.error);
        }

        // Check if issue exists
        const existingIssue = await prisma.issue.findFirst({
            where: {
                repositoryId: params.repoId,
                number: parseInt(params.number),
            },
        });

        if (!existingIssue) {
            return errors.notFound('Issue not found');
        }

        // Update the issue
        const issue = await prisma.issue.update({
            where: {
                id: existingIssue.id,
            },
            data: {
                ...(validation.data.title && { title: validation.data.title }),
                ...(validation.data.body && { body: validation.data.body }),
                ...(validation.data.state && { state: validation.data.state }),
                ...(validation.data.assignees && {
                    assignees: {
                        deleteMany: {},
                        create: validation.data.assignees.map(userId => ({
                            user: { connect: { id: userId } }
                        }))
                    }
                }),
                ...(validation.data.labels && {
                    labels: {
                        deleteMany: {},
                        create: validation.data.labels.map(labelId => ({
                            label: { connect: { id: labelId } }
                        }))
                    }
                })
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        image: true,
                    }
                },
                assignees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                image: true,
                            }
                        }
                    }
                },
                labels: {
                    include: {
                        label: true
                    }
                }
            }
        });

        return successResponse(issue, 'Issue updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE /api/base/repositories/[repoId]/issues/[number]
export async function DELETE(
    req: NextRequest,
    { params }: { params: { repoId: string; number: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if repository exists and user has admin access
        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                OR: [
                    { ownerId: session.user.id },
                    {
                        teams: {
                            some: {
                                permission: 'ADMIN',
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
            return errors.notFound('Repository not found or admin access denied');
        }

        // Check if issue exists
        const issue = await prisma.issue.findFirst({
            where: {
                repositoryId: params.repoId,
                number: parseInt(params.number),
            },
        });

        if (!issue) {
            return errors.notFound('Issue not found');
        }

        // Delete the issue
        await prisma.issue.delete({
            where: {
                id: issue.id,
            },
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        return handleApiError(error);
    }
} 