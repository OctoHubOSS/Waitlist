# API Library

A comprehensive API library for handling HTTP requests, responses, and route management in a Next.js application.

## Structure

```
src/lib/api/
├── client/           # API client implementation
│   ├── base.ts       # Base client with core functionality
│   ├── cache.ts      # Caching utilities
│   ├── interceptors.ts # Request/response interceptors
│   ├── session.ts    # Session management
│   └── index.ts      # Client exports
├── config/           # Configuration management
│   ├── constants.ts  # API constants and settings
│   ├── config.ts     # Configuration utilities
│   └── index.ts      # Config exports
├── middleware/       # API middleware
│   ├── auth.ts       # Authentication middleware
│   ├── logging.ts    # Request logging
│   ├── rate-limit.ts # Rate limiting
│   ├── validation.ts # Request validation
│   └── index.ts      # Middleware exports
├── routes/           # Route handlers
│   ├── auth/         # Authentication routes
│   ├── bug-reports/  # Bug report routes
│   ├── dashboard/    # Dashboard routes
│   ├── waitlist/     # Waitlist routes
│   ├── base.ts       # Base route handler
│   ├── example.ts    # Example route
│   ├── utils.ts      # Route utilities
│   └── index.ts      # Route exports
├── services/         # API services
│   ├── base.ts       # Base service implementation
│   ├── waitlist.ts   # Waitlist service
│   └── index.ts      # Service exports
├── utils/            # Utility functions
│   ├── responses.ts  # Response utilities
│   ├── validation.ts # Validation utilities
│   ├── error.ts      # Error handling
│   └── index.ts      # Utility exports
└── index.ts          # Main API exports
```

## Core Components

### Client

The API client handles HTTP requests with features like:
- Request/response interceptors
- Caching
- Session management
- Retry logic
- Error handling

```typescript
import { createApiClient } from '@/lib/api/client';

const client = createApiClient({
    baseUrl: '/api',
    timeout: 10000,
    retries: 3
});

// Make requests
const response = await client.get('/endpoint');
```

### Services

Services provide a higher-level abstraction for API interactions:
- Base service with common functionality
- Feature-specific services (e.g., waitlist, auth)
- Request validation
- Error handling

```typescript
import { waitlistService } from '@/lib/api/services';

// Use the waitlist service
const response = await waitlistService.createSubscriber({
    email: 'user@example.com',
    name: 'John Doe'
});
```

### Middleware

Middleware functions for request processing:
- Authentication
- Rate limiting
- Request validation
- Logging

```typescript
import { requireAuth, rateLimit, validateRequest, logRequest } from '@/lib/api/middleware';

// Apply middleware to a route
export const handler = async (req: NextRequest) => {
    await requireAuth(req);
    await rateLimit(req);
    await validateRequest(req, schema);
    await logRequest(req);
    // ... handle request
};
```

### Routes

Route handlers for different API endpoints:
- Base route with common functionality
- Feature-specific routes
- Request validation
- Response formatting

```typescript
import { BaseApiRoute } from '@/lib/api/routes';

class MyRoute extends BaseApiRoute {
    constructor() {
        super({
            path: '/my-route',
            method: 'GET',
            schema: mySchema,
            middleware: [requireAuth, rateLimit]
        });
    }

    async handle(req: ApiRequest) {
        // Handle request
        return this.createSuccessResponse(data);
    }
}
```

### Utilities

Common utility functions:
- Response creation
- Error handling
- Request validation
- Type checking

```typescript
import { 
    createSuccessResponse, 
    createErrorResponse,
    validateData,
    handleError 
} from '@/lib/api/utils';

// Create responses
const success = createSuccessResponse(data);
const error = createErrorResponse('Something went wrong');

// Validate data
const result = validateData(schema, data);

// Handle errors
const apiError = handleError(error);
```

## Configuration

API configuration is managed through environment variables and config files:

```typescript
import { getApiConfig } from '@/lib/api/config';

const config = getApiConfig();
```

Configuration options include:
- Base URL
- Timeouts
- Retry settings
- Cache settings
- Authentication
- Rate limiting

## Error Handling

The library provides comprehensive error handling:
- Standardized error responses
- Error types for different scenarios
- Error formatting and logging
- Error recovery strategies

```typescript
import { 
    ApiError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    RateLimitError,
    InternalError
} from '@/types/apiClient';
```

## Type Safety

The library is fully typed with TypeScript:
- Request/response types
- Validation schemas
- Error types
- Configuration types
- Service interfaces

```typescript
import { 
    ApiRequest,
    ApiResponse,
    ApiError,
    ApiValidationSchema,
    ApiConfig
} from '@/types/apiClient';
```

## Best Practices

1. **Use Services**: Prefer using services over direct client calls for better abstraction
2. **Validate Requests**: Always validate incoming requests
3. **Handle Errors**: Use the provided error handling utilities
4. **Use Middleware**: Apply appropriate middleware for common functionality
5. **Type Safety**: Leverage TypeScript for type safety
6. **Configuration**: Use environment-specific configuration
7. **Logging**: Implement proper logging for debugging and monitoring
8. **Testing**: Write tests for services and routes

## Examples

### Creating a Service

```typescript
import { BaseApiService } from '@/lib/api/services/base';
import { ApiResponse, ApiValidationSchema } from '@/types/apiClient';
import { z } from 'zod';

const mySchema: ApiValidationSchema = {
    request: z.object({
        name: z.string(),
        email: z.string().email()
    }),
    response: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string()
    })
};

export class MyService extends BaseApiService {
    async createUser(data: { name: string; email: string }): Promise<ApiResponse> {
        return this.executeRequest({
            method: 'POST',
            endpoint: '/users',
            data,
            schema: mySchema
        });
    }
}
```

### Creating a Route

```typescript
import { BaseApiRoute } from '@/lib/api/routes';
import { requireAuth, rateLimit } from '@/lib/api/middleware';
import { z } from 'zod';

const schema = z.object({
    name: z.string(),
    email: z.string().email()
});

export class UserRoute extends BaseApiRoute {
    constructor() {
        super({
            path: '/users',
            method: 'POST',
            schema,
            middleware: [requireAuth, rateLimit],
            auditAction: 'CREATE_USER'
        });
    }

    async handle(req: ApiRequest) {
        const { name, email } = req.data;
        // Create user
        return this.createSuccessResponse({ id: '123', name, email });
    }
}
```

### Using Middleware

```typescript
import { NextRequest } from 'next/server';
import { 
    requireAuth, 
    rateLimit, 
    validateRequest, 
    logRequest 
} from '@/lib/api/middleware';
import { z } from 'zod';

const schema = z.object({
    name: z.string(),
    email: z.string().email()
});

export async function handler(req: NextRequest) {
    try {
        // Apply middleware
        await requireAuth(req);
        await rateLimit(req);
        await validateRequest(req, schema);
        await logRequest(req);

        // Handle request
        const { name, email } = await req.json();
        // Process request
        return new Response(JSON.stringify({ success: true }));
    } catch (error) {
        // Handle errors
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 500 }
        );
    }
}
```
