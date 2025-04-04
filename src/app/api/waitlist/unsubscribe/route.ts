import { NextRequest } from "next/server";
import { WaitlistUnsubscribeRoute } from '@/lib/api/routes/waitlist/unsubscribe';

// Simply create an instance of the specialized route
const route = new WaitlistUnsubscribeRoute();

// Export the handler methods
export const POST = route.handle.bind(route);
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);