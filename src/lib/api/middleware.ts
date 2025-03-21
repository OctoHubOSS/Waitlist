import { NextRequest, NextResponse } from 'next/server';

export interface ApiContext {
  req: NextRequest;
  params: Record<string, string>;
  data: Record<string, any>;
}

export type ApiHandler = (context: ApiContext) => Promise<NextResponse>;
export type ApiMiddleware = (handler: ApiHandler) => ApiHandler;

/**
 * Create a handler for API routes with middleware support
 * 
 * @param middlewares Array of middleware functions to apply
 * @param handler The final handler function
 */
export function withApiHandler(
  middlewareOrHandler: ApiMiddleware | ApiHandler,
  handler?: ApiHandler
): (req: NextRequest, params: Record<string, string>) => Promise<NextResponse> {
  // If only one argument is provided, it's the handler
  if (!handler) {
    const finalHandler = middlewareOrHandler as ApiHandler;
    return async (req: NextRequest, params: Record<string, string>) => {
      return finalHandler({ req, params, data: {} });
    };
  }

  // If two arguments are provided, first is middleware and second is handler
  const middleware = middlewareOrHandler as ApiMiddleware;
  const finalHandler = middleware(handler);

  return async (req: NextRequest, params: Record<string, string>) => {
    return finalHandler({ req, params, data: {} });
  };
}

/**
 * Compose multiple middleware functions into a single middleware
 * 
 * @param middlewares Array of middleware functions to compose
 */
export function composeMiddlewares(...middlewares: ApiMiddleware[]): ApiMiddleware {
  return (handler: ApiHandler) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}