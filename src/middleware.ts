import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/:path*', 
        '/auth/:path*',
        '/dashboard/:path*',
    ]
}; 