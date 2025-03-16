import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateBody } from '@/utils/validation';
import { successResponse, errors, handleApiError } from '@/utils/responses';
import { z } from 'zod';

// Validation schema
const addRepositorySchema = z.object({
    repositoryId: z.string().min(1, "Repository ID is required"),
    permission: z.enum(['READ', 'WRITE', 'ADMIN']).default('READ'),
});

// POST /api/base/organizations/[orgId]/teams/[teamId]/repositories/add
export async function POST(
    req: NextRequest,
    { params }: { params: { orgId: string; teamId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if user is a team maintainer or org admin/owner
        const [teamMembership, orgMembership] = await Promise.all([
            prisma.teamMembership.findFirst({
                where: {
                    teamId: params.teamId,
                    userId: session.user.id,
                    role: 'MAINTAINER',
                },
            }),
            prisma.orgMembership.findFirst({
                where: {
                    organizationId: params.orgId,
                    userId: session.user.id,
                    role: { in: ['OWNER', 'ADMIN'] },
                },
            }),
        ]);

        if (!teamMembership && !orgMembership) {
            return errors.forbidden('Not authorized to manage team repository access');
        }

        const validation = await validateBody(req, addRepositorySchema);
        if (!validation.success) {
            return errors.badRequest('Invalid repository data', validation.error);
        }

        // Check if repository exists and belongs to the organization
        const repository = await prisma.repository.findFirst({
            where: {
                id: validation.data.repositoryId,
                orgId: params.orgId,
            },
        });

        if (!repository) {
            return errors.notFound('Repository not found in this organization');
        }

        // Check if team already has access to this repository
        const existingAccess = await prisma.teamRepositoryAccess.findFirst({
            where: {
                teamId: params.teamId,
                repositoryId: validation.data.repositoryId,
            },
        });

        if (existingAccess) {
            return errors.conflict('Team already has access to this repository');
        }

        const access = await prisma.teamRepositoryAccess.create({
            data: {
                team: { connect: { id: params.teamId } },
                repository: { connect: { id: validation.data.repositoryId } },
                permission: validation.data.permission,
            },
            include: {
                repository: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        isPrivate: true,
                        language: true,
                        defaultBranch: true,
                    },
                },
            },
        });

        return successResponse(
            access,
            'Repository access granted successfully',
            undefined,
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
} 