import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { successResponse, errors, handleApiError } from '@/lib/api/responses';

// DELETE /api/base/organizations/[orgId]/teams/[teamId]/members/[userId]/remove
export async function DELETE(
    req: NextRequest,
    { params }: { params: { orgId: string; teamId: string; userId: string } }
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
            return errors.forbidden('Not authorized to remove team members');
        }

        // Check if target user is a member of the team
        const memberToRemove = await prisma.teamMembership.findFirst({
            where: {
                teamId: params.teamId,
                userId: params.userId,
            },
            include: {
                user: true,
            },
        });

        if (!memberToRemove) {
            return errors.notFound('User is not a member of this team');
        }

        // Prevent removing the last maintainer
        if (memberToRemove.role === 'MAINTAINER') {
            const maintainerCount = await prisma.teamMembership.count({
                where: {
                    teamId: params.teamId,
                    role: 'MAINTAINER',
                },
            });

            if (maintainerCount === 1) {
                return errors.badRequest('Cannot remove the last team maintainer');
            }
        }

        // Remove the member
        await prisma.teamMembership.delete({
            where: {
                userId_teamId: {
                    teamId: params.teamId,
                    userId: params.userId,
                },
            },
        });

        return successResponse(
            null,
            'Team member removed successfully',
            undefined,
            204
        );
    } catch (error) {
        return handleApiError(error);
    }
} 