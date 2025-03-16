import { NextRequest, NextResponse } from 'next/server';

export type ApiContext = {
    req: NextRequest;
    params?: Record<string, string>;
    searchParams?: URLSearchParams;
    data?: any;
};

export type ApiResponse = NextResponse | Response;

export type NextApiHandler = (context: ApiContext) => Promise<ApiResponse>;

export type ApiMiddleware = (
    handler: NextApiHandler
) => NextApiHandler;

export function withMiddlewares(handler: NextApiHandler, ...middlewares: ApiMiddleware[]): NextApiHandler {
    return middlewares.reduceRight((next, middleware) => middleware(next), handler);
} 