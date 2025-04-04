# API Library for Waitlist Application

This library provides a robust foundation for making API requests and managing API-related functionality in the Waitlist application.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Usage Examples](#usage-examples)
   - [Basic API Requests](#basic-api-requests)
   - [API Routes](#api-routes)
   - [Services](#services)
   - [Validation](#validation)
   - [Middleware](#middleware)
5. [Type System](#type-system)
6. [Error Handling](#error-handling)
7. [Configuration](#configuration)
8. [Best Practices](#best-practices)

## Overview

The API library serves as a central system for handling all API-related operations in the Waitlist application. It provides tools for:

- Making HTTP requests with automatic retries, timeouts, and error handling
- Creating and managing API routes and endpoints
- Validating requests and responses using Zod schemas
- Managing authentication and sessions
- Centralizing all API-related code in a maintainable structure

## Features

- **Robust Error Handling**: Built-in error handling for network issues, timeouts, and validation failures
- **Type Safety**: Comprehensive TypeScript definitions for end-to-end type safety
- **Automatic Session Management**: Seamless integration with NextAuth for authentication
- **Middleware Support**: Pluggable middleware for cross-cutting concerns like rate limiting
- **Response Normalization**: Consistent response format across all endpoints
- **Request Validation**: Schema-based validation using Zod
- **Retry Logic**: Automatic retry with exponential backoff
- **Request Timeouts**: Configurable timeouts for all requests
- **Rate Limiting**: Built-in support for rate limiting
- **Audit Logging**: Integration with the audit system for security tracking
- **Domain-Specific Routes**: Specialized route base classes for different domains (waitlist, auth, dashboard, bug reports)

## Architecture

The API library is organized into several key components:

- **Client**: For making API requests (`client.ts`)
- **Types**: Central type definitions (`types.ts`)
- **Utilities**: Helper functions for API operations (`utils.ts`)
- **Validation**: Schema validation utilities (`validation.ts`)
- **Routes**: Route definitions and handlers
  - **Base Route**: Foundation for all routes (`routes/base.ts`)
  - **Auth Routes**: Authentication-specific routes (`routes/auth`)
  - **Waitlist Routes**: Waitlist-specific routes (`routes/waitlist`) 
  - **Dashboard Routes**: Dashboard-specific routes (`routes/dashboard`)
  - **Bug Reports Routes**: Bug reporting features (`routes/bug-reports`)
- **Services**: Service-oriented APIs (`services.ts`)
- **Middleware**: Request/response interceptors (`middleware.ts`)
- **Configuration**: Environment-specific config (`config.ts`)
- **Constants**: API-related constants (`constants.ts`)
- **Endpoints**: API endpoint definitions (`endpoints.ts`)
- **Responses**: Standardized API responses (`responses.ts`)

## Usage Examples

### Basic API Requests

Making a simple GET request:

```typescript
import { createApiClient } from '@/lib/api';

// Create client instance
const apiClient = createApiClient({
  baseUrl: '/api',
  useSession: true, // Auto-fetch session
});

// Make a request
const response = await apiClient.get('/users/123');

// Handle the response
if (response.success) {
  console.log('User data:', response.data);
} else {
  console.error('Error:', response.error);
}
```

POST request with data:

```typescript
const response = await apiClient.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
});
```

Request with options:

```typescript
const response = await apiClient.get('/dashboard', undefined, {
  timeout: 5000, // 5 second timeout
  retry: true,   // Enable retries
  retryCount: 3  // Number of retries
});
```

### API Routes

Creating an API route using the base route class:

```typescript
import { BaseApiRoute } from '@/lib/api/routes';
import { z } from 'zod';
import { NextRequest } from 'next/server';
import { responses } from '@/lib/api/responses';

// Define request schema
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

class CreateUserRoute extends BaseApiRoute<z.infer<typeof createUserSchema>> {
  constructor() {
    super(createUserSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      const { email, name } = await this.validateRequest(request);
      
      // Process the request...
      const user = await createUser(email, name);
      
      return responses.success({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Create route instance
const route = new CreateUserRoute();

// Export handler methods
export const POST = route.bindToMethod('POST');
```

Using specialized route classes:

```typescript
import { BaseWaitlistRoute } from '@/lib/api/routes';
import { z } from 'zod';
import { NextRequest } from 'next/server';
import { responses } from '@/lib/api/responses';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

// Define schema
const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

class SubscribeRoute extends BaseWaitlistRoute<z.infer<typeof subscribeSchema>> {
  constructor() {
    super(subscribeSchema);
  }

  async handle(request: NextRequest): Promise<Response> {
    try {
      const { email, name } = await this.validateRequest(request);
      
      // Check if already subscribed
      const existing = await this.findSubscriber(email);
      
      if (existing) {
        // Update existing subscriber
        const updated = await this.updateSubscriberStatus(email, 'SUBSCRIBED');
        
        // Log the activity
        await this.logWaitlistActivity({
          action: AuditAction.WAITLIST_RESUBSCRIBED,
          status: AuditStatus.SUCCESS,
          email,
          request
        });
        
        return responses.success({
          status: 'SUBSCRIBED',
          subscriber: this.formatSubscriber(updated)
        });
      }
      
      // Create new subscriber
      const subscriber = await this.createSubscriber(email, name);
      
      // Send confirmation email
      await this.sendEmail('confirmation', email);
      
      // Log the activity
      await this.logWaitlistActivity({
        action: AuditAction.WAITLIST_SUBSCRIBED,
        status: AuditStatus.SUCCESS,
        email,
        request
      });
      
      return responses.created({
        status: 'SUBSCRIBED',
        subscriber: this.formatSubscriber(subscriber)
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Create route instance
const route = new SubscribeRoute();

// Export handler methods
export const POST = route.bindToMethod('POST');
```

### Services

Using service classes for domain-specific API operations:

```typescript
import { createApiService, UserService, WaitlistService } from '@/lib/api';
import { getApiConfig } from '@/lib/api/config';

// Create service instances
const userService = createApiService(UserService, getApiConfig());
const waitlistService = createApiService(WaitlistService, getApiConfig());

// Use the user service
const userResponse = await userService.getUser('123');
if (userResponse.success) {
  const user = userResponse.data;
  console.log(`Hello, ${user.name}!`);
}

// Use the waitlist service
const subscribeResponse = await waitlistService.subscribe({
  email: 'user@example.com',
  name: 'New User'
});
```

### Validation

Validating data with schemas:

```typescript
import { validate, schemas, requestSchemas } from '@/lib/api/validation';
import { NextRequest } from 'next/server';

// Validate with predefined schema
const result = validate(requestSchemas.subscribe, {
  email: 'user@example.com',
  name: 'John Doe'
});

if (result.success) {
  const validData = result.data;
  // Process validated data
} else {
  console.error('Validation failed:', result.error);
}

// Validate request body
async function validateRequestBody(req: NextRequest) {
  const result = await validateBody(req, requestSchemas.login);
  return result;
}
```

### Middleware

Using API middleware:

```typescript
import { 
  validateRequest, 
  requireAuth, 
  rateLimit,
  cors,
  errorHandler
} from '@/lib/api/middleware';
import { z } from 'zod';
import { createApiRoute } from '@/lib/api/routes';

// Schema for validation
const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

// Create a route with middleware
const route = createApiRoute('/api/users', 'POST', async (req, res) => {
  // Handler implementation
  return { success: true, data: { message: 'User created' } };
});

// Apply middleware
route.addMiddleware(cors());
route.addMiddleware(validateRequest(userSchema));
route.addMiddleware(requireAuth());
route.addMiddleware(rateLimit({ limit: 10 }));
route.addMiddleware(errorHandler());
```

## Type System

The API library uses TypeScript for complete type safety. Key types include:

- `ApiResponse<T>`: Standard response format with success/error indicators
- `ApiError`: Standardized error format
- `ApiRequest`: HTTP request format
- `ApiClient`: Interface for making API requests
- `ApiRoute`: Definition of an API route
- `ApiMiddleware`: Request/response interceptors
- `ValidationResult<T>`: Result of schema validation
- `WaitlistStatus`: Enum of possible waitlist statuses

Example of typed responses:

```typescript
import { ApiResponse, User } from '@/lib/api/types';

// Typed response
const response: ApiResponse<User> = await apiClient.get('/users/123');

if (response.success) {
  const user = response.data; // Type: User
  console.log(user.name);
} else {
  const error = response.error; // Type: ApiError
  console.error(error.message);
}
```

## Error Handling

The API client handles errors gracefully:

```typescript
try {
  const response = await apiClient.get('/resource/123');
  
  if (!response.success) {
    // Handle API error
    console.error(`API Error: ${response.error.code} - ${response.error.message}`);
    
    if (response.error.statusCode === 401) {
      // Handle auth error
    }
  }
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected error:', error);
}
```

Using the error formatting utility:

```typescript
import { formatApiError } from '@/lib/api';

// Format error for display
const errorMessage = formatApiError(response.error);
showErrorToast(errorMessage);
```

## Configuration

Create custom configurations:

```typescript
import { 
  createApiConfig, 
  createServerApiConfig, 
  createClientApiConfig 
} from '@/lib/api/config';

// Client-side config
const clientConfig = createClientApiConfig({
  timeout: 10000,
  retries: 2,
  headers: {
    'X-Custom-Header': 'value',
  },
});

// Server-side config
const serverConfig = createServerApiConfig({
  timeout: 30000,
  useSession: false,
});

// Environment-specific config
const config = getApiConfig(); // Returns development, production, or test config
```

## Best Practices

1. **Use Typed Requests/Responses**: Always define types for API data structures
2. **Validate Input**: Use Zod schemas to validate incoming data
3. **Handle Errors Gracefully**: Provide meaningful error messages and fallbacks
4. **Use Timeouts**: Set appropriate timeouts to prevent hanging requests
5. **Use Retries Wisely**: Configure retries for transient failures only
6. **Audit Sensitive Operations**: Log security-relevant operations with AuditLogger
7. **Organize by Domain**: Group API routes and services by domain/feature
8. **Test API Routes**: Write tests that cover route handlers
9. **Document API Endpoints**: Document expected inputs, outputs, and errors
10. **Secure Routes**: Apply authentication middleware where needed
11. **Use Route Base Classes**: Extend from the appropriate base route class for domain-specific functionality
12. **Standardize Responses**: Use the responses utility for consistent API responses
13. **Include Pagination**: Implement proper pagination for list endpoints
14. **Validate Route Parameters**: Use Zod to validate URL and query parameters
15. **Enable CORS Appropriately**: Configure CORS middleware for cross-domain requests
