---
title: Repository Issues
description: Retrieve and filter issues and pull requests for a repository
category: API Reference
order: 7
---

# Repository Issues API

Lists issues and pull requests for a GitHub repository with flexible filtering options.

## Endpoint

```
GET /api/repo/issues
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `owner` | Yes | Repository owner (username or organization) |
| `repo` | Yes | Repository name |
| `state` | No | Issue state: 'open', 'closed', or 'all' (default: 'all') |
| `labels` | No | Comma-separated list of label names |
| `sort` | No | Sort by: 'created', 'updated', 'comments' (default: 'created') |
| `direction` | No | Sort direction: 'asc' or 'desc' (default: 'desc') |
| `per_page` | No | Number of results per page (default: 30, max: 100) |
| `page` | No | Page number (default: 1) |
| `type` | No | Filter by: 'issue', 'pr', or 'all' (default: 'all') |

## Example Requests

### Get Open Issues

```javascript
const fetchOpenIssues = async () => {
  const params = new URLSearchParams({
    owner: 'octocat',
    repo: 'hello-world',
    state: 'open',
    type: 'issue'
  });
  
  const response = await fetch(`/api/repo/issues?${params}`);
  return await response.json();
};
```

### Get Pull Requests with Specific Labels

```javascript
const fetchLabeledPRs = async () => {
  const params = new URLSearchParams({
    owner: 'octocat',
    repo: 'hello-world',
    type: 'pr',
    labels: 'bug,high-priority'
  });
  
  const response = await fetch(`/api/repo/issues?${params}`);
  return await response.json();
};
```

## Response

```json
[
  {
    "id": 123456789,
    "number": 42,
    "title": "Fix authentication bug",
    "state": "open",
    "locked": false,
    "assignee": {
      "login": "jane-doe",
      "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4"
    },
    "assignees": [
      {
        "login": "jane-doe",
        "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4"
      }
    ],
    "labels": [
      {
        "name": "bug",
        "color": "d73a4a",
        "description": "Something isn't working"
      },
      {
        "name": "high-priority",
        "color": "b60205",
        "description": "Needs immediate attention"
      }
    ],
    "author": {
      "login": "john-smith",
      "avatar_url": "https://avatars.githubusercontent.com/u/67890?v=4"
    },
    "created_at": "2023-06-10T12:00:00Z",
    "updated_at": "2023-06-15T09:00:00Z",
    "closed_at": null,
    "body": "The authentication system fails when using OAuth with...",
    "comments": 3,
    "url": "https://github.com/octocat/hello-world/issues/42"
  }
]
```

## Pull Request Specific Fields

When retrieving pull requests, additional fields are included:

```json
{
  "pull_request": {
    "url": "https://github.com/octocat/hello-world/pull/42",
    "merged_at": "2023-06-20T15:45:00Z"
  }
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

- By default, this API returns both issues and pull requests
- Use the `type` parameter to filter for only issues (`type=issue`) or only pull requests (`type=pr`)
- The `labels` parameter accepts a comma-separated list of label names
- To search issues by content, use the Search API instead of this endpoint
