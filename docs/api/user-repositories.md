---
title: User Repositories
description: List repositories owned by a specific GitHub user
category: API Reference
order: 9
---

# User Repositories API

Lists repositories owned by or affiliated with a specific GitHub user.

## Endpoint

```
GET /api/user/repos
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `username` | Yes | GitHub username |
| `sort` | No | Sort by: 'created', 'updated', 'pushed', 'full_name' (default: 'updated') |
| `direction` | No | Sort direction: 'asc' or 'desc' (default: 'desc') |
| `type` | No | Filter by: 'all', 'owner', 'member' (default: 'all') |
| `per_page` | No | Number of results per page (default: 30, max: 100) |
| `page` | No | Page number (default: 1) |

## Example Requests

### Get User's Repositories

```javascript
const fetchUserRepos = async () => {
  const params = new URLSearchParams({
    username: 'octocat',
    sort: 'updated',
    direction: 'desc',
    per_page: '10'
  });
  
  const response = await fetch(`/api/user/repos?${params}`);
  return await response.json();
};
```

### Get Only Repositories Owned by User

```javascript
const fetchOwnedRepos = async () => {
  const params = new URLSearchParams({
    username: 'octocat',
    type: 'owner'
  });
  
  const response = await fetch(`/api/user/repos?${params}`);
  return await response.json();
};
```

## Response

```json
[
  {
    "id": 123456789,
    "name": "hello-world",
    "fullName": "octocat/hello-world",
    "private": false,
    "description": "A sample repository",
    "fork": false,
    "createdAt": "2023-01-15T10:00:00Z",
    "updatedAt": "2023-06-15T12:00:00Z",
    "pushedAt": "2023-06-15T12:00:00Z",
    "homepage": "https://example.com",
    "size": 1024,
    "stargazersCount": 100,
    "watchersCount": 15,
    "language": "TypeScript",
    "forksCount": 25,
    "openIssuesCount": 5,
    "defaultBranch": "main",
    "topics": ["sample", "demo", "tutorial"],
    "visibility": "public",
    "url": "https://github.com/octocat/hello-world"
  }
]
```

## Error Responses

### Missing Required Parameter

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

- The `type` parameter can filter repositories by the user's relationship:
  - `all`: All repositories the user has access to (default)
  - `owner`: Only repositories that the user owns
  - `member`: Only repositories where the user is a collaborator but not an owner
- Use the `fork` property in the response to identify repositories that are forks
- The `visibility` field indicates whether the repository is public or private
