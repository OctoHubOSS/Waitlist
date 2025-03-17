import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { errors, handleApiError } from '@/lib/api/responses';

// DELETE /api/base/organizations/[orgId]/teams/[teamId]/repositories/[repositoryId]/remove
export async function DELETE(
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

        await prisma.teamRepositoryAccess.delete({
            where: {
                teamId_repositoryId: {
                    teamId: params.teamId,
                    repositoryId: params.repositoryId,
                },
            },
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        return handleApiError(error);
    }
} 