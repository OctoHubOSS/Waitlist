---
title: API Rate Limits
description: Check your current GitHub API rate limit status
category: API Reference
order: 13
---

# Rate Limit API

Provides information about your current GitHub API rate limit status when using OctoSearch.

## Endpoint

```
GET /api/rate/limit
```

## Parameters

No parameters required.

## Example Request

```javascript
const checkRateLimits = async () => {
  const response = await fetch('/api/rate/limit');
  return await response.json();
};
```

## Response

```json
{
  "core": {
    "limit": 5000,
    "remaining": 4982,
    "reset": "2023-07-01T12:30:45Z",
    "used": 18,
    "percentRemaining": 99
  },
  "search": {
    "limit": 30,
    "remaining": 28,
    "reset": "2023-07-01T12:10:00Z",
    "used": 2,
    "percentRemaining": 93
  },
  "graphql": {
    "limit": 5000,
    "remaining": 5000,
    "reset": "2023-07-01T12:30:45Z",
    "used": 0,
    "percentRemaining": 100
  },
  "authenticated": true
}
```

## Error Response

```json
{
  "error": "Failed to fetch rate limits"
}
```

## Rate Limit Categories

- **Core**: Basic GitHub API operations (most endpoints)
- **Search**: GitHub Search API operations
- **GraphQL**: GitHub GraphQL API operations

## Notes

- Each category has its own independent rate limit
- The `reset` field indicates when the rate limit will be fully restored
- `percentRemaining` provides a quick way to monitor rate limit consumption
- `authenticated` indicates whether the request was made with authentication
- Authenticated requests have higher rate limits than unauthenticated ones
- Rate limits are based on GitHub's policies and may change over time
