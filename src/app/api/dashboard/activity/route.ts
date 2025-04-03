import { NextRequest } from 'next/server';
import { BaseAuthRoute } from '@/lib/api/routes/auth/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const activityResponseSchema = z.object({
    activities: z.array(z.object({
        id: z.string(),
        action: z.string(),
        status: z.string(),
        details: z.any(),
        createdAt: z.string(),
    }))
});

class ActivityRoute extends BaseAuthRoute<void, z.infer<typeof activityResponseSchema>> {
    constructor() {
        super(z.void());
    }

    async handle(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to view activity');
            }

            const activities = await prisma.auditLog.findMany({
                where: {
                    userId: session.user.id
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 50
            });

            return successResponse({ activities });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new ActivityRoute();
export const GET = route.handle.bind(route); 