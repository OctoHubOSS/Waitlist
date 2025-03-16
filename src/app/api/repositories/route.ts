import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Get repositories with pagination
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    try {
        // For unauthenticated users, only return public repositories
        const repositories = await prisma.repository.findMany({
            where: {
                isPrivate: false,
            },
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
                _count: {
                    select: {
                        stars: true,
                    }
                }
            },
            skip,
            take: limit,
            orderBy: {
                updatedAt: 'desc'
            }
        });

        const total = await prisma.repository.count({
            where: {
                isPrivate: false,
            }
        });

        return NextResponse.json({
            data: repositories,
            pagination: {
                page,
                limit,
                totalItems: total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching repositories:', error);
        return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
    }
}

// Create new repository (requires authentication)
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, description, isPrivate, orgId } = body;

        if (!name) {
            return NextResponse.json({ error: 'Repository name is required' }, { status: 400 });
        }

        // Check if repository already exists
        const existingRepo = await prisma.repository.findFirst({
            where: {
                OR: [
                    { ownerId: session.user.id, name },
                    { orgId, name }
                ]
            }
        });

        if (existingRepo) {
            return NextResponse.json({ error: 'Repository with this name already exists' }, { status: 409 });
        }

        // Create repository
        const repository = await prisma.repository.create({
            data: {
                name,
                description,
                isPrivate: isPrivate || false,
                source: 'OCTOFLOW',
                ...(orgId
                    ? { organization: { connect: { id: orgId } } }
                    : { owner: { connect: { id: session.user.id } } }
                ),
            }
        });

        // Create default repository settings
        await prisma.repositorySettings.create({
            data: {
                repositoryId: repository.id
            }
        });

        return NextResponse.json(repository, { status: 201 });
    } catch (error) {
        console.error('Error creating repository:', error);
        return NextResponse.json({ error: 'Failed to create repository' }, { status: 500 });
    }
}
