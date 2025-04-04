import { NextRequest, NextResponse } from 'next/server';
import { ApiRequest, ApiResponse, ApiMiddleware, ApiValidationSchema, ApiHandler, RouteConfig } from '@/types/apiClient';
import { z } from 'zod';
import { createErrorResponse } from '@/lib/api/utils';
import { AuditLogger } from '@/lib/audit/logger';
import { withTimeout } from '@/lib/api/utils';
import { AuditAction, AuditStatus } from "@/types/auditLogs";
import { clientInfo } from '@/lib/client';
import { responses } from '@/lib/api/responses';
import { validateRequest, rateLimit, requireAuth, logRequest } from '../middleware';

/**
 * Base API route class
 * 
 * This class provides a foundation for all API routes with common functionality:
 * - Request validation using Zod schemas
 * - Standardized error handling
 * - Request timeout support
 * - Audit logging
 * - Comprehensive error types
 * - Middleware support
 * - Routing capabilities
 */
export class BaseApiRoute<T = any, R = any> {
    protected path?: string;
    protected method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    protected schema?: ApiValidationSchema<T>;
    protected middleware: ApiMiddleware[];
    protected auditAction: AuditAction;
    protected requireAuth: boolean;
    protected rateLimit?: {
        limit: number;
        windowMs: number;
    };
    protected timeout?: number;
    protected handler: ApiHandler<T, R>;
    protected logger: AuditLogger;

    constructor(config: RouteConfig<T, R> = {}) {
        this.path = config.path;
        this.method = config.method;
        this.schema = config.schema;
        this.middleware = config.middleware || [];
        this.auditAction = config.auditAction || AuditAction.SYSTEM_INFO;
        this.requireAuth = config.requireAuth || false;
        this.rateLimit = config.rateLimit ? {
            limit: config.rateLimit.limit || 100,
            windowMs: config.rateLimit.windowMs || 60000
        } : undefined;
        this.timeout = config.timeout;
        this.handler = this.handle.bind(this);
        this.logger = new AuditLogger();

        // Add default middleware
        this.addDefaultMiddleware();
    }

    /**
     * Adds default middleware to the route
     */
    protected addDefaultMiddleware(): void {
        // Add request logging
        this.middleware.unshift(logRequest());

        // Add rate limiting if configured
        if (this.rateLimit) {
            this.middleware.unshift(rateLimit({
                limit: this.rateLimit.limit,
                windowMs: this.rateLimit.windowMs
            }));
        }

        // Add authentication if required
        if (this.requireAuth) {
            this.middleware.unshift(requireAuth());
        }

        // Add request validation if schema is provided
        if (this.schema?.request) {
            this.middleware.unshift(validateRequest(this.schema.request));
        }
    }

    /**
     * Adds middleware to the route
     */
    addMiddleware(middleware: ApiMiddleware): this {
        this.middleware.push(middleware);
        return this;
    }

    /**
     * Sets the route path
     */
    setPath(path: string): this {
        this.path = path;
        return this;
    }

    /**
     * Sets the route method
     */
    setMethod(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'): this {
        this.method = method;
        return this;
    }

    /**
     * Sets the validation schema
     */
    setSchema(schema: ApiValidationSchema<T>): this {
        this.schema = schema;
        return this;
    }

    /**
     * Sets the audit action
     */
    setAuditAction(action: AuditAction): this {
        this.auditAction = action;
        return this;
    }

    /**
     * Sets authentication requirement
     */
    setRequireAuth(require: boolean): this {
        this.requireAuth = require;
        return this;
    }

    /**
     * Sets rate limiting
     */
    setRateLimit(limit: number, windowMs: number = 60000): this {
        this.rateLimit = { limit, windowMs };
        return this;
    }

    /**
     * Sets request timeout
     */
    setTimeout(ms: number): this {
        this.timeout = ms;
        return this;
    }

    /**
     * Main request handler
     */
    async handleRequest(request: NextRequest): Promise<NextResponse> {
        const startTime = Date.now();
        let status = AuditStatus.SUCCESS;

        try {
            // Convert NextRequest to ApiRequest
            const apiRequest = await this.convertRequest(request);

            // Create response object
            const apiResponse: ApiResponse = {
                data: null,
                status: 200,
                headers: {}
            };

            // Run middleware chain
            await this.runMiddleware(apiRequest, apiResponse);

            // Handle the request
            const result = await this.handler(apiRequest);

            // Convert to NextResponse
            return this.createResponse(result);
        } catch (error) {
            status = AuditStatus.FAILURE;
            return this.handleError(error);
        } finally {
            // Log the request
            const duration = Date.now() - startTime;
            await AuditLogger.log({
                action: this.auditAction,
                status,
                details: {
                    method: request.method,
                    path: request.nextUrl.pathname,
                    duration
                }
            });
        }
    }

    /**
     * Request handler to be implemented by child classes
     */
    protected async handle(request: ApiRequest<T>): Promise<ApiResponse<R>> {
        throw new Error('handle method must be implemented by child class');
    }

    /**
     * Converts NextRequest to ApiRequest
     */
    protected async convertRequest(request: NextRequest): Promise<ApiRequest<T>> {
        const body = await request.json().catch(() => undefined);
        const params = Object.fromEntries(request.nextUrl.searchParams);

        return {
            url: request.url,
            path: request.nextUrl.pathname,
            method: request.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
            data: body,
            params,
            headers: Object.fromEntries(request.headers),
            nextUrl: request.nextUrl
        };
    }

    /**
     * Creates a NextResponse from ApiResponse
     */
    protected createResponse(response: ApiResponse<R>): NextResponse {
        return NextResponse.json(response.data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                ...response.headers
            }
        });
    }

    /**
     * Handles errors and creates error response
     */
    protected handleError(error: any): NextResponse {
        console.error('API Error:', error);

        const status = error?.statusCode || 500;
        const message = error?.message || 'An unexpected error occurred';
        const details = process.env.NODE_ENV === 'development' ? error : undefined;

        return NextResponse.json({
            error: {
                code: error?.code || 'INTERNAL_ERROR',
                message,
                details
            }
        }, {
            status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Runs the middleware chain
     */
    protected async runMiddleware(req: ApiRequest, res: ApiResponse): Promise<void> {
        const middleware = [...this.middleware];

        const next = async () => {
            const mw = middleware.shift();
            if (mw) {
                await mw(req, res, next);
            }
        };

        await next();
    }

    /**
     * Validates request data against schema
     */
    protected async validateRequest(data: any): Promise<T> {
        if (!this.schema?.request) {
            return data;
        }

        try {
            return await this.schema.request.parseAsync(data);
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid request data',
                    details: error.errors
                };
            }
            throw error;
        }
    }

    /**
     * Creates a success response
     */
    protected successResponse(data: R, message?: string): ApiResponse<R> {
        return {
            data,
            status: 200,
            headers: {}
        };
    }

    /**
     * Creates an error response
     */
    protected errorResponse(error: {
        code: string;
        message: string;
        details?: any;
    }, statusCode: number = 500): ApiResponse<R> {
        return {
            data: null as any,
            status: statusCode,
            headers: {}
        };
    }

    /**
     * Logs audit information
     */
    protected async logAudit(
        status: AuditStatus,
        details?: Record<string, any>,
        request?: NextRequest
    ): Promise<void> {
        try {
            await AuditLogger.logSystem(
                this.auditAction,
                status,
                details,
                request
            );
        } catch (error) {
            console.error('Failed to log audit:', error);
        }
    }

    /**
     * Method not allowed handler - used for HTTP methods that aren't supported by the route
     * Made public so it can be exported directly in route handlers
     */
    public methodNotAllowed(request: NextRequest): Response {
        return responses.methodNotAllowed(
            `Method ${request.method} not allowed on this endpoint`,
            {
                path: request.nextUrl.pathname,
                method: request.method,
                supportedMethods: this.getSupportedMethods()
            }
        );
    }

    /**
     * Gets the supported HTTP methods for this route
     * Can be overridden in subclasses
     */
    protected getSupportedMethods(): string[] {
        // By default, only handle the method of the function that's bound
        // This helps when you've only exported one method like POST
        return ['OPTIONS', 'HEAD', this.boundMethod || 'GET'];
    }

    /**
     * Stores the bound method for auto-detection of supported methods
     * This is set when binding a route handler to an HTTP method
     */
    private boundMethod?: string;

    /**
     * Binds the route to a specific HTTP method
     */
    public bindToMethod(method: string): (req: NextRequest) => Promise<Response> {
        this.boundMethod = method.toUpperCase();
        return async (req: NextRequest) => {
            const apiRequest = await this.convertRequest(req);
            const result = await this.handler(apiRequest);
            return this.createResponse(result);
        };
    }

    /**
     * Wraps a handler with a timeout
     * 
     * @param handler - The handler function to wrap
     * @param timeoutMs - Timeout in milliseconds
     * @returns The response or an error if timeout occurs
     */
    protected async withTimeout<T>(
        handler: () => Promise<T>,
        timeoutMs: number = 10000
    ): Promise<T> {
        return withTimeout(handler(), timeoutMs);
    }

    /**
     * Logs API errors to the audit system
     */
    protected async logApiError(
        action: AuditAction,
        message: string,
        details: Record<string, any>,
        request: NextRequest
    ): Promise<void> {
        try {
            // Capture important request data before going to the logger
            const requestData = {
                path: request.nextUrl.pathname,
                method: request.method,
                url: request.url,
                time: new Date().toISOString(),
                headers: this.getRequestHeadersForLogging(request)
            };

            await AuditLogger.logSystem(
                action,
                AuditStatus.FAILURE,
                {
                    message,
                    ...details,
                    request: requestData
                },
                request // Pass the whole request object for client info extraction
            );
        } catch (logError) {
            // Don't let logging errors disrupt the main flow
            console.error('Failed to log API error:', logError);
        }
    }

    /**
     * Extract headers for logging, removing sensitive information
     */
    private getRequestHeadersForLogging(request: NextRequest): Record<string, string> {
        const headers: Record<string, string> = {};

        try {
            if (request && request.headers) {
                // Get important headers specifically
                const importantHeaders = [
                    'user-agent',
                    'referer',
                    'origin',
                    'x-forwarded-for',
                    'x-real-ip',
                    'cf-connecting-ip',
                    'true-client-ip',
                    'x-client-ip',
                    'content-type',
                    'accept',
                    'accept-language',
                    'x-vercel-forwarded-for'
                ];

                // Only log specific headers to avoid sensitive data
                for (const header of importantHeaders) {
                    const value = request.headers.get(header);
                    if (value) {
                        headers[header] = value;
                    }
                }
            }
        } catch (error) {
            console.warn('Error extracting headers for logging:', error);
        }

        return headers;
    }

    /**
     * Safely extracts request IP for logging purposes
     */
    private extractRequestIp(request: NextRequest): string {
        try {
            const ipHeaders = [
                'x-vercel-forwarded-for',
                'cf-connecting-ip',
                'x-forwarded-for',
                'true-client-ip',
                'x-real-ip'
            ];

            for (const header of ipHeaders) {
                const value = request.headers.get(header);
                if (value) {
                    const ip = header.includes('forwarded-for')
                        ? value.split(',')[0].trim()
                        : value;
                    return ip;
                }
            }

            // Try edge runtime ip property (NextRequest in edge runtime might have this)
            const edgeRequest = request as any;
            if (edgeRequest.ip) return edgeRequest.ip;

            return 'unknown';
        } catch (error) {
            console.warn('Failed to extract IP from request:', error);
            return 'unknown';
        }
    }

    /**
     * Safely extracts request headers for logging
     */
    private extractRequestHeaders(request: NextRequest): Record<string, string> {
        try {
            const headers: Record<string, string> = {};
            request.headers.forEach((value, key) => {
                // Avoid logging sensitive headers
                if (!['cookie', 'authorization'].includes(key.toLowerCase())) {
                    headers[key] = value;
                }
            });
            return headers;
        } catch (error) {
            return { error: 'Failed to extract headers' };
        }
    }

    /**
     * Gets client information from a request
     * 
     * @param request - The NextRequest object
     * @returns Client information including IP, user agent, etc.
     */
    protected async getClientInfo(request: NextRequest): Promise<Record<string, any>> {
        try {
            return await clientInfo.getClientInfo(request, false);
        } catch (error) {
            console.error('Failed to get client info:', error);
            return {
                ip: 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown',
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Extracts form data from a request
     * 
     * @param request - The NextRequest object
     * @returns Parsed form data
     */
    protected async getFormData(request: NextRequest): Promise<Record<string, any>> {
        try {
            const formData = await request.formData();
            return Object.fromEntries(formData);
        } catch (error) {
            console.error('Failed to parse form data:', error);
            throw new Error('Invalid form data');
        }
    }
}