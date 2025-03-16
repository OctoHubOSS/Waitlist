---
title: Code Search
description: Search for code across GitHub repositories
category: API Reference
order: 14
---

# Code Search API

Search for code within GitHub repositories using keywords and filters.

## Endpoint

```
GET /api/search/code
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `q` | Yes | Search query string |
| `language` | No | Filter by programming language |
| `repo` | No | Filter by specific repository (format: owner/repo) |
| `per_page` | No | Number of results per page (default: 30, max: 100) |
| `page` | No | Page number (default: 1) |

## Example Requests

### Basic Code Search

```javascript
const searchCode = async (query) => {
  const params = new URLSearchParams({
    q: query
  });
  
  const response = await fetch(`/api/search/code?${params}`);
  return await response.json();
};
```

### Filtered Code Search

```javascript
const searchFilteredCode = async () => {
  const params = new URLSearchParams({
    q: 'authentication',
    language: 'typescript',
    repo: 'octocat/hello-world',
    per_page: '15'
  });
  
  const response = await fetch(`/api/search/code?${params}`);
  return await response.json();
};
```

## Response

```json
{
  "total_count": 327,
  "incomplete_results": false,
  "items": [
    {
      "name": "auth.ts",
      "path": "src/lib/auth.ts",
      "sha": "abcdef123456",
      "url": "https://github.com/octocat/hello-world/blob/main/src/lib/auth.ts",
      "repository": {
        "name": "hello-world",
        "full_name": "octocat/hello-world",
        "owner": {
          "login": "octocat",
          "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4"
        }
      },
      "score": 12.34
    }
  ]
}
```

## Error Responses

### Missing Query Parameter

```json
{
  "error": "Missing required parameter: 'q'"
}
```

### Rate Limit Exceeded

```json
{
  "error": "API rate limit exceeded"
}
```

## Search Syntax

You can use GitHub's code search syntax for advanced queries:

- `"exact match"`: Search for an exact string
- `filename:.js`: Search files with a specific extension
- `path:src/components`: Search in a specific directory path
- `NOT`: Exclude terms (e.g., `authentication NOT oauth`)
- `user:username`: Search in repositories owned by a specific user
- `org:organization`: Search in repositories owned by a specific organization

## Notes

- Code search has stricter rate limits than other API endpoints
- Results are sorted by score (relevance) by default
- For large repositories, not all files may be indexed
- Code search can be computationally intensive; use specific queries for better results
- The API returns file metadata but not file content; use the Repository Contents API to fetch content
