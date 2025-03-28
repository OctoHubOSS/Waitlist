import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/database';
import { errors, handleApiError } from '@/lib/api/responses';

// DELETE /api/base/orgs/[orgId]/repos/[repoId]/issues/labels/[labelId]/remove
export async function DELETE(
    req: NextRequest,
    { params }: { params: { orgId: string; repoId: string; labelId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if organization exists and user is a member
        const organization = await prisma.organization.findFirst({
            where: {
                id: params.orgId,
                members: {
                    some: {
                        userId: session.user.id
                    }
                }
            },
            include: {
                members: {
                    where: {
                        userId: session.user.id
                    },
                    select: {
                        role: true
                    }
                }
            }
        });

        if (!organization) {
            return errors.notFound('Organization not found or access denied');
        }

        // Check if repository exists and user has write access
        const repository = await prisma.repository.findFirst({
            where: {
                id: params.repoId,
                orgId: params.orgId,
                OR: [
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

        // Allow org owners and admins to manage labels regardless of team membership
        const isOrgAdmin = organization.members[0]?.role === 'ADMIN' || organization.members[0]?.role === 'OWNER';
        if (!repository && !isOrgAdmin) {
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