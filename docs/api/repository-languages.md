---
title: Repository Languages
description: Get language distribution statistics for a repository
category: API Reference
order: 4
---

# Repository Languages API

Retrieves the programming languages used in a repository and their relative distribution.

## Endpoint

```
GET /api/repo/languages
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `owner` | Yes | Repository owner (username or organization) |
| `repo` | Yes | Repository name |

## Example Request

```javascript
const fetchLanguages = async () => {
  const params = new URLSearchParams({
    owner: 'octocat',
    repo: 'hello-world'
  });
  
  const response = await fetch(`/api/repo/languages?${params}`);
  return await response.json();
};
```

## Response

```json
{
  "languages": [
    {
      "name": "TypeScript",
      "bytes": 15000,
      "percentage": "75.0%",
      "color": "#3178c6"
    },
    {
      "name": "JavaScript",
      "bytes": 3000,
      "percentage": "15.0%",
      "color": "#f1e05a"
    },
    {
      "name": "CSS",
      "bytes": 2000,
      "percentage": "10.0%",
      "color": "#563d7c"
    }
  ],
  "totalBytes": 20000
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

- The API returns languages sorted by the number of bytes in descending order
- Each language includes a color code that matches GitHub's language colors
- The percentage is calculated based on the total bytes of code in the repository
- Only files recognized by GitHub's Linguist library are included in the calculation
