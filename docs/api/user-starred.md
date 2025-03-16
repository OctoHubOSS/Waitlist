---
title: User Starred Repositories
description: List repositories starred by a specific GitHub user
category: API Reference
order: 17
---

# User Starred Repositories API

Retrieves repositories that have been starred by a specific GitHub user.

## Endpoint

```
GET /api/user/starred
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `username` | Yes | GitHub username |
| `sort` | No | Sort by: 'created', 'updated' (default: 'created') |
| `direction` | No | Sort direction: 'asc' or 'desc' (default: 'desc') |
| `per_page` | No | Number of results per page (default: 30, max: 100) |
| `page` | No | Page number (default: 1) |

## Example Request

```javascript
const fetchUserStarred = async (username) => {
  const params = new URLSearchParams({
    username: username,
    sort: 'updated',
    direction: 'desc',
    per_page: '20'
  });
  
  const response = await fetch(`/api/user/starred?${params}`);
  return await response.json();
};
```

## Response

```json
[
  {
    "id": 123456789,
    "name": "awesome-project",
    "fullName": "developer/awesome-project",
    "description": "An amazing open source project",
    "private": false,
    "fork": false,
    "url": "https://github.com/developer/awesome-project",
    "homepage": "https://awesome-project.dev",
    "language": "TypeScript",
    "forksCount": 456,
    "stargazersCount": 5432,
    "watchersCount": 234,
    "size": 2048,
    "defaultBranch": "main",
    "openIssuesCount": 25,
    "topics": ["web", "framework", "typescript"],
    "hasIssues": true,
    "hasProjects": true,
    "hasWiki": true,
    "owner": {
      "login": "developer",
      "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
      "url": "https://github.com/developer"
    },
    "starred_at": "2023-05-15T10:30:00Z"
  }
]
```

## Error Responses

### Missing Username

```json
{
  "error": "Missing required parameter: 'username'"
}
```

### User Not Found

```json
{
  "error": "User not found"
}
```

## Notes

- The `starred_at` field indicates when the user starred the repository
- The list is paginated; use `page` and `per_page` parameters for navigation
- Private repositories will only be visible if the API is authenticated and has access
- Sorting by `created` orders by when the repositories were starred
- Sorting by `updated` orders by when the repositories were last updated
- Repositories that a user has starred can provide insight into their interests
