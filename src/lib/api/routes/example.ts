import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { BaseApiRoute } from './base';
import { AuditAction } from '@/types/auditLogs';
import { validateRequest, rateLimit, requireAuth } from '../middleware';

// Define request and response schemas
const ExampleRequestSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    age: z.number().int().min(0).max(120).optional(),
    preferences: z.object({
        theme: z.enum(['light', 'dark']),
        notifications: z.boolean()
    }).optional()
});

const ExampleResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    createdAt: z.string().datetime(),
    preferences: z.object({
        theme: z.enum(['light', 'dark']),
        notifications: z.boolean()
    }).optional()
});

// Define types based on schemas
type ExampleRequest = z.infer<typeof ExampleRequestSchema>;
type ExampleResponse = z.infer<typeof ExampleResponseSchema>;

export class ExampleRoute extends BaseApiRoute<ExampleRequest, ExampleResponse> {
    constructor() {
        super({
            schema: {
                request: ExampleRequestSchema,
                response: ExampleResponseSchema
            },
            middleware: [
                // Add rate limiting (100 requests per minute)
                rateLimit({ limit: 100, windowMs: 60000 }),
                // Add authentication requirement
                requireAuth(),
                // Add request validation
                validateRequest(ExampleRequestSchema)
            ],
            auditAction: AuditAction.SYSTEM_WARNING,
            requireAuth: true
        });
    }

    protected async handle(request: NextRequest): Promise<NextResponse> {
        try {
            // Get validated request data
            const data = await this.validateRequest(request);

            // Process the request (example: create a new user)
            const result = {
                id: crypto.randomUUID(),
                name: data.name,
                email: data.email,
                createdAt: new Date().toISOString(),
                preferences: data.preferences
            };

            // Return success response
            return this.successResponse(result);
        } catch (error: any) {
            // Handle specific errors
            if (error?.code === 'VALIDATION_ERROR') {
                return this.errorResponse({
                    code: 'INVALID_INPUT',
                    message: 'Invalid input data',
                    details: error.details
                }, 400);
            }

            // Handle other errors
            return this.errorResponse({
                code: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred',
                details: process.env.NODE_ENV === 'development' ? error : undefined
            }, 500);
        }
    }
}

// Example usage in a Next.js API route:
/*
import { ExampleRoute } from '@/lib/api/routes/example';

const route = new ExampleRoute();

export async function POST(request: NextRequest) {
    return route.handler(request);
}
*/ 