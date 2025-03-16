---
title: Trending API
description: Retrieve trending repositories and developers on GitHub
category: API Reference
order: 16
---

# Trending API

Access GitHub's trending repositories and developers with customizable time ranges and filters.

## Trending Repositories

### Endpoint

```
GET /api/trending/repos
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `since` | No | Time period: 'daily', 'weekly', 'monthly' (default: 'daily') |
| `language` | No | Filter by programming language |
| `page` | No | Page number (default: 1) |
| `stars` | No | Minimum number of stars |
| `forks` | No | Minimum number of forks |

### Example Request

```javascript
const fetchTrendingRepos = async () => {
  const params = new URLSearchParams({
    since: 'weekly',
    language: 'javascript',
    stars: '100'
  });
  
  const response = await fetch(`/api/trending/repos?${params}`);
  return await response.json();
};
```

### Response

```json
{
  "data": [
    {
      "id": 123456789,
      "name": "awesome-project",
      "repo": "developer/awesome-project",
      "description": "An amazing open source project",
      "language": "JavaScript",
      "stars": 5432,
      "forks": 987,
      "updatedAt": "7/1/2023, 10:00:00 AM",
      "url": "https://github.com/developer/awesome-project",
      "owner": {
        "login": "developer",
        "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4",
        "url": "https://github.com/developer"
      },
      "createdAt": "6/1/2023",
      "pushedAt": "7/1/2023",
      "openIssues": 25,
      "topics": ["web", "framework", "javascript"]
    }
  ]
}
```

## Trending Developers

### Endpoint

```
GET /api/trending/devs
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `since` | No | Time period: 'daily', 'weekly', 'monthly' (default: 'daily') |
| `page` | No | Page number (default: 1) |

### Example Request

```javascript
const fetchTrendingDevs = async () => {
  const params = new URLSearchParams({
    since: 'monthly',
    page: '1'
  });
  
  const response = await fetch(`/api/trending/devs?${params}`);
  return await response.json();
};
```

### Response

```json
{
  "data": [
    {
      "id": 12345,
      "login": "developer",
      "name": "Awesome Developer",
      "avatarUrl": "https://avatars.githubusercontent.com/u/12345?v=4",
      "bio": "Open source enthusiast and JavaScript developer",
      "type": "User",
      "company": "Tech Company",
      "location": "San Francisco, CA",
      "blog": "https://developer.blog",
      "email": null,
      "followers": 5432,
      "following": 123,
      "publicRepos": 45,
      "stats": {
        "followersFormatted": "5.4k",
        "followingFormatted": "123",
        "reposFormatted": "45"
      },
      "topRepositories": [
        {
          "id": 987654321,
          "name": "popular-library",
          "stars": 4321
        }
      ]
    }
  ]
}
```

## Error Responses

```json
{
  "error": "Failed to fetch trending repositories from GitHub",
  "details": "Rate limit exceeded"
}
```

## Notes

- Trending data is calculated based on recent activity, not all-time popularity
- The `since` parameter determines the time window for calculating trends
- Authentication increases the rate limit for these endpoints
- Results may vary day to day as GitHub's trending algorithm considers recent activity
- For repositories, the `stars` and `forks` parameters help filter for higher quality projects
- For developers, trending is primarily based on recent repository activity and follower growth
