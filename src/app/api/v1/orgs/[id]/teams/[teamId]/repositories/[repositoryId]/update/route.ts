import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateBody } from '@/lib/api/validation';
import { successResponse, errors, handleApiError } from '@/lib/api/responses';
import { z } from 'zod';

// Validation schema
const updateRepositoryAccessSchema = z.object({
    permission: z.enum(['READ', 'WRITE', 'ADMIN']),
});

// PATCH /api/base/organizations/[orgId]/teams/[teamId]/repositories/[repositoryId]/update
export async function PATCH(
    req: NextRequest,
    { params }: { params: { orgId: string; teamId: string; repositoryId: string } }
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

        const validation = await validateBody(req, updateRepositoryAccessSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid permission data', validation.error);
        }

        // Check if repository exists and belongs to the organization
        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repositoryId,
                orgId: params.orgId,
            },
        });

        if (!repository) {
            return errors.notFound('Repository not found in this organization');
        }

        // Check if team has access to this repository
        const existingAccess = await prisma.teamRepositoryAccess.findFirst({
            where: {
                teamId: params.teamId,
                repositoryId: params.repositoryId,
            },
        });

        if (!existingAccess) {
            return errors.notFound('Team does not have access to this repository');
        }

        const access = await prisma.teamRepositoryAccess.update({
            where: {
                teamId_repositoryId: {
                    teamId: params.teamId,
                    repositoryId: params.repositoryId,
                },
            },
            data: {
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
            'Repository access permissions updated successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
} 