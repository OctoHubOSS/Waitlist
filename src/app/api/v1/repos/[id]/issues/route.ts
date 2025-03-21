import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateQuery, validateBody } from '@/lib/api/validation';
import { errors, handleApiError, paginatedResponse, successResponse } from '@/lib/api/responses';
import { z } from 'zod';

// Validation schemas
const querySchema = z.object({
    take: z.coerce.number().min(1).max(100).default(10),
    skip: z.coerce.number().min(0).default(0),
    search: z.string().optional(),
    state: z.enum(['OPEN', 'CLOSED']).optional(),
    labels: z.array(z.string()).optional(),
    assignee: z.string().optional(),
    creator: z.string().optional(),
    sort: z.enum(['created', 'updated', 'comments']).default('created'),
    order: z.enum(['asc', 'desc']).default('desc'),
});

const createIssueSchema = z.object({
    title: z.string().min(1, "Title is required").max(255),
    body: z.string().optional(),
    assignees: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
});

// GET /api/base/repositories/[repoId]/issues
export async function GET(
    req: NextRequest,
    { params }: { params: { repoId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Validate query parameters
        const validation = validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
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

        const {
            take = 10,
            skip = 0,
            search,
            state,
            labels,
            assignee,
            creator,
            sort,
            order
        } = validation.data;

        // Build where clause based on filters
        const where = {
            repositoryId: params.repoId,
            ...(state && { state }),
            ...(search && {
                OR: [
                    { title: { contains: search } },
                    { body: { contains: search } },
                ]
            }),
            ...(labels && {
                labels: {
                    some: {
                        label: {
                            id: { in: labels }
                        }
                    }
                }
            }),
            ...(assignee && {
                assignees: {
                    some: {
                        userId: assignee
                    }
                }
            }),
            ...(creator && { authorId: creator })
        };

        // Build order by clause
        const orderBy = {
            [sort === 'comments' ? 'comments' : sort + 'At']: order
        };

        const [issues, total] = await Promise.all([
            prisma.issue.findMany({
                where,
                take,
                skip,
                orderBy,
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
            }),
            prisma.issue.count({ where })
        ]);

        return paginatedResponse(
            issues,
            Math.floor(skip / take) + 1,
            take,
            total,
            'Issues retrieved successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/base/repositories/[repoId]/issues
export async function POST(
    req: NextRequest,
    { params }: { params: { repoId: string } }
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
        const validation = await validateBody(req, createIssueSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid issue data', validation.error);
        }

        // Get the next issue number for this repository
        const lastIssue = await prisma.issue.findFirst({
            where: { repositoryId: params.repoId },
            orderBy: { number: 'desc' },
            select: { number: true }
        });

        const issueNumber = (lastIssue?.number ?? 0) + 1;

        // Create the issue with optional assignees and labels
        const issue = await prisma.issue.create({
            data: {
                title: validation.data.title,
                body: validation.data.body,
                number: issueNumber,
                repository: { connect: { id: params.repoId } },
                author: { connect: { id: session.user.id } },
                ...(validation.data.assignees && {
                    assignees: {
                        create: validation.data.assignees.map(userId => ({
                            user: { connect: { id: userId } }
                        }))
                    }
                }),
                ...(validation.data.labels && {
                    labels: {
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

        return successResponse(
            issue,
            'Issue created successfully',
            undefined,
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
} 