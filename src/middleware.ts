import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define an extended NextRequest interface to include the 'ip' property
interface ExtendedNextRequest extends NextRequest {
  ip?: string;
}

/**
 * Middleware to capture and preserve client IP addresses
 * This is especially important in Next.js 15+ where IP addresses
 * might not be correctly passed to API routes
 */
export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
    const isApiRoute = request.nextUrl.pathname.startsWith('/api');
    const isNextAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');

    // Allow NextAuth routes to pass through
    if (isNextAuthRoute) {
        return NextResponse.next();
    }

    // Redirect unauthenticated users to login page
    if (!token && (isDashboardPage || isApiRoute)) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect authenticated users away from auth pages
    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const response = NextResponse.next();
  
    // Early client IP detection
    const ip = getClientIpForMiddleware(request);
  
    // Set a custom header that our API routes can read
    if (ip && ip !== 'unknown') {
        response.headers.set('x-real-client-ip', ip);
    }
  
    // Only include debug header in development - not in production
    if (process.env.NODE_ENV === 'development') {
        const headers: Record<string, string> = {};
        request.headers.forEach((value, key) => {
            if (key.toLowerCase().includes('ip') || 
                key.toLowerCase().includes('forward') || 
                key.toLowerCase().includes('client')) {
                headers[key] = value;
            }
        });
    
        // Add header debug info as JSON, only in development
        response.headers.set('x-ip-debug', JSON.stringify({
            ip,
            headers: headers,
            directIp: (request as ExtendedNextRequest).ip || 'not-available'
        }));
    }
  
    return response;
}

/**
 * IP detection optimized for middleware context
 */
function getClientIpForMiddleware(request: NextRequest): string {
    // First priority: Edge runtime IP (available in Vercel Edge Functions)
    const extendedReq = request as ExtendedNextRequest;
    if (extendedReq.ip) {
        return extendedReq.ip;
    }
  
    // Second priority: Common proxy headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
  
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    if (cfConnectingIp) {
        return cfConnectingIp;
    }
  
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }
  
    // If no IP found, return unknown
    return 'unknown';
}

// Configure which paths should be processed by this middleware
export const config = {
    // Apply to all routes in the app
    matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
};