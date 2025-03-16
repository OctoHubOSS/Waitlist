import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function createContext({ req, res }: any) {
    const session = await getServerSession(authOptions);

    return {
        prisma,
        session,
        user: session?.user
    };
}
