import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateQuery } from '@/lib/api/validation';
import { errors, handleApiError, paginatedResponse } from '@/lib/api/responses';
import { z } from 'zod';
import { OrgRole } from '@prisma/client';

const querySchema = z.object({
    take: z.coerce.number().min(1).max(100).default(30),
    skip: z.coerce.number().min(0).default(0),
    sort: z.enum(['name', 'createdAt', 'updatedAt']).default('name'),
    order: z.enum(['asc', 'desc']).default('asc'),
    search: z.string().optional(),
    role: z.enum(['all', 'owner', 'member']).default('all'),
});

// GET /api/base/users/[id]/organizations
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if user exists
        const targetUser = await prisma.user.findUnique({
            where: {
                id: params.id,
                deletedAt: null,
            },
            select: { id: true }
        });

        if (!targetUser) {
            return errors.notFound('User not found');
        }

        // Validate query parameters
        const validation = await validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { take = 30, skip = 0, sort = 'name', order = 'asc', search, role = 'all' } = validation.data;

        // Build where clause for organization filtering
        const where = {
            organization: {
                deletedAt: null,
                ...(search ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { displayName: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ]
                } : {}),
            },
            userId: params.id,
            ...(role !== 'all' ? {
                role: role === 'owner' ? OrgRole.OWNER : OrgRole.MEMBER
            } : {}),
        };

        // Get organizations with pagination
        const [memberships, total] = await Promise.all([
            prisma.orgMembership.findMany({
                where,
                orderBy: {
                    ...(sort === 'name' ? {
                        organization: { name: order }
                    } : {
                        [sort]: order
                    })
                },
                include: {
                    organization: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            description: true,
                            avatarUrl: true,
                            website: true,
                            location: true,
                            createdAt: true,
                            updatedAt: true,
                            _count: {
                                select: {
                                    members: true,
                                    teams: true,
                                    repositories: true,
                                }
                            }
                        }
                    }
                },
                take,
                skip,
            }),
            prisma.orgMembership.count({ where })
        ]);

        // Transform the data to include role and remove unnecessary nesting
        const organizations = memberships.map(({ organization, role }) => ({
            ...organization,
            role,
            memberCount: organization._count.members,
            teamCount: organization._count.teams,
            repoCount: organization._count.repositories,
        }));

        return paginatedResponse(
            organizations,
            Math.floor(skip / take) + 1,
            take,
            total,
            'User organizations retrieved successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
} 