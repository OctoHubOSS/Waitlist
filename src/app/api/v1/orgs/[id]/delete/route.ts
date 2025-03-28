import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { successResponse, errors, handleApiError } from '@/lib/api/responses';

// DELETE /api/base/organizations/[id]/delete
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if user is the organization owner
        const organization = await prisma.organization.findUnique({
            where: { id: params.id },
            include: {
                members: {
                    where: {
                        userId: session.user.id,
                        role: 'OWNER',
                    },
                },
            },
        });

        if (!organization) {
            return errors.notFound('Organization not found');
        }

        if (organization.members.length === 0) {
            return errors.forbidden('Only the organization owner can delete it');
        }

        // Delete the organization and all related data
        await prisma.organization.delete({
            where: { id: params.id },
        });

        return successResponse(
            null,
            'Organization deleted successfully',
            undefined,
            204
        );
    } catch (error) {
        return handleApiError(error);
    }
} 