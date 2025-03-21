import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { errors, handleApiError } from '@/lib/api/responses';

// DELETE /api/base/repos/[repoId]/issues/labels/[labelId]/remove
export async function DELETE(
    req: NextRequest,
    { params }: { params: { repoId: string; labelId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if repository exists and user has write access
        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                OR: [
                    { ownerId: session.user.id },
                    {
                        teams: {
                            some: {
                                permission: { in: ['WRITE', 'ADMIN'] },
                                team: {
                                    members: {
                                        some: {
                                            userId: session.user.id
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
        });

        if (!repository) {
            return errors.notFound('Repository not found or write access denied');
        }

        // Check if label exists
        const label = await prisma.label.findFirst({
            where: {
                id: params.labelId,
                repositoryId: params.repoId,
            },
        });

        if (!label) {
            return errors.notFound('Label not found');
        }

        // Delete the label
        await prisma.label.delete({
            where: {
                id: params.labelId,
            },
        });

        return new Response(null, { status: 204 });
    } catch (error) {
        return handleApiError(error);
    }
} 