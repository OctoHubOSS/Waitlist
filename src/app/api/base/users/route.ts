import { NextRequest } from 'next/server';
import prisma from '@root/prisma/database';
import { validateQuery } from '@/utils/validation';
import { errors, handleApiError, paginatedResponse } from '@/utils/responses';
import { z } from 'zod';
import { ApiClient } from '@/lib/api/client';
import { withOptionalAuth } from '@/lib/api/middlewares/auth';

// Create API client instance
const api = new ApiClient(prisma);

// Query parameters schema
const querySchema = z.object({
    take: z.coerce.number().min(1).max(100).default(30),
    skip: z.coerce.number().min(0).default(0),
    sort: z.enum(['name', 'created', 'updated', 'status']).default('name'),
    order: z.enum(['asc', 'desc']).default('asc'),
    search: z.string().optional(),
    status: z.enum(['ONLINE', 'IDLE', 'DO_NOT_DISTURB', 'BUSY', 'AWAY', 'OFFLINE', 'INVISIBLE']).optional(),
});

// GET /api/base/users
export async function GET(req: NextRequest) {
    try {
        // Validate query parameters
        const validation = await validateQuery(req, querySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid query parameters', validation.error);
        }

        const { take = 30, skip = 0, sort, order, search, status } = validation.data;

        // Create handler with optional auth middleware
        return api.handler(withOptionalAuth(async (context) => {
            // Adjust limits based on authentication
            const finalTake = context.data.auth.authenticated ? take : Math.min(take, 10);

            // Build where clause
            const where = {
                deletedAt: null,
                ...(status ? { status } : {}),
                ...(search ? {
                    OR: [
                        { name: { contains: search } },
                        { displayName: { contains: search } },
                        { email: { contains: search } },
                        { bio: { contains: search } },
                    ]
                } : {})
            };

            // Get users with pagination
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    orderBy: {
                        [sort === 'created' ? 'createdAt' :
                            sort === 'updated' ? 'updatedAt' :
                                sort === 'status' ? 'lastActiveAt' : 'name']: order
                    },
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        // Only include email for authenticated users
                        ...(context.data.auth.authenticated ? { email: true } : {}),
                        image: true,
                        bio: true,
                        website: true,
                        location: true,
                        createdAt: true,
                        lastActiveAt: true,
                        status: true,
                        statusMessage: true,
                        _count: {
                            select: {
                                repositories: true,
                                stars: true,
                                ownedOrgs: true,
                                orgMemberships: true,
                                teamMemberships: true,
                            }
                        }
                    },
                    take: finalTake,
                    skip,
                }),
                prisma.user.count({ where })
            ]);

            return paginatedResponse(
                users.map(user => ({
                    ...user,
                    repoCount: user._count.repositories,
                    starCount: user._count.stars,
                    ownedOrgCount: user._count.ownedOrgs,
                    orgCount: user._count.orgMemberships,
                    teamCount: user._count.teamMemberships,
                    _count: undefined
                })),
                Math.floor(skip / take) + 1,
                finalTake,
                total,
                'Users retrieved successfully'
            );
        }))(api.createContext(req));
    } catch (error) {
        return handleApiError(error);
    }
} 