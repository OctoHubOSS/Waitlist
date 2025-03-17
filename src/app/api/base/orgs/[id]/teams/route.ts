import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateQuery } from '@/lib/api/validation';
import { errors, handleApiError, paginatedResponse } from '@/lib/api/responses';
import { z } from 'zod';

// Validation schema
const querySchema = z.object({
    take: z.coerce.number().min(1).max(100).default(10),
    skip: z.coerce.number().min(0).default(0),
    search: z.string().optional(),
});

// GET /api/base/organizations/[orgId]/teams
export async function GET(
    req: NextRequest,
    { params }: { params: { orgId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        const validation = validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { take = 10, skip = 0, search } = validation.data;

        // Check if user is a member of the organization
        const membership = await prisma.orgMembership.findFirst({
            where: {
                organizationId: params.orgId,
                userId: session.user.id,
            },
        });

        if (!membership) {
            return errors.forbidden('Not a member of this organization');
        }

        // Get teams based on visibility and membership
        const teams = await prisma.team.findMany({
            where: {
                organizationId: params.orgId,
                OR: [
                    { isPrivate: false },
                    {
                        isPrivate: true,
                        members: {
                            some: {
                                userId: session.user.id,
                            },
                        },
                    },
                ],
                ...(search && {
                    OR: [
                        { name: { contains: search } },
                        { description: { contains: search } },
                    ],
                }),
            },
            take,
            skip,
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        members: true,
                        repoAccess: true,
                    },
                },
            },
        });

        const total = await prisma.team.count({
            where: {
                organizationId: params.orgId,
                OR: [
                    { isPrivate: false },
                    {
                        isPrivate: true,
                        members: {
                            some: {
                                userId: session.user.id,
                            },
                        },
                    },
                ],
                ...(search && {
                    OR: [
                        { name: { contains: search } },
                        { description: { contains: search } },
                    ],
                }),
            },
        });

        return paginatedResponse(
            teams,
            Math.floor(skip / take) + 1,
            take,
            total,
            'Teams retrieved successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
} 