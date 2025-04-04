import { NextRequest } from "next/server";
import { WaitlistCheckRoute } from '@/lib/api/routes/waitlist/check';

// Simply create an instance of the specialized route
const route = new WaitlistCheckRoute();

// Export the handlers
export const POST = route.handle.bind(route);
export const GET = route.methodNotAllowed.bind(route);
export const PUT = route.methodNotAllowed.bind(route);
export const PATCH = route.methodNotAllowed.bind(route);
export const DELETE = route.methodNotAllowed.bind(route);