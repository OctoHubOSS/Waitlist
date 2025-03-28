import { NextRequest } from 'next/server';
import prisma from '@/lib/database';
import { successResponse, errors, handleApiError } from '@/lib/api/responses';

// GET /api/base/organizations/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const organization = await prisma.organization.findUnique({
            where: { id: params.id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        image: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true,
                                image: true,
                            },
                        },
                    },
                },
                teams: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        isPrivate: true,
                        _count: {
                            select: {
                                members: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        members: true,
                        repositories: true,
                        teams: true,
                    },
                },
            },
        });

        if (!organization) {
            return errors.notFound('Organization not found');
        }

        return successResponse(organization, 'Organization retrieved successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 