# OctoHub Waitlist Utilities

This directory contains utility functions that provide common functionality across the application.

## Table of Contents

- [URL Builder](#url-builder)
- [Absolute URL Helper](#absolute-url-helper)
- [Usage Examples](#usage-examples)

## URL Builder

The `urlBuilder` utility provides an environment-aware URL generation system that makes it easy to create consistent URLs throughout the application.

### Key Features

- **Environment Awareness**: Automatically handles different URLs for development, production, and test environments
- **API URL Generation**: Easily create URLs for API endpoints
- **Asset URL Support**: Generate URLs for static assets with optional CDN support
- **Query Parameter Support**: Add query parameters to URLs with type safety
- **Chainable API**: Fluent interface for advanced configurations

### Available Functions

- `appUrl(path, params)`: Creates an application URL with the base URL for the current environment
- `apiUrl(endpoint, params)`: Creates an API URL with the API path for the current environment
- `assetUrl(path, params)`: Creates an asset URL, using CDN if configured

### Configuration

The URL builder is configured with environment-specific settings:

```typescript
const config = {
  development: {
    baseUrl: 'localhost:3000',
    apiPath: '/api',
    secure: false // Uses http://
  },
  production: {
    baseUrl: 'octohub.dev',
    apiPath: '/api',
    secure: true // Uses https://
  }
};
```

The configuration automatically uses environment variables when available:
- `NEXT_PUBLIC_DEV_URL`: Base URL for development environment
- `NEXT_PUBLIC_APP_URL`: Base URL for production environment

## Absolute URL Helper

The `absoluteUrl()` function returns the base URL of the application based on the current environment:

- In development: `http://localhost:3000`
- In production: `https://octohub.dev`

## Usage Examples

### Basic URL Generation

```typescript
import { appUrl, apiUrl, assetUrl } from '@/utils/urlBuilder';

// Application URLs
const homeUrl = appUrl(); // https://octohub.dev/
const loginPage = appUrl('/auth/login'); // https://octohub.dev/auth/login
const userProfile = appUrl('/users/profile', { tab: 'settings' }); 
// https://octohub.dev/users/profile?tab=settings

// API URLs
const usersApi = apiUrl('/users'); // https://octohub.dev/api/users
const userStatus = apiUrl('/users/status', { id: '123' }); 
// https://octohub.dev/api/users/status?id=123

// Asset URLs
const logoImg = assetUrl('/images/logo.png'); // https://octohub.dev/assets/images/logo.png
// With CDN configured: https://cdn.octohub.dev/images/logo.png
```

### Advanced Configuration

```typescript
import { urlBuilder } from '@/utils/urlBuilder';

// Temporarily change environment
const stagingUrl = urlBuilder
  .setEnvironment('staging')
  .url('/feature/new');

// Use custom environment settings
const customUrl = urlBuilder
  .setCustomEnvironment({
    baseUrl: 'beta.octohub.dev',
    apiPath: '/beta/api',
    secure: true
  })
  .apiUrl('/check');

// Reset to default environment
urlBuilder.setCustomEnvironment(null);
```

### Inside API Routes

```typescript
import { apiUrl } from '@/utils/urlBuilder';

export async function GET(request: NextRequest) {
  // Generate URLs for HATEOAS links in API responses
  return NextResponse.json({
    user: {
      id: '123',
      name: 'John Doe',
      links: {
        self: apiUrl('/users/123'),
        settings: apiUrl('/users/123/settings'),
        avatar: apiUrl('/users/123/avatar')
      }
    }
  });
}
```

### With Next.js Router

```typescript
import { appUrl } from '@/utils/urlBuilder';
import { useRouter } from 'next/navigation';

function MyComponent() {
  const router = useRouter();
  
  const handleLogin = () => {
    router.push(appUrl('/auth/login', { 
      redirect: 'dashboard',
      source: 'header'
    }));
  };
  
  return <button onClick={handleLogin}>Login</button>;
}
```
