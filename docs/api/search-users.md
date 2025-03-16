---
title: User Search
description: Search for GitHub users and organizations
category: API Reference
order: 15
---

# User Search API

Search for GitHub users and organizations based on various criteria.

## Endpoint

```
GET /api/search/users
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `q` | Yes | Search query string |
| `sort` | No | Sort by: 'followers', 'repositories', 'joined' |
| `order` | No | Sort direction: 'asc' or 'desc' (default: 'desc') |
| `per_page` | No | Number of results per page (default: 30, max: 100) |
| `page` | No | Page number (default: 1) |
| `type` | No | Filter by: 'user' or 'org' |

## Example Requests

### Basic User Search

```javascript
const searchUsers = async (query) => {
  const params = new URLSearchParams({
    q: query
  });
  
  const response = await fetch(`/api/search/users?${params}`);
  return await response.json();
};
```

### Search for Organizations with Sorting

```javascript
const searchOrgs = async (query) => {
  const params = new URLSearchParams({
    q: query,
    type: 'org',
    sort: 'repositories',
    order: 'desc',
    per_page: '20'
  });
  
  const response = await fetch(`/api/search/users?${params}`);
  return await response.json();
};
```

## Response

```json
{
  "total_count": 42,
  "incomplete_results": false,
  "items": [
    {
      "id": 12345,
      "login": "octocat",
      "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
      "url": "https://github.com/octocat",
      "type": "User",
      "score": 24.68
    },
    {
      "id": 67890,
      "login": "octoorg",
      "avatar_url": "https://avatars.githubusercontent.com/u/67890?v=4",
      "url": "https://github.com/octoorg",
      "type": "Organization",
      "score": 18.92
    }
  ]
}
```

## Search Syntax

Advanced search syntax for the query parameter:

- `type:user` or `type:org`: Filter by user type
- `language:javascript`: Search users who primarily use a specific language
- `location:city`: Search by location
- `followers:>1000`: Users with more than 1000 followers
- `repos:>10`: Users with more than 10 repositories
- `created:>2020-01-01`: Users who joined after a specific date
- `is:hireable`: Users open to job opportunities

## Error Responses

```json
{
  "error": "Failed to search users: API rate limit exceeded"
}
```

## Notes

- Combine multiple search filters for more precise results
- The search is case-insensitive
- For organization search, use `type=org` to filter out individual users
- Score is based on relevance to the search query
- Users with public profiles are more likely to appear in search results
