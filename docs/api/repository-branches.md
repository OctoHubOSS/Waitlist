---
title: Repository Branches
description: List branches for a GitHub repository
category: API Reference
order: 5
---

# Repository Branches API

Lists all branches in a GitHub repository.

## Endpoint

```
GET /api/repo/branches
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `owner` | Yes | Repository owner (username or organization) |
| `repo` | Yes | Repository name |

## Example Request

```javascript
const fetchBranches = async () => {
  const params = new URLSearchParams({
    owner: 'octocat',
    repo: 'hello-world'
  });
  
  const response = await fetch(`/api/repo/branches?${params}`);
  return await response.json();
};
```

## Response

```json
[
  {
    "name": "main",
    "commit": {
      "sha": "abcdef123456",
      "url": "https://api.github.com/repos/octocat/hello-world/commits/abcdef123456"
    },
    "protected": false
  },
  {
    "name": "develop",
    "commit": {
      "sha": "ghijkl789012",
      "url": "https://api.github.com/repos/octocat/hello-world/commits/ghijkl789012"
    },
    "protected": true
  },
  {
    "name": "feature/user-auth",
    "commit": {
      "sha": "mnopqr345678",
      "url": "https://api.github.com/repos/octocat/hello-world/commits/mnopqr345678"
    },
    "protected": false
  }
]
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

- The API returns up to 100 branches per request
- For repositories with more than 100 branches, use pagination parameters
- Each branch includes its latest commit SHA and protection status
- The default branch typically appears first in the list
