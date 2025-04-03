import { NextRequest } from 'next/server';
import { z } from 'zod';
import { errors } from '@/lib/api/responses';
import { AuditLogger } from '@/lib/audit/logger';
import { withTimeout } from '@/lib/api/utils';
import { AuditAction, AuditStatus } from "@/types/auditLogs";
import { clientInfo } from '@/lib/client';

/**
 * Base API route class
 * 
 * This class provides a foundation for all API routes with common functionality:
 * - Request validation using Zod schemas
 * - Standardized error handling
 * - Request timeout support
 * - Audit logging
 * - Comprehensive error types
 */
export abstract class BaseApiRoute<TRequest = any, TResponse = any> {
    private schema: z.ZodType<TRequest>;
    
    /**
     * Creates a new API route with request validation
     * 
     * @param schema - The Zod schema used to validate incoming requests
     */
    constructor(schema: z.ZodType<TRequest>) {
        this.schema = schema;
    }

    /**
     * Entry point for handling HTTP requests
     * Must be implemented by subclasses
     */
    abstract handle(request: NextRequest): Promise<Response>;

    /**
     * Method not allowed handler - used for HTTP methods that aren't supported by the route
     * Made public so it can be exported directly in route handlers
     */
    public methodNotAllowed(request: NextRequest): Response {
        return errors.methodNotAllowed(
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
     * Binds this route's handle method to a specific HTTP method
     */
    public bindToMethod(method: string): (req: NextRequest) => Promise<Response> {
        this.boundMethod = method.toUpperCase();
        return this.handle.bind(this);
    }

    /**
     * Validates a request against the schema
     * 
     * @param request - The NextRequest object
     * @returns The validated request data
     */
    protected async validateRequest(request: NextRequest): Promise<TRequest> {
        try {
            let data: any;
            
            // Check HTTP method to determine how to parse the request
            const method = request.method.toUpperCase();
            
            if (method === 'GET') {
                // For GET requests, extract data from URL parameters
                const url = new URL(request.url);
                const params: Record<string, any> = {};
                
                for (const [key, value] of url.searchParams.entries()) {
                    params[key] = value;
                }
                
                data = params;
            } else {
                // For other methods, try to parse JSON body
                try {
                    const contentType = request.headers.get('content-type');
                    
                    if (contentType?.includes('application/json')) {
                        // Parse JSON body
                        data = await request.json();
                    } else if (contentType?.includes('multipart/form-data')) {
                        // Handle form data
                        const formData = await request.formData();
                        data = Object.fromEntries(formData);
                    } else if (contentType?.includes('application/x-www-form-urlencoded')) {
                        // Handle URL encoded form data
                        const formData = await request.formData();
                        data = Object.fromEntries(formData);
                    } else {
                        // Fallback: try to parse as JSON anyway
                        try {
                            data = await request.json();
                        } catch (e) {
                            // If parsing fails, use an empty object
                            data = {};
                        }
                    }
                } catch (error) {
                    console.error('Error parsing request body:', error);
                    throw new Error('Invalid request format');
                }
            }
            
            // Validate the data against the schema
            return await this.schema.parseAsync(data);
        } catch (error) {
            // Log validation errors
            await this.logApiError(
                AuditAction.SYSTEM_WARNING,
                'Request validation failed',
                {
                    error: error instanceof Error ? error.message : String(error),
                    url: request.url,
                    method: request.method
                },
                request
            );
            
            // Handle Zod validation errors
            if (error instanceof z.ZodError) {
                const issues = error.issues.map(issue => ({
                    path: issue.path.join('.'),
                    message: issue.message
                }));
                
                throw {
                    type: 'validation',
                    issues
                };
            }
            
            throw error;
        }
    }
    
    /**
     * Handles errors that occur during request processing
     * 
     * @param error - The error object
     * @returns A standardized error response
     */
    protected handleError(error: any): Response {
        // Log the error
        console.error('API error:', error);
        
        // Handle validation errors
        if (error && error.type === 'validation') {
            return errors.badRequest('Validation failed', {
                validation: error.issues
            });
        }
        
        // Handle timeout errors
        if (error instanceof Error && error.message.includes('timed out')) {
            return errors.timeout('Request timed out');
        }
        
        // Handle database errors
        if (error?.code?.startsWith('P')) {
            return errors.internal('Database operation failed');
        }
        
        // Handle other errors
        return errors.internal(
            error instanceof Error ? error.message : 'An unexpected error occurred'
        );
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
     * 
     * @param action - The action that was being performed
     * @param message - Error message
     * @param details - Additional error details
     * @param request - The original request
     */
    protected async logApiError(
        action: AuditAction,
        message: string,
        details: Record<string, any>,
        request: NextRequest
    ): Promise<void> {
        try {
            await AuditLogger.logSystem(
                action,
                AuditStatus.FAILURE,
                {
                    message,
                    ...details,
                    path: request.nextUrl.pathname,
                    method: request.method,
                },
                request
            );
        } catch (logError) {
            // Don't let logging errors disrupt the main flow
            console.error('Failed to log API error:', logError);
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