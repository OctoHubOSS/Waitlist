# OctoHub Waitlist Libraries

This directory contains the core libraries that power the OctoHub Waitlist application. These libraries provide a modular architecture for handling various aspects of the application, from API interactions to client information detection and audit logging.

## Table of Contents

- [Overview](#overview)
- [Library Structure](#library-structure)
- [API Library](#api-library)
- [Client Information Library](#client-information-library)
- [Audit Logging System](#audit-logging-system)
- [Database Access Layer](#database-access-layer)
- [Authentication Utilities](#authentication-utilities)
- [Email System](#email-system)
- [API Routes System](#api-routes-system)
- [Utilities](#utilities)
- [Best Practices](#best-practices)

## Overview

The libraries in this directory follow a modular, service-oriented architecture designed to provide:

- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Separation of Concerns**: Each library has a specific responsibility
- **Reusability**: Common patterns and utilities are abstracted for reuse
- **Testability**: Clean interfaces and dependency injection for easier testing
- **Performance**: Optimized implementations with caching and efficient resource usage
- **Security**: Built-in security practices like audit logging and safe input handling

## Library Structure

```
src/lib/
├── api/               # API client and route handling
│   ├── client.ts      # API request client
│   ├── config.ts      # API configuration
│   ├── constants.ts   # API-related constants
│   ├── endpoints.ts   # API endpoint definitions
│   ├── ip.ts          # IP utilities
│   ├── middleware.ts  # API middleware functions
│   ├── responses.ts   # Response formatting
│   ├── routes.ts      # Base route definitions
│   ├── services.ts    # Service-oriented API wrappers
│   ├── types.ts       # API type definitions
│   ├── utils.ts       # API utilities
│   └── routes/        # Route implementations
│       ├── auth/      # Authentication routes
│       ├── waitlist/  # Waitlist routes
│       ├── bug-reports/ # Bug report routes
│       ├── dashboard/ # Dashboard routes
│       └── base.ts    # Base route class
├── audit/             # Audit logging system
│   └── logger.ts      # Audit logger implementation
├── auth/              # Authentication utilities
│   ├── config.ts      # Auth configuration
│   ├── providers.ts   # Authentication providers
│   └── session.ts     # Session management
├── client/            # Client information detection
│   ├── info.ts        # Client info service
│   ├── ip.ts          # IP detection utilities
│   ├── types.ts       # Client info type definitions
│   └── index.ts       # Client library exports
├── database.ts        # Database connection and utilities
├── email/             # Email system
│   ├── client.ts      # Email client
│   ├── templates/     # Email templates
│   └── verification/  # Email verification
└── utils/             # General utilities
    ├── user-agent.ts  # User agent parsing
    └── ...
```

## API Library

The API library (`/api`) provides a robust foundation for making API requests and handling API routes.

### Key Features

- **Type-safe API Client**: Strong typing for requests and responses
- **Automatic Retry and Timeout**: Built-in retry logic and request timeouts
- **Error Handling**: Standardized error responses and handling
- **Route Management**: Base classes for creating API routes
- **Middleware Support**: Pluggable middleware for cross-cutting concerns
- **Schema Validation**: Request validation using Zod schemas

### Usage Example

```typescript
// Making API requests
import { createApiClient } from '@/lib/api/client';

const apiClient = createApiClient({
  baseUrl: '/api',
  useSession: true
});

const response = await apiClient.get('/users/123');
if (response.success) {
  console.log(response.data);
}

// Creating API routes
import { BaseApiRoute } from '@/lib/api/routes/base';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

class EmailRoute extends BaseApiRoute<z.infer<typeof schema>> {
  constructor() {
    super(schema);
  }

  async handle(request: NextRequest): Promise<Response> {
    const { email } = await this.validateRequest(request);
    // Process the request...
    return successResponse({ status: 'success' });
  }
}
```

## Client Information Library

The client information library (`/client`) provides advanced detection of client devices, browsers, and locations.

### Key Features

- **IP Detection**: Advanced IP detection with proxy support
- **User Agent Parsing**: Extract browser, OS, and device information
- **Geolocation**: Optional IP-based geolocation
- **Bot Detection**: Identify bot/crawler requests
- **Client Hints Support**: Modern browser identification using client hints

### Usage Example

```typescript
import { clientInfo } from '@/lib/client';

// In an API route handler
export async function GET(request: NextRequest) {
  const info = await clientInfo.getClientInfo(request);
  
  console.log(`Request from ${info.ip} using ${info.browser} on ${info.device}`);
  
  if (info.isBot) {
    console.log('Bot detected!');
  }
  
  return NextResponse.json({ message: 'Hello' });
}
```

## Audit Logging System

The audit logging system (`/audit`) provides comprehensive security and activity logging.

### Key Features

- **Structured Logging**: Consistent log format with typed actions
- **Security Focus**: Designed for security audit requirements
- **Client Context**: Automatically captures client information
- **Database Storage**: Persists logs for historical analysis
- **Non-blocking**: Minimal performance impact on main request flow

### Usage Example

```typescript
import { AuditLogger, AuditAction, AuditStatus } from '@/lib/audit/logger';

// Log a user action
await AuditLogger.logAuth(
  AuditAction.LOGIN, 
  AuditStatus.SUCCESS,
  user.id,
  undefined,
  { method: 'password' },
  request
);

// Log a system event
await AuditLogger.logSystem(
  AuditAction.SYSTEM_WARNING,
  AuditStatus.SUCCESS,
  { message: 'Database connection pool reaching limits' }
);
```

## Database Access Layer

The database layer provides a type-safe interface to the database using Prisma.

### Key Features

- **Global Instance**: Singleton Prisma client with hot-reload support
- **Type Safety**: Full TypeScript type checking for database operations
- **Connection Management**: Proper connection pool handling

### Usage Example

```typescript
import prisma from '@/lib/database';

// Query data
const user = await prisma.user.findUnique({
  where: { email },
  include: { profile: true }
});

// Create data
const newSubscriber = await prisma.waitlistSubscriber.create({
  data: {
    email,
    name,
    status: 'SUBSCRIBED'
  }
});
```

## Authentication Utilities

Authentication utilities (`/auth`) handle user authentication and session management.

### Key Features

- **NextAuth Integration**: Configured for use with NextAuth.js
- **Multiple Providers**: Support for email, OAuth, and other providers
- **Session Management**: Secure session handling
- **Email Verification**: Support for email verification flows

### Usage Example

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return NextResponse.json({ user: session.user });
}
```

## Email System

The email system (`/email`) handles sending emails with templates.

### Key Features

- **Template System**: Reusable email templates
- **Multiple Providers**: Support for different email sending services
- **Verification**: Email verification code generation and validation
- **Queue Support**: Optional queue-based sending for reliability

### Usage Example

```typescript
import { emailClient } from '@/lib/email/client';

// Send a templated email
const result = await emailClient.sendEmail({
  to: user.email,
  from: {
    name: "OctoHub",
    address: "noreply@octohub.dev"
  },
  ...emailClient.emailTemplates.waitlistConfirmation(user.email)
});
```

## API Routes System

The API routes system provides a robust foundation for building API endpoints with various features:

### Base Route Classes

- **BaseApiRoute**: Core functionality for all API routes (validation, error handling, etc.)
- **BaseAuthRoute**: Authentication-specific routes with user verification
- **BaseWaitlistRoute**: Specialized handling for waitlist operations
- **BaseBugReportRoute**: Functionality for bug reporting and tracking
- **BaseDashboardRoute**: Dashboard data operations and user activity

### Usage Example

```typescript
import { BaseBugReportRoute } from '@/lib/api/routes/bug-reports/base';

class MyBugReportRoute extends BaseBugReportRoute {
  constructor() {
    super(myValidationSchema);
  }
  
  async handle(request: NextRequest): Promise<Response> {
    // Your implementation here
    const bugReport = await this.findBugReportWithDetails(id, userId);
    return successResponse(this.formatBugReportResponse(bugReport, true));
  }
}
```

## Utilities

General utilities (`/utils`) provide common helper functions.

### Key Features

- **User Agent Parsing**: Parse browser and device information
- **Date Formatting**: Consistent date handling
- **String Manipulation**: Common string operations
- **Security Helpers**: Functions for secure operations

### Usage Example

```typescript
import { parseUserAgent } from '@/lib/utils/user-agent';

const userAgent = request.headers.get('user-agent') || '';
const { browser, os, device } = parseUserAgent(userAgent);

console.log(`User is on ${device} running ${os} with ${browser}`);
```

## Best Practices

When working with these libraries, follow these best practices:

1. **Type Everything**: Use TypeScript types for all function parameters and return values
2. **Error Handling**: Always handle potential errors from library functions
3. **Async/Await**: Use async/await for all asynchronous operations
4. **Avoid Direct Prisma Import**: Use the shared Prisma instance from `database.ts`
5. **Log Security Events**: Use the audit logger for security-relevant operations
6. **Validate Input**: Use Zod schemas to validate all user input
7. **Test Edge Cases**: Ensure your code handles edge cases like timeouts and failures
8. **Documentation**: Add JSDoc comments to explain non-obvious functionality
9. **Avoid Circular Dependencies**: Structure imports to avoid circular dependencies
10. **Follow Patterns**: Maintain consistency with existing patterns in the codebase
