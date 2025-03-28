import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { validateBody } from '@/lib/api/validation';
import { successResponse, errors, handleApiError } from '@/lib/api/responses';
import { z } from 'zod';

// Validation schema
const updateOrganizationSchema = z.object({
    displayName: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional().nullable(),
    location: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    isPublic: z.boolean().optional(),
});

// PATCH /api/base/organizations/[id]/update
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        const validation = await validateBody(req, updateOrganizationSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid organization data', validation.error);
        }

        // Check if user is authorized to update the organization
        const organization = await prisma.organization.findUnique({
            where: { id: params.id },
            include: {
                members: {
                    where: {
                        userId: session.user.id,
                        role: { in: ['OWNER', 'ADMIN'] },
                    },
                },
            },
        });

        if (!organization) {
            return errors.notFound('Organization not found');
        }

        if (organization.members.length === 0) {
            return errors.forbidden('Not authorized to update this organization');
        }

        const updatedOrganization = await prisma.organization.update({
            where: { id: params.id },
            data: validation.data,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        image: true,
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

        return successResponse(
            updatedOrganization,
            'Organization updated successfully'
        );
    } catch (error) {
        return handleApiError(error);
    }
} 