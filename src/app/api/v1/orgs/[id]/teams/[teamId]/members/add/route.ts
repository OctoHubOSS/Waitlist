import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateBody } from '@/lib/api/validation';
import { successResponse, errors, handleApiError } from '@/lib/api/responses';
import { z } from 'zod';

// Validation schema
const addMemberSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    role: z.enum(['MAINTAINER', 'MEMBER']).default('MEMBER'),
});

// POST /api/base/organizations/[orgId]/teams/[teamId]/members/add
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
            return errors.forbidden('Not authorized to add team members');
        }

        const validation = await validateBody(req, addMemberSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid member data', validation.error);
        }

        // Check if user is a member of the organization
        const orgMember = await prisma.orgMembership.findFirst({
            where: {
                organizationId: params.orgId,
                userId: validation.data.userId,
            },
        });

        if (!orgMember) {
            return errors.badRequest('User must be a member of the organization first');
        }

        // Check if user is already a team member
        const existingMember = await prisma.teamMembership.findFirst({
            where: {
                teamId: params.teamId,
                userId: validation.data.userId,
            },
        });

        if (existingMember) {
            return errors.conflict('User is already a member of this team');
        }

        const membership = await prisma.teamMembership.create({
            data: {
                team: { connect: { id: params.teamId } },
                user: { connect: { id: validation.data.userId } },
                role: validation.data.role,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        image: true,
                        email: true,
                    },
                },
            },
        });

        return successResponse(
            membership,
            'Team member added successfully',
            undefined,
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
} 