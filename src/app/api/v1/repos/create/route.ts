import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateBody } from '@/lib/api/validation';
import { successResponse, errors, handleApiError } from '@/lib/api/responses';
import { z } from 'zod';

// Validation schema
const createRepositorySchema = z.object({
    name: z.string().min(1, "Repository name is required"),
    description: z.string().optional(),
    isPrivate: z.boolean().default(false),
    defaultBranch: z.string().default('main'),
    language: z.string().optional(),
});

// POST /api/base/repositories/create
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