import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseWaitlistRoute } from '@/lib/api/routes/waitlist/base';
import { responses } from '@/lib/api/responses';
import { withRetry } from '@/lib/api/utils';
import { WaitlistStatus } from '@prisma/client';
// Use the specialized waitlist routes
import { WaitlistSubscribeRoute } from '@/lib/api/routes/waitlist/subscribe';

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  referralCode: z.string().optional(),
  source: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Simply create an instance of the specialized route
const route = new WaitlistSubscribeRoute();

// Export the handler methods
export const POST = route.handle.bind(route);
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);