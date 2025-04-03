import { NextRequest } from 'next/server';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const sessionsResponseSchema = z.object({
    sessions: z.array(z.object({
        id: z.string(),
        userId: z.string(),
        expires: z.string(),
        sessionToken: z.string(),
    }))
});

class SessionsRoute extends BaseAuthRoute<void, z.infer<typeof sessionsResponseSchema>> {
    constructor() {
        super(z.void());
    }

    async handle(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to view sessions');
            }

            const sessions = await prisma.session.findMany({
                where: {
                    userId: session.user.id
                },
                orderBy: {
                    expires: 'desc'
                }
            });

            return successResponse({ sessions });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new SessionsRoute();
export const GET = route.handle.bind(route); 