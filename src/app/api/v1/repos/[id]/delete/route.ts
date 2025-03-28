import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { successResponse, errors, handleApiError } from '@/lib/api/responses';

// DELETE /api/base/repositories/[id]/delete
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        const repository = await prisma.repository.findUnique({
            where: { id: params.id },
            select: { ownerId: true, organization: { select: { ownerId: true } } },
        });

        if (!repository) {
            return errors.notFound('Repository not found');
        }

        if (
            repository.ownerId !== session.user.id &&
            repository.organization?.ownerId !== session.user.id
        ) {
            return errors.forbidden('Not authorized to delete this repository');
        }

        await prisma.repository.delete({
            where: { id: params.id },
        });

        return successResponse(
            null,
            'Repository deleted successfully',
            undefined,
            204
        );
    } catch (error) {
        return handleApiError(error);
    }
} 