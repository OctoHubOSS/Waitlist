---
title: Repository API
description: Retrieve detailed information about GitHub repositories
category: API Reference
order: 2
---

# Repository API

Retrieves detailed information about a specific GitHub repository, with optional content listing.

## Endpoint

```
GET /api/repo
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `owner` | Yes | Repository owner (username or organization) |
| `repo` | Yes | Repository name |
| `contents` | No | Set to 'true' to include repository contents |
| `path` | No | Directory path for contents listing (default: root) |
| `ref` | No | Branch, tag, or commit SHA |

## Example Request

```javascript
// Get repository details with contents
const fetchRepo = async () => {
  const params = new URLSearchParams({
    owner: 'octocat',
    repo: 'hello-world',
    contents: 'true',
    path: 'src'
  });
  
  const response = await fetch(`/api/repo?${params}`);
  return await response.json();
};
```

## Response

```json
{
  "repository": {
    "id": 123456789,
    "name": "hello-world",
    "full_name": "octocat/hello-world",
    "description": "A sample repository",
    "stargazers_count": 1000,
    "forks_count": 100,
    "language": "TypeScript",
    "topics": ["example", "demo"],
    "default_branch": "main",
    "owner": {
      "login": "octocat",
      "id": 12345,
      "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
      "html_url": "https://github.com/octocat"
    },
    "html_url": "https://github.com/octocat/hello-world"
    // Additional repository information...
  },
  "contents": [
    {
      "name": "components",
      "path": "src/components",
      "type": "dir",
      "sha": "abc123def456"
    },
    {
      "name": "app.tsx",
      "path": "src/app.tsx",
      "type": "file",
      "sha": "789ghi101112",
      "size": 1024
    }
  ],
  "currentPath": "src"
}
```

## Error Responses

### Missing Required Parameters

```json
{
  "error": "Missing required parameters: 'owner' and 'repo'"
}
```

### Repository Not Found

```json
{
  "error": "Repository not found"
}
```

## Notes

- When `contents` is set to `true`, the API returns both repository metadata and the directory contents
- Set the `path` parameter to navigate through subdirectories
- Use the `ref` parameter to get contents from a specific branch, tag, or commit
