---
title: Repository Changelog
description: Generate changelogs from repository releases or tags
category: API Reference
order: 8
---

# Repository Changelog API

Generates and retrieves changelog information from a repository's releases or tags.

## Endpoint

```
GET /api/repo/changelog
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `owner` | No | Repository owner (default: 'git-logs') |
| `repo` | No | Repository name (default: 'octosearch') |
| `latest` | No | Set to 'true' to retrieve only the latest changelog |
| `count` | No | Number of changelogs to retrieve (default: 5) |

## Example Requests

### Get Latest Changelog

```javascript
const fetchLatestChangelog = async () => {
  const params = new URLSearchParams({
    owner: 'octocat',
    repo: 'hello-world',
    latest: 'true'
  });
  
  const response = await fetch(`/api/repo/changelog?${params}`);
  return await response.json();
};
```

### Get Multiple Changelogs

```javascript
const fetchMultipleChangelogs = async () => {
  const params = new URLSearchParams({
    owner: 'octocat',
    repo: 'hello-world',
    count: '3'
  });
  
  const response = await fetch(`/api/repo/changelog?${params}`);
  return await response.json();
};
```

## Response

```json
{
  "changelogs": [
    {
      "version": "v1.2.0",
      "name": "Feature Release",
      "isLatest": true,
      "publishedAt": "2023-06-15T10:00:00Z",
      "url": "https://github.com/octocat/hello-world/releases/tag/v1.2.0",
      "description": "This release adds several new features and fixes bugs",
      "prerelease": false,
      "draft": false,
      "commits": [
        {
          "sha": "abcdef123456",
          "shortSha": "abcdef1",
          "message": "Add user authentication",
          "fullMessage": "Add user authentication with OAuth support",
          "date": "2023-06-10T14:00:00Z",
          "author": {
            "name": "Jane Doe",
            "email": "jane@example.com",
            "login": "jane-doe",
            "avatar_url": "https://avatars.githubusercontent.com/u/12345?v=4"
          },
          "url": "https://github.com/octocat/hello-world/commit/abcdef123456",
          "type": "feature"
        },
        {
          "sha": "ghijkl789012",
          "shortSha": "ghijkl7",
          "message": "Fix login redirect bug",
          "fullMessage": "Fix login redirect bug when session expires",
          "date": "2023-06-12T09:30:00Z",
          "author": {
            "name": "John Smith",
            "email": "john@example.com",
            "login": "john-smith",
            "avatar_url": "https://avatars.githubusercontent.com/u/67890?v=4"
          },
          "url": "https://github.com/octocat/hello-world/commit/ghijkl789012",
          "type": "fix"
        }
      ],
      "summary": {
        "features": 3,
        "fixes": 2,
        "improvements": 1,
        "docs": 1,
        "others": 0,
        "totalCommits": 7
      },
      "formattedBody": "# v1.2.0 - Feature Release\n\n## Features\n- Add user authentication\n- Add dark mode support\n- Add export functionality\n\n## Fixes\n- Fix login redirect bug\n- Fix styling issues in mobile view\n\n## Improvements\n- Improve loading performance\n\n## Documentation\n- Update API documentation"
    }
  ]
}
```

## Error Response

```json
{
  "error": "Failed to generate changelog: Repository not found"
}
```

## Notes

- If the repository has no releases, the API attempts to generate changelogs from tags
- Commits are categorized into types: 'feature', 'fix', 'improvement', 'docs', and 'other'
- The categorization is based on conventional commit message prefixes
- The `formattedBody` provides a Markdown-formatted changelog ready for display
- Each commit includes the full commit message and a shortened version for display
