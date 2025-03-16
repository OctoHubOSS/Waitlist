import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateBody } from '@/utils/validation';
import { successResponse, errors, handleApiError } from '@/utils/responses';
import { z } from 'zod';

// Validation schema
const createOrganizationSchema = z.object({
    name: z.string().min(1, "Organization name is required"),
    displayName: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional().nullable(),
    location: z.string().optional().nullable(),
    email: z.string().email().optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    isPublic: z.boolean().default(true),
});

// POST /api/base/organizations/create
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        const validation = await validateBody(req, createOrganizationSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid organization data', validation.error);
        }

        // Check if organization name is already taken
        const existingOrg = await prisma.organization.findUnique({
            where: { name: validation.data.name },
        });

        if (existingOrg) {
            return errors.conflict('Organization name is already taken');
        }

        const organization = await prisma.organization.create({
            data: {
                ...validation.data,
                owner: { connect: { id: session.user.id } },
                members: {
                    create: {
                        userId: session.user.id,
                        role: 'OWNER',
                    },
                },
            },
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
                    },
                },
            },
        });

        return successResponse(
            organization,
            'Organization created successfully',
            undefined,
            201
        );
    } catch (error) {
        return handleApiError(error);
    }
} 