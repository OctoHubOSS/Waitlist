import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Session } from 'next-auth';

const prisma = new PrismaClient();

export interface Context {
    prisma: PrismaClient;
    session: Session | null;
    user: Session['user'] | null;
}

/**
 * Create a context for the GraphQL server
 * @param req - The request object
 * @param res - The response object
 * @returns The context object
 */
export async function createContext({ req, res }: any): Promise<Context> {
    const session = await getServerSession(req, res, authOptions);

    return {
        prisma,
        session,
        user: session?.user || null
    };
}
