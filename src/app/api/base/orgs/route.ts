import { NextRequest } from 'next/server';
import prisma from '@root/prisma/database';
import { validateQuery } from '@/utils/validation';
import { errors, handleApiError, paginatedResponse } from '@/utils/responses';
import { z } from 'zod';

// Validation schema
const querySchema = z.object({
    take: z.coerce.number().min(1).max(100).default(10),
    skip: z.coerce.number().min(0).default(0),
    search: z.string().optional(),
});

// GET /api/base/organizations
export async function GET(req: NextRequest) {
    try {
        const validation = validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { take = 10, skip = 0, search } = validation.data;

        const organizations = await prisma.organization.findMany({
            where: {
                OR: search ? [
                    { name: { contains: search } },
                    { displayName: { contains: search } },
                    { description: { contains: search } },
                ] : undefined,
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
                _count: {
                    select: {
                        members: true,
                        repositories: true,
                    },
                },
            },
        });

        const total = await prisma.organization.count({
            where: {
                OR: search ? [
                    { name: { contains: search } },
                    { displayName: { contains: search } },
                    { description: { contains: search } },
                ] : undefined,
            },
        });

        return paginatedResponse(
            organizations,
            Math.floor(skip / take) + 1,
            take,
            total,
            'Organizations retrieved successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
} 