import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateQuery, validateBody, schemas } from '@/lib/api/validation';
import { successResponse, errors, handleApiError, paginatedResponse } from '@/lib/api/responses';
import { z } from 'zod';

// Validation schemas
const createRepositorySchema = z.object({
    name: z.string().min(1, "Repository name is required"),
    description: z.string().optional(),
    isPrivate: z.boolean().default(false),
    defaultBranch: z.string().default('main'),
    language: z.string().optional(),
});

const querySchema = z.object({
    take: z.coerce.number().min(1).max(100).default(10),
    skip: z.coerce.number().min(0).default(0),
    search: z.string().optional(),
});

// GET /api/base/repositories
export async function GET(req: NextRequest) {
    try {
        const validation = validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { take = 10, skip = 0, search } = validation.data;

        const repositories = await prisma.repository.findMany({
            where: {
                OR: search ? [
                    { name: { contains: search } },
                    { description: { contains: search } },
                ] : undefined,
                deletedAt: null,
            },
            take,
            skip,
            orderBy: { createdAt: 'desc' },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        image: true,
                    },
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
        });

        const total = await prisma.repository.count({
            where: {
                OR: search ? [
                    { name: { contains: search } },
                    { description: { contains: search } },
                ] : undefined,
                deletedAt: null,
            },
        });

        return paginatedResponse(
            repositories,
            Math.floor(skip / take) + 1,
            take,
            total,
            'Repositories retrieved successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/base/repositories
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        const validation = await validateBody(req, createRepositorySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid repository data', validation.error);
        }

        const repository = await prisma.repository.create({
            data: {
                ...validation.data,
                owner: { connect: { id: session.user.id } },
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        image: true,
                    },
                },
            },
        });

        return successResponse(
            repository,
            'Repository created successfully',
            undefined,
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
} 