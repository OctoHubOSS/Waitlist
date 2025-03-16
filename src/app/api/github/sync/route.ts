import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { repositoryId } = body;

        if (!repositoryId) {
            return NextResponse.json({ error: 'Repository ID is required' }, { status: 400 });
        }

        // Update the lastSyncedAt timestamp
        const updatedRepo = await prisma.repository.update({
            where: { id: repositoryId },
            data: { lastSyncedAt: new Date() }
        });

        // Here you would add the actual GitHub synchronization logic

        return NextResponse.json({
            success: true,
            message: 'Repository sync initiated',
            repository: updatedRepo
        });
    } catch (error) {
        console.error('Error syncing with GitHub:', error);
        return NextResponse.json({ error: 'Failed to sync with GitHub' }, { status: 500 });
    }
}
