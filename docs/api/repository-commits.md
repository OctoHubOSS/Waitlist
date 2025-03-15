---
title: Repository Commits
description: List and filter commits for a GitHub repository
category: API Reference
order: 6
---

# Repository Commits API

Lists commits for a GitHub repository with optional filtering by path, author, or timeframe.

## Endpoint

```
GET /api/repo/commits
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `owner` | Yes | Repository owner (username or organization) |
| `repo` | Yes | Repository name |
| `path` | No | Filter commits by file path |
| `sha` | No | Branch, tag, or commit SHA |
| `author` | No | Filter by author (username, name, or email) |
| `since` | No | ISO 8601 timestamp for start date |
| `until` | No | ISO 8601 timestamp for end date |
| `per_page` | No | Number of results per page (default: 30, max: 100) |
| `page` | No | Page number (default: 1) |

## Example Requests

### Get Recent Commits

```javascript
const fetchRecentCommits = async () => {
  const params = new URLSearchParams({
    owner: 'octocat',
    repo: 'hello-world',
    per_page: '10'
  });
  
  const response = await fetch(`/api/repo/commits?${params}`);
  return await response.json();
};
```

### Filter Commits by Path and Author

```javascript
const fetchFilteredCommits = async () => {
  const params = new URLSearchParams({
    owner: 'octocat',
    repo: 'hello-world',
    path: 'src/components',
    author: 'jane-doe',
    since: '2023-01-01T00:00:00Z'
  });
  
  const response = await fetch(`/api/repo/commits?${params}`);
  return await response.json();
};
```

## Response

```json
[
  {
    "sha": "abcdef123456",
    "commit": {
      "message": "Fix authentication bug",
      "author": {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "date": "2023-06-15T10:30:00Z"
      },
      "committer": {
        "name": "GitHub",
        "email": "noreply@github.com",
        "date": "2023-06-15T10:30:00Z"
      }
    },
    "author": {
      "login": "jane-doe",
      "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
      "url": "https://github.com/jane-doe"
    },
    "committer": {
      "login": "web-flow",
      "avatar_url": "https://avatars.githubusercontent.com/u/19864447?v=4",
      "url": "https://github.com/web-flow"
    },
    "html_url": "https://github.com/octocat/hello-world/commit/abcdef123456",
    "stats": {
      "additions": 15,
      "deletions": 5,
      "total": 20
    }
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

- Use the `path` parameter to filter commits that affect a specific file or directory
- The `since` and `until` parameters accept ISO 8601 formatted dates (YYYY-MM-DDTHH:MM:SSZ)
- Use the `author` parameter to filter by GitHub username, full name, or email address
- To get commits from a specific branch, set the `sha` parameter to the branch name
