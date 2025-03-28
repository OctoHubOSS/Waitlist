import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateBody } from '@/lib/api/validation';
import { successResponse, errors, handleApiError } from '@/lib/api/responses';
import { z } from 'zod';

// Validation schema
const createTeamSchema = z.object({
    name: z.string().min(1, "Team name is required"),
    description: z.string().optional(),
    isPrivate: z.boolean().default(false),
});

// POST /api/base/organizations/[orgId]/teams/create
export async function POST(
    req: NextRequest,
    { params }: { params: { orgId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if user has admin/owner permissions
        const membership = await prisma.orgMembership.findFirst({
            where: {
                organizationId: params.orgId,
                userId: session.user.id,
                role: { in: ['OWNER', 'ADMIN'] },
            },
        });

        if (!membership) {
            return errors.forbidden('Not authorized to create teams');
        }

        const validation = await validateBody(req, createTeamSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid team data', validation.error);
        }

        // Check if team name is already taken in this organization
        const existingTeam = await prisma.team.findFirst({
            where: {
                organizationId: params.orgId,
                name: validation.data.name,
            },
        });

        if (existingTeam) {
            return errors.conflict('Team name is already taken in this organization');
        }

        const team = await prisma.team.create({
            data: {
                ...validation.data,
                organization: { connect: { id: params.orgId } },
                members: {
                    create: {
                        userId: session.user.id,
                        role: 'MAINTAINER',
                    },
                },
            },
            include: {
                _count: {
                    select: {
                        members: true,
                        repoAccess: true,
                    },
                },
            },
        });

        return successResponse(
            team,
            'Team created successfully',
            undefined,
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
} 