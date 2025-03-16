import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateBody } from '@/utils/validation';
import { successResponse, errors, handleApiError } from '@/utils/responses';
import { z } from 'zod';

// Validation schema
const updateTeamSchema = z.object({
    name: z.string().min(1, "Team name is required").optional(),
    description: z.string().optional(),
    isPrivate: z.boolean().optional(),
});

// PATCH /api/base/organizations/[orgId]/teams/[teamId]/update
export async function PATCH(
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
            return errors.forbidden('Not authorized to update this team');
        }

        const validation = await validateBody(req, updateTeamSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid team data', validation.error);
        }

        // If name is being updated, check for uniqueness
        if (validation.data.name) {
            const existingTeam = await prisma.team.findFirst({
                where: {
                    organizationId: params.orgId,
                    name: validation.data.name,
                    id: { not: params.teamId },
                },
            });

            if (existingTeam) {
                return errors.conflict('Team name is already taken in this organization');
            }
        }

        const team = await prisma.team.update({
            where: {
                id: params.teamId,
                organizationId: params.orgId,
            },
            data: validation.data,
            include: {
                _count: {
                    select: {
                        members: true,
                        repoAccess: true,
                    },
                },
            },
        });

        return successResponse(team, 'Team updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 