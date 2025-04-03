import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiValidationSchema } from './types';

/**
 * Common validation schemas and utilities for API endpoints
 */

// Define proper discriminated union types for validation results
export type ValidationSuccess<T> = {
    success: true;
    data: T;
    error?: never;
};

export type ValidationError = {
    success: false;
    data?: never;
    error: {
        message: string;
        details: z.ZodError | any;
    };
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

// Add Zod enums for Prisma enums
export const enums = {
    userStatus: z.enum(["ONLINE", "IDLE", "DO_NOT_DISTURB", "BUSY", "AWAY", "OFFLINE", "INVISIBLE"]),
    userRole: z.enum(["ADMIN", "MODERATOR", "USER", "READONLY", "BANNED"]),
    repoSource: z.enum(["OCTOFLOW", "GITHUB", "GITLAB", "BITBUCKET"]),
    orgRole: z.enum(["OWNER", "ADMIN", "MEMBER"]),
    repoPermission: z.enum(["READ", "WRITE", "ADMIN"]),
    issueState: z.enum(["OPEN", "CLOSED"]),
    pullRequestState: z.enum(["OPEN", "CLOSED", "MERGED"]),
    milestoneState: z.enum(["OPEN", "CLOSED"]),
    reactionType: z.enum(["THUMBS_UP", "THUMBS_DOWN", "LAUGH", "CONFUSED", "HEART", "HOORAY", "ROCKET", "EYES"]),
    packageVisibility: z.enum(["PUBLIC", "PRIVATE", "INTERNAL"]),
    packageType: z.enum(["NPM", "MAVEN", "RUBYGEMS", "DOCKER", "NUGET", "PYPI", "CARGO", "COMPOSER"]),
    branchProtectionLevel: z.enum(["NONE", "LOW", "MEDIUM", "HIGH"]),
    statsPeriod: z.enum(["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
    trendingPeriod: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    trendingType: z.enum(["USER", "ORGANIZATION", "REPOSITORY"]),
};

// Common validation schemas
export const schemas = {
    /**
     * Email validation schema
     */
    email: z.string().email('Invalid email address'),

    /**
     * Password validation schema
     */
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),

    /**
     * Name validation schema
     */
    name: z.string().min(2, 'Name must be at least 2 characters'),

    /**
     * Display name validation schema
     */
    displayName: z
        .string()
        .min(3, 'Display name must be at least 3 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Display name can only contain letters, numbers, underscores, and hyphens'),

    /**
     * Waitlist status validation schema
     */
    waitlistStatus: z.enum(['SUBSCRIBED', 'UNSUBSCRIBED', 'REGISTERED', 'REJECTED']),

    /**
     * User status validation schema
     */
    userStatus: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']),

    /**
     * User role validation schema
     */
    userRole: z.enum(['ADMIN', 'DEVELOPER', 'CONTRIBUTOR', 'MAINTAINER', 'MEMBER', 'READONLY', 'BANNED']),

    /**
     * ID validation schema
     */
    id: z.string().uuid('Invalid ID format'),

    /**
     * Date validation schema
     */
    date: z.string().datetime('Invalid date format'),

    /**
     * URL validation schema
     */
    url: z.string().url('Invalid URL format'),

    /**
     * Phone number validation schema
     */
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),

    /**
     * Username validation schema
     */
    username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),

    // User schemas
    user: z.object({
        id: z.string().cuid(),
        name: z.string().optional(),
        displayName: z.string().optional(),
        email: z.string().email().optional(),
        emailVerified: z.date().optional(),
        password: z.string().optional(),
        image: z.string().url().optional(),
        bio: z.string().optional(),
        website: z.string().url().optional(),
        location: z.string().optional(),
        createdAt: z.date(),
        updatedAt: z.date(),
        deletedAt: z.date().optional(),
        lastLoginAt: z.date().optional(),
        lastActiveAt: z.date().optional(),
        status: enums.userStatus,
        role: enums.userRole,
    }),

    // Repository schemas
    repository: z.object({
        id: z.string().cuid(),
        name: z.string().min(1, "Repository name is required"),
        description: z.string().optional(),
        isPrivate: z.boolean().default(false),
        defaultBranch: z.string().default("main"),
        language: z.string().optional(),
        forkCount: z.number().int().default(0),
        starCount: z.number().int().default(0),
        size: z.number().int().default(0),
        watcherCount: z.number().int().default(0),
        createdAt: z.date(),
        updatedAt: z.date(),
        lastPushedAt: z.date().optional(),
        deletedAt: z.date().optional(),
        source: enums.repoSource,
        ownerId: z.string().optional(), // Added ownerId field
    }),

    // Organization schemas
    organization: z.object({
        id: z.string().cuid(),
        name: z.string().min(1, "Organization name is required"),
        displayName: z.string().optional(),
        description: z.string().optional(),
        avatarUrl: z.string().url().optional(),
        website: z.string().url().optional(),
        location: z.string().optional(),
        email: z.string().email().optional(),
        isPublic: z.boolean().default(true),
        createdAt: z.date(),
        updatedAt: z.date(),
    }),

    // Pagination schemas
    pagination: {
        page: z.coerce.number().int().positive().default(1),
        perPage: z.coerce.number().int().positive().max(100).default(30),
    },

    // Sorting and filtering
    sorting: {
        sort: z.enum(["created", "updated", "pushed", "full_name"]).optional(),
        direction: z.enum(["asc", "desc"]).default("desc"),
    },

    // GitHub time periods
    timePeriod: z.enum(["daily", "weekly", "monthly"]).default("daily"),

    // Authentication tokens
    tokens: {
        accessToken: z.string().min(1, "Access token is required"),
        refreshToken: z.string().optional(),
    },

    // Password usage
    passwords: {
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "New password must be at least 8 characters")
    },

    // Authentication Management
    authentication: {
        token: z.string().min(1, "Reset token is required."),
        email: z.string().email("Invalid email address provided."),
        password: z.string().min(8, "Password must be at least 8 characters.")
    }
};

/**
 * Validates request data using a Zod schema and returns a standardized response
 * 
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @returns Object with success flag and either validated data or error details
 */
export function validate<T>(schema: z.ZodType<T>, data: any): ValidationResult<T> {
    try {
        const validatedData = schema.parse(data);
        return {
            success: true,
            data: validatedData
        } as ValidationSuccess<T>;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: {
                    message: "Validation failed",
                    details: error
                }
            } as ValidationError;
        }
        return {
            success: false,
            error: {
                message: "Unknown validation error",
                details: error
            }
        } as ValidationError;
    }
}

/**
 * Creates a compound schema by combining multiple schemas
 * 
 * @param schemas Array of schemas to combine
 * @returns Combined schema
 */
export function combineSchemas<T extends z.ZodRawShape[]>(...schemas: T) {
    return z.object(Object.assign({}, ...schemas));
}

// Common validation schema builders for API endpoints
export const apiSchemas = {
    /**
     * Creates a schema for repository endpoint validation
     */
    repository: (additionalFields?: z.ZodRawShape) => {
        const baseSchema = {
            ownerId: schemas.repository.shape.ownerId, // Fixed reference to ownerId
            repo: schemas.repository.shape.name,
        };

        if (additionalFields) {
            return z.object({ ...baseSchema, ...additionalFields });
        }

        return z.object(baseSchema);
    },

    /**
     * Creates a schema for paginated endpoints
     */
    paginated: (additionalFields?: z.ZodRawShape) => {
        const baseSchema = {
            page: schemas.pagination.page,
            per_page: schemas.pagination.perPage,
        };

        if (additionalFields) {
            return z.object({ ...baseSchema, ...additionalFields });
        }

        return z.object(baseSchema);
    },

    /**
     * Creates a schema for search endpoints
     */
    search: (additionalFields?: z.ZodRawShape) => {
        const baseSchema = {
            q: z.string().min(1, "Search query is required").optional(),
            page: schemas.pagination.page,
            per_page: schemas.pagination.perPage,
            sort: z.enum(['relevance', 'stars', 'forks', 'updated', 'created']).default('relevance'),
            order: schemas.sorting.direction,
            type: z.enum(['all', 'repositories', 'users', 'organizations', 'code']).default('all'),
            // Advanced search fields
            name: z.string().optional(),
            description: z.string().optional(),
            language: z.string().optional(),
            topics: z.array(z.string()).optional(),
            owner: z.string().optional(),
            organization: z.string().optional(),
            stars: z.string().regex(/^\d+$|^\d+\.\.\d+$|^\d+\.\*$|^\*\.\.\d+$/, "Invalid stars range format").optional(),
            forks: z.string().regex(/^\d+$|^\d+\.\.\d+$|^\d+\.\*$|^\*\.\.\d+$/, "Invalid forks range format").optional(),
            size: z.string().regex(/^\d+$|^\d+\.\.\d+$|^\d+\.\*$|^\*\.\.\d+$/, "Invalid size range format").optional(),
            created: z.string().regex(/^\d{4}-\d{2}-\d{2}$|^\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
            updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$|^\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
            license: z.string().optional(),
            archived: z.boolean().optional(),
            is_template: z.boolean().optional(),
            visibility: z.enum(['public', 'private']).optional(),
            // User/Organization specific fields
            username: z.string().optional(),
            email: z.string().email().optional(),
            location: z.string().optional(),
            followers: z.string().regex(/^\d+$|^\d+\.\.\d+$|^\d+\.\*$|^\*\.\.\d+$/, "Invalid followers range format").optional(),
            repos: z.string().regex(/^\d+$|^\d+\.\.\d+$|^\d+\.\*$|^\*\.\.\d+$/, "Invalid repos range format").optional(),
            joined: z.string().regex(/^\d{4}-\d{2}-\d{2}$|^\d{4}-\d{2}-\d{2}\.\.\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
            // Code search specific fields
            filename: z.string().optional(),
            extension: z.string().optional(),
            path: z.string().optional(),
        };

        if (additionalFields) {
            return z.object({ ...baseSchema, ...additionalFields });
        }

        return z.object(baseSchema);
    },

    /**
     * Creates a schema for trending endpoints
     */
    trending: (additionalFields?: z.ZodRawShape) => {
        const baseSchema = {
            type: z.enum(['REPOSITORY', 'USER', 'ORGANIZATION']).default('REPOSITORY'),
            period: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('DAILY'),
            limit: z.coerce.number().int().min(1).max(100).default(10)
        };

        if (additionalFields) {
            return z.object({ ...baseSchema, ...additionalFields });
        }

        return z.object(baseSchema);
    },

    /**
     * Creates a schema for suggestions endpoints
     */
    suggestions: (additionalFields?: z.ZodRawShape) => {
        const baseSchema = {
            q: z.string().default(''),
            types: z.array(z.enum(['repository', 'user', 'organization', 'language', 'topic', 'trending']))
                .default(['repository', 'user', 'organization', 'language', 'topic', 'trending']),
            limit: z.coerce.number().int().min(1).max(20).default(5)
        };

        if (additionalFields) {
            return z.object({ ...baseSchema, ...additionalFields });
        }

        return z.object(baseSchema);
    },

    /**
     * Registration schema for user accounts
     */
    registration: z.object({
        email: schemas.user.shape.email,
        password: schemas.user.shape.password,
        name: schemas.user.shape.name,
        displayName: z.string().min(3).regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
        image: z.any().optional(), // Allow any image data since it's handled separately
    }),
};

/**
 * Validates query parameters from a NextRequest
 * 
 * @param req Next.js request object
 * @param schema Zod schema to validate against
 * @returns Validation result
 */
export async function validateQuery<T>(req: NextRequest, schema: z.ZodType<T>): Promise<ValidationResult<T>> {
    try {
        // Get query params as object
        const queryParams: Record<string, string> = {};
        for (const [key, value] of req.nextUrl.searchParams.entries()) {
            queryParams[key] = value;
        }

        // Validate with zod schema
        const result = schema.safeParse(queryParams);

        if (!result.success) {
            return {
                success: false,
                error: {
                    details: result.error.format(),
                    message: 'Query validation failed'
                }
            };
        }

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        return {
            success: false,
            error: {
                details: { _errors: ['Invalid query parameters'] },
                message: error instanceof Error ? error.message : 'Failed to parse query parameters'
            }
        };
    }
}

/**
 * Validates request body from a NextRequest 
 * 
 * @param req Next.js request object
 * @param schema Zod schema to validate against
 * @returns Promise with validation result
 */
export async function validateBody<T>(req: NextRequest, schema: z.ZodType<T>): Promise<ValidationResult<T>> {
    try {
        const body = await req.json();

        // Validate with zod schema
        const result = schema.safeParse(body);

        if (!result.success) {
            return {
                success: false,
                error: {
                    details: result.error.format(),
                    message: 'Validation failed'
                }
            };
        }

        return {
            success: true,
            data: result.data
        };
    } catch (error) {
        return {
            success: false,
            error: {
                details: { _errors: ['Invalid JSON body'] },
                message: error instanceof Error ? error.message : 'Failed to parse request body'
            }
        };
    }
}

/**
 * Common validation schemas for requests
 */
export const requestSchemas = {
    /**
     * Waitlist subscription request schema
     */
    subscribe: z.object({
        email: schemas.email,
        name: schemas.name.optional(),
        source: z.string().optional(),
        metadata: z.record(z.any()).optional(),
    }),

    /**
     * Waitlist unsubscribe request schema
     */
    unsubscribe: z.object({
        email: schemas.email,
    }),

    /**
     * Waitlist check request schema
     */
    checkWaitlist: z.object({
        email: schemas.email,
    }),

    /**
     * Registration request schema
     */
    register: z.object({
        email: schemas.email,
        password: schemas.password,
        name: schemas.name,
        displayName: schemas.displayName,
        image: z.any().optional(), // Allow any image data since it's handled separately
    }),

    /**
     * Login request schema
     */
    login: z.object({
        email: schemas.email,
        password: schemas.password,
    }),

    /**
     * Password reset request schema
     */
    resetPassword: z.object({
        email: schemas.email,
    }),

    /**
     * Email verification request schema
     */
    verifyEmail: z.object({
        email: schemas.email,
        code: z.string().length(6, 'Invalid verification code'),
    }),

    /**
     * Two-factor authentication setup request schema
     */
    setup2FA: z.object({
        code: z.string().length(6, 'Invalid verification code'),
    }),

    /**
     * Two-factor authentication verification request schema
     */
    verify2FA: z.object({
        code: z.string().length(6, 'Invalid verification code'),
    }),

    /**
     * Update user request schema
     */
    updateUser: z.object({
        name: schemas.name.optional(),
        email: schemas.email.optional(),
        phone: schemas.phone.optional(),
    }),
};

// Define the user schema separately to avoid circular reference
const userSchema = z.object({
    id: z.string(),
    name: schemas.name,
    displayName: schemas.displayName,
    email: schemas.email,
    image: z.object({
        data: z.string(),
        format: z.string(),
        width: z.number(),
        height: z.number(),
        size: z.number(),
    }).optional(),
    role: schemas.userRole,
    status: schemas.userStatus,
    emailVerified: z.string().datetime().nullable(),
    twoFactorEnabled: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

/**
 * Common validation schemas for responses
 */
export const responseSchemas = {
    /**
     * Waitlist subscriber response schema
     */
    subscriber: z.object({
        id: z.string(),
        email: schemas.email,
        name: schemas.name.optional(),
        status: schemas.waitlistStatus,
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
    }),

    /**
     * User response schema
     */
    user: userSchema,

    /**
     * Authentication response schema
     */
    auth: z.object({
        user: userSchema,
        token: z.string(),
    }),

    /**
     * Error response schema
     */
    error: z.object({
        success: z.literal(false),
        error: z.object({
            code: z.string(),
            message: z.string(),
            details: z.any().optional(),
        }),
    }),
};

/**
 * Creates a validation schema for a request
 */
export function createRequestSchema<T extends z.ZodType>(schema: T): z.ZodType<z.infer<T>> {
    return schema;
}

/**
 * Creates a validation schema for a response
 */
export function createResponseSchema<T extends z.ZodType>(schema: T): z.ZodType<z.infer<T>> {
    return schema;
}

/**
 * Creates a combined validation schema for both request and response
 */
export function createApiSchema<T extends z.ZodType, R extends z.ZodType>(requestSchema: T, responseSchema: R) {
    return {
        request: requestSchema,
        response: responseSchema,
    };
}