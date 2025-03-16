---
title: GitHub Gists
description: Retrieve public and user-specific GitHub Gists
category: API Reference
order: 10
---

# GitHub Gists API

Retrieves GitHub Gists, which are code snippets shared on GitHub.

## Endpoint

```
GET /api/gists
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `username` | No | GitHub username to retrieve gists for a specific user |
| `since` | No | ISO 8601 timestamp to retrieve gists created/updated after a certain date |
| `per_page` | No | Number of results per page (default: 30, max: 100) |
| `page` | No | Page number (default: 1) |

## Example Requests

### Get Public Gists

```javascript
const fetchPublicGists = async () => {
  const response = await fetch('/api/gists');
  return await response.json();
};
```

### Get User-Specific Gists

```javascript
const fetchUserGists = async (username) => {
  const params = new URLSearchParams({
    username: username,
    per_page: '20'
  });
  
  const response = await fetch(`/api/gists?${params}`);
  return await response.json();
};
```

## Response

```json
[
  {
    "id": "a1b2c3d4e5f6g7h8i9j0",
    "description": "Example code for API authentication",
    "created_at": "2023-05-15T10:00:00Z",
    "updated_at": "2023-05-15T10:30:00Z",
    "url": "https://gist.github.com/username/a1b2c3d4e5f6g7h8i9j0",
    "owner": {
      "login": "username",
      "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
      "url": "https://github.com/username"
    },
    "public": true,
    "files": [
      {
        "filename": "auth.js",
        "type": "application/javascript",
        "language": "JavaScript",
        "raw_url": "https://gist.githubusercontent.com/username/a1b2c3d4e5f6g7h8i9j0/raw/auth.js",
        "size": 2048
      },
      {
        "filename": "README.md",
        "type": "text/markdown",
        "language": "Markdown",
        "raw_url": "https://gist.githubusercontent.com/username/a1b2c3d4e5f6g7h8i9j0/raw/README.md",
        "size": 512
      }
    ],
    "comments": 3
  }
]
```

## Error Response

```json
{
  "error": "Failed to fetch gists: Rate limit exceeded"
}
```

## Notes

- Public gists are returned when no username is provided
- For authenticated requests, the API provides higher rate limits
- Set the `since` parameter to filter for recently updated gists
- Files are listed with their metadata, but content must be retrieved separately using `raw_url`
- Gists can contain multiple files, each with potentially different programming languages
