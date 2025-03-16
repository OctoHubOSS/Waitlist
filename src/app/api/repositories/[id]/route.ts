import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@root/prisma/database';
import { authOptions } from '@/lib/auth';

// Get a specific repository
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    try {
        const repository = await prisma.repository.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        displayName: true,
                        image: true,
                    }
                },
                organization: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        avatarUrl: true,
                    }
                },
                topics: true,
                stars: {
                    select: {
                        userId: true,
                    }
                },
                settings: true
            }
        });

        if (!repository) {
            return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
        }

        // For private repositories, check if user has access
        if (repository.isPrivate) {
            const session = await getServerSession(authOptions);

            if (!session?.user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const hasAccess =
                repository.ownerId === session.user.id ||
                (await prisma.orgMembership.findFirst({
                    where: {
                        userId: session.user.id,
                        organizationId: repository.orgId as string
                    }
                })) ||
                (await prisma.teamMembership.findFirst({
                    where: {
                        userId: session.user.id,
                        team: {
                            repoAccess: {
                                some: {
                                    repositoryId: id
                                }
                            }
                        }
                    }
                }));

            if (!hasAccess) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        // Record repository view
        const session = await getServerSession(authOptions);
        if (session?.user) {
            await prisma.repositoryView.create({
                data: {
                    repositoryId: id,
                    userId: session.user.id,
                }
            });
        }

        return NextResponse.json(repository);
    } catch (error) {
        console.error(`Error fetching repository ${id}:`, error);
        return NextResponse.json({ error: 'Failed to fetch repository' }, { status: 500 });
    }
}

// Update a repository
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;

    try {
        // Check if user has permission to update this repository
        const repository = await prisma.repository.findUnique({
            where: { id },
            include: {
                owner: true,
                organization: {
                    include: {
                        members: {
                            where: {
                                userId: session.user.id,
                                role: {
                                    in: ['OWNER', 'ADMIN']
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!repository) {
            return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
        }

        const isOwner = repository.ownerId === session.user.id;
        const isOrgAdmin = repository.organization?.members.length > 0;

        if (!isOwner && !isOrgAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, isPrivate, defaultBranch } = body;

        const updatedRepo = await prisma.repository.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(isPrivate !== undefined && { isPrivate }),
                ...(defaultBranch && { defaultBranch }),
            }
        });

        return NextResponse.json(updatedRepo);
    } catch (error) {
        console.error(`Error updating repository ${id}:`, error);
        return NextResponse.json({ error: 'Failed to update repository' }, { status: 500 });
    }
}

// Delete a repository
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = params.id;

    try {
        // Check if user has permission to delete this repository
        const repository = await prisma.repository.findUnique({
            where: { id },
            include: {
                owner: true,
                organization: {
                    include: {
                        members: {
                            where: {
                                userId: session.user.id,
                                role: 'OWNER'
                            }
                        }
                    }
                }
            }
        });

        if (!repository) {
            return NextResponse.json({ error: 'Repository not found' }, { status: 404 });
        }

        const isOwner = repository.ownerId === session.user.id;
        const isOrgOwner = repository.organization?.members.length > 0;

        if (!isOwner && !isOrgOwner) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete the repository
        await prisma.repository.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(`Error deleting repository ${id}:`, error);
        return NextResponse.json({ error: 'Failed to delete repository' }, { status: 500 });
    }
}
