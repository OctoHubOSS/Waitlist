import { ApiRoute, ApiRouter, ApiRequest, ApiResponse, ApiHandler, ApiMiddleware, ApiValidationSchema } from './types';
import { validateRequest, logRequest, errorHandler } from './middleware';
import { successResponse, errorResponse } from './utils';

/**
 * Base API Route class that implements the ApiRoute interface
 * 
 * This class provides the foundation for creating API routes with middleware support.
 * 
 * @example Basic route creation
 * ```typescript
 * const getUserRoute = new BaseApiRoute(
 *   '/api/users/:id',
 *   'GET',
 *   async (req, res) => {
 *     const { id } = req.params;
 *     // Fetch user data
 *     return successResponse({ id, name: 'John Doe' });
 *   }
 * );
 * ```
 * 
 * @example Route with middleware
 * ```typescript
 * const createUserRoute = new BaseApiRoute(
 *   '/api/users',
 *   'POST',
 *   async (req, res) => {
 *     // Create user logic
 *     return successResponse({ id: 'new-id', ...req.data });
 *   }
 * )
 *   .addMiddleware(validateRequest(userSchema))
 *   .addMiddleware(requireAuth())
 *   .addMiddleware(logRequest());
 * ```
 * 
 * @example Using with a router
 * ```typescript
 * const router = createApiRouter();
 * router.addRoute(getUserRoute);
 * router.addRoute(createUserRoute);
 * 
 * // Handle incoming request
 * await router.handle(request, response);
 * ```
 */
export class BaseApiRoute<T = any, R = any> implements ApiRoute<T, R> {
    public path: string;
    public method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    public handler: ApiHandler<T, R>;
    public middleware?: ApiMiddleware[];
    public validation?: ApiValidationSchema<T>;

    /**
     * Creates a new API route
     * 
     * @param path - The URL path for this route, can include parameters (e.g. '/users/:id')
     * @param method - The HTTP method (GET, POST, PUT, DELETE, PATCH)
     * @param handler - The function that handles the request and returns a response
     */
    constructor(path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', handler: ApiHandler<T, R>) {
        this.path = path;
        this.method = method;
        this.handler = handler;
        this.middleware = [];
    }

    /**
     * Adds middleware to the route
     * 
     * Middleware functions are executed in the order they are added, before the main handler.
     * Each middleware can modify the request, response, or terminate the request chain.
     * 
     * @param middleware - The middleware function to add
     * @returns The route instance for chaining
     * 
     * @example
     * ```typescript
     * route
     *   .addMiddleware(validateRequest(schema))
     *   .addMiddleware(requireAuth())
     *   .addMiddleware(rateLimit({ limit: 10 }));
     * ```
     */
    addMiddleware(middleware: ApiMiddleware): this {
        this.middleware = this.middleware || [];
        this.middleware.push(middleware);
        return this;
    }
}

/**
 * Base API router class
 */
export class BaseApiRouter implements ApiRouter {
    public routes: ApiRoute[];

    constructor() {
        this.routes = [];
    }

    /**
     * Adds a route to the router
     */
    addRoute<T = any, R = any>(route: ApiRoute<T, R>): void {
        this.routes.push(route);
    }

    /**
     * Removes a route from the router
     */
    removeRoute(path: string): void {
        this.routes = this.routes.filter(route => route.path !== path);
    }

    /**
     * Gets a route by path
     */
    getRoute(path: string): ApiRoute | undefined {
        return this.routes.find(route => route.path === path);
    }

    /**
     * Handles a request
     */
    async handle(req: ApiRequest, res: ApiResponse): Promise<void> {
        const route = this.findRoute(req);
        if (!route) {
            res.success = false;
            res.error = {
                code: 'NOT_FOUND',
                message: 'Route not found',
            };
            return;
        }

        try {
            await this.runMiddlewares(route, req, res);
            await route.handler(req, res);
        } catch (error) {
            res.success = false;
            res.error = {
                code: 'INTERNAL_SERVER_ERROR',
                message: error instanceof Error ? error.message : 'Internal server error',
            };
        }
    }

    /**
     * Finds a matching route
     */
    private findRoute(req: ApiRequest): ApiRoute | undefined {
        return this.routes.find(
            route => route.path === req.path && route.method === req.method
        );
    }

    /**
     * Runs route middlewares
     */
    private async runMiddlewares(
        route: ApiRoute,
        req: ApiRequest,
        res: ApiResponse
    ): Promise<void> {
        if (!route.middleware) return;

        for (const middleware of route.middleware) {
            await middleware(req, res, async () => { });
        }
    }
}

/**
 * Creates a new API route
 * 
 * This is a factory function for creating BaseApiRoute instances.
 * 
 * @param path - The URL path for this route
 * @param method - The HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param handler - The function that handles the request and returns a response
 * @returns A new BaseApiRoute instance
 * 
 * @example
 * ```typescript
 * const userRoute = createApiRoute(
 *   '/api/users/:id',
 *   'GET',
 *   async (req, res) => {
 *     // Handle request
 *     return successResponse({ id: req.params.id });
 *   }
 * );
 * ```
 */
export function createApiRoute<T = any, R = any>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    handler: ApiHandler<T, R>
): BaseApiRoute<T, R> {
    return new BaseApiRoute(path, method, handler);
}

/**
 * Creates a new API router
 */
export function createApiRouter(): ApiRouter {
    return new BaseApiRouter();
}