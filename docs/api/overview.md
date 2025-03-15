---
title: API Overview
description: Introduction to the OctoSearch API and common usage patterns
category: API Reference
order: 1
---

# OctoSearch API Overview

OctoSearch provides a comprehensive API for accessing GitHub data in a structured format. This documentation covers all available endpoints, their parameters, and response formats.

## Base URL

All API endpoints are relative to your OctoSearch installation. For local development, this is typically:

```
http://localhost:3000/api
```

## Authentication

The OctoSearch API uses GitHub's authentication system. Personal access tokens can be provided via:

1. Environment variables (recommended for server deployments)
2. Session authentication (used by the OctoSearch web interface)

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

API requests are subject to GitHub's rate limiting. Use the `/api/rate/limit` endpoint to check your current rate limit status.

## API Categories

The OctoSearch API is organized into the following categories:

1. **Repository APIs** - Access repository data, contents, and activity
2. **User APIs** - Retrieve user profile data and repositories
3. **Search APIs** - Search for users, repositories, and code
4. **Trending APIs** - Get current trending repositories and developers
5. **Other APIs** - Additional endpoints for gists, rate limits, etc.

## Next Steps

Explore the specific API endpoints in the subsequent documentation pages to learn about their parameters and response formats.
