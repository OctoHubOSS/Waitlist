import { z } from 'zod';

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

// Common validation schemas
export const schemas = {
    // User schemas
    user: {
        id: z.string().cuid(),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        name: z.string().optional(),
        login: z.string().optional(),
    },

    // Repository schemas
    repo: {
        owner: z.string().min(1, "Repository owner is required"),
        name: z.string().min(1, "Repository name is required"),
        fullPath: z.string().regex(/^[^\/]+\/[^\/]+$/, "Invalid repository path (should be owner/repo)"),
        branch: z.string().optional(),
    },

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
            owner: schemas.repo.owner,
            repo: schemas.repo.name,
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
        email: schemas.user.email,
        password: schemas.user.password,
        name: schemas.user.name,
        image: z.string().url("Invalid image URL").optional(),
    }),
};

/**
 * Validates query parameters from a NextRequest
 * 
 * @param req Next.js request object
 * @param schema Zod schema to validate against
 * @returns Validation result
 */
export function validateQuery<T>(req: Request, schema: z.ZodType<T>): ValidationResult<T> {
    const url = new URL(req.url);
    const params: Record<string, any> = {};

    // Convert URLSearchParams to a plain object
    url.searchParams.forEach((value, key) => {
        params[key] = value;
    });

    return validate(schema, params);
}

/**
 * Validates request body from a NextRequest 
 * 
 * @param req Next.js request object
 * @param schema Zod schema to validate against
 * @returns Promise with validation result
 */
export async function validateBody<T>(req: Request, schema: z.ZodType<T>): Promise<ValidationResult<T>> {
    try {
        const body = await req.json();
        return validate(schema, body);
    } catch (error) {
        return {
            success: false,
            error: {
                message: "Failed to parse request body",
                details: error instanceof Error ? error.message : "Unknown error"
            }
        } as ValidationError;
    }
}