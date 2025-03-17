import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { successResponse, errors, handleApiError } from '@/lib/api/responses';

// DELETE /api/base/organizations/[orgId]/teams/[teamId]/delete
export async function DELETE(
    req: NextRequest,
    { params }: { params: { orgId: string; teamId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if user is an org admin/owner
        const orgMembership = await prisma.orgMembership.findFirst({
            where: {
                organizationId: params.orgId,
                userId: session.user.id,
                role: { in: ['OWNER', 'ADMIN'] },
            },
        });

        if (!orgMembership) {
            return errors.forbidden('Not authorized to delete teams');
        }

        // Check if team exists and belongs to the organization
        const team = await prisma.team.findFirst({
            where: {
                id: params.teamId,
                organizationId: params.orgId,
            },
        });

        if (!team) {
            return errors.notFound('Team not found');
        }

        // Delete the team and all related data (memberships and repo access)
        await prisma.team.delete({
            where: {
                id: params.teamId,
            },
        });

        return successResponse(
            null,
            'Team deleted successfully',
            undefined,
            204
        );
    } catch (error) {
        return handleApiError(error);
    }
} 