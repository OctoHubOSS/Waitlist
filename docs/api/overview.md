---
title: API Overview
description: Introduction to the OctoHub API and common usage patterns
category: API Reference
order: 1
---

# OctoHub API Overview

OctoHub provides a comprehensive API for managing repositories, users, organizations, and related data. This documentation covers all available endpoints, their parameters, and response formats.

## Base URL

All API endpoints are relative to your OctoHub installation. For local development, this is typically:

```
http://localhost:3000/api
```

## Authentication

The OctoHub API supports several authentication methods:

1. API tokens (recommended for programmatic access)
2. Session authentication (used by the OctoHub web interface)

When making authenticated requests, higher rate limits are available.

## Common Response Formats

All API responses follow a consistent JSON structure:

- Successful responses return the requested data directly
- Error responses include an `error` field with a descriptive message

Example error response:

```json
{
  "error": "Repository not found"
}
```

## Error Codes

Common HTTP status codes:

- `200`: Success
- `400`: Bad request (missing or invalid parameters)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Resource not found
- `429`: Rate limit exceeded
- `500`: Server error

## Rate Limiting

API requests are subject to rate limiting. Use the `/api/rate/limit` endpoint to check your current rate limit status.

## API Categories

The OctoHub API is organized into the following categories:

### Repository APIs

- **Repository Details** - Basic repository information `/api/repo`
- **Repository Contents** - File and directory listings `/api/repo/contents`
- **Repository Languages** - Language distribution statistics `/api/repo/languages`
- **Repository Branches** - List branches in a repository `/api/repo/branches`
- **Repository Commits** - List and filter repository commits `/api/repo/commits`
- **Repository Issues** - Retrieve issues and pull requests `/api/repo/issues`
- **Repository Changelog** - Generate changelogs from releases `/api/repo/changelog`

### User APIs

- **User Repositories** - List repositories for a user `/api/user/repos`
- **User Starred** - List repositories starred by a user `/api/user/starred`

### Search APIs

- **Code Search** - Find code matching specific criteria `/api/search/code`
- **User Search** - Find users and organizations `/api/search/users`

### Trending APIs

- **Trending Repositories** - Get currently popular repositories `/api/trending/repos`
- **Trending Developers** - Get currently popular developers `/api/trending/devs`

### Authentication APIs

- **Register** - Create a new user account `/api/auth/register`
- **Login** - Authenticate user `/api/auth/[...nextauth]`
- **Password Management** - Reset, change, add passwords `/api/auth/*-password`
- **GitHub Integration** - Link and unlink GitHub accounts `/api/auth/link-github`

### Other APIs

- **Rate Limit** - Check API usage limits `/api/rate/limit`
- **Email** - Send notifications (admin only) `/api/email/send`
- **Documentation** - Access API documentation `/api/docs/categories`

## Next Steps

Explore the specific API endpoints in the subsequent documentation pages to learn about their parameters and response formats.
