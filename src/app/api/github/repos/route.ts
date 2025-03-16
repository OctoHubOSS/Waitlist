import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get linked GitHub repositories for the authenticated user
        const linkedRepos = await prisma.repository.findMany({
            where: {
                isGithubLinked: true,
                linkedByUser: session.user.id
            }
        });

        return NextResponse.json({ repos: linkedRepos });
    } catch (error) {
        console.error('Error fetching GitHub repositories:', error);
        return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
    }
}
