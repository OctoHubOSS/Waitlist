import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { errors, handleApiError } from '@/lib/api/responses';

// DELETE /api/base/orgs/[orgId]/repos/[repoId]/remove
export async function DELETE(
    req: NextRequest,
    { params }: { params: { orgId: string; repoId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if organization exists and user has admin/owner access
        const organization = await prisma.organization.findFirst({
            where: {
                id: params.orgId,
                members: {
                    some: {
                        userId: session.user.id,
                        role: { in: ['ADMIN', 'OWNER'] }
                    }
                }
            },
        });

        if (!organization) {
            return errors.notFound('Organization not found or insufficient permissions');
        }

        // Check if repository exists
        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                orgId: params.orgId,
            },
        });

        if (!repository) {
            return errors.notFound('Repository not found');
        }

        // Delete the repository and all related data
        await prisma.repository.delete({
            where: {
                id: params.repoId,
            },
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        return handleApiError(error);
    }
} 