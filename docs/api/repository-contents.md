---
title: Repository Contents
description: Retrieve files and directories from a GitHub repository
category: API Reference
order: 3
---

# Repository Contents API

Retrieves the contents of a file or directory in a GitHub repository.

## Endpoint

```
GET /api/repo/contents
```

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `owner` | Yes | Repository owner (username or organization) |
| `repo` | Yes | Repository name |
| `path` | No | File or directory path (default: root) |
| `ref` | No | Branch, tag, or commit SHA |

## Example Requests

### Get Directory Contents

```javascript
const fetchDirectoryContents = async () => {
  const params = new URLSearchParams({
    owner: 'octocat',
    repo: 'hello-world',
    path: 'src'
  });
  
  const response = await fetch(`/api/repo/contents?${params}`);
  return await response.json();
};
```

### Get File Contents

```javascript
const fetchFileContents = async () => {
  const params = new URLSearchParams({
    owner: 'octocat',
    repo: 'hello-world',
    path: 'README.md'
  });
  
  const response = await fetch(`/api/repo/contents?${params}`);
  return await response.json();
};
```

## Response - Directory

```json
[
  {
    "name": "components",
    "path": "src/components",
    "sha": "abcdef123456",
    "size": 0,
    "type": "dir",
    "url": "https://github.com/octocat/hello-world/tree/main/src/components",
    "downloadUrl": null
  },
  {
    "name": "app.tsx",
    "path": "src/app.tsx",
    "sha": "ghijkl789012",
    "size": 1024,
    "type": "file",
    "url": "https://github.com/octocat/hello-world/blob/main/src/app.tsx",
    "downloadUrl": "https://raw.githubusercontent.com/octocat/hello-world/main/src/app.tsx"
  }
]
```

## Response - File

```json
{
  "name": "README.md",
  "path": "README.md",
  "sha": "abcdef123456",
  "size": 512,
  "type": "file",
  "content": "# Hello World\n\nThis is a sample repository to demonstrate GitHub features.",
  "encoding": "base64",
  "url": "https://github.com/octocat/hello-world/blob/main/README.md",
  "downloadUrl": "https://raw.githubusercontent.com/octocat/hello-world/main/README.md"
}
```

## Error Responses

### Missing Required Parameters

```json
{
  "error": "Missing required parameters: 'owner' and 'repo'"
}
```

### File or Repository Not Found

```json
{
  "error": "File or repository not found"
}
```

## Notes

- When requesting a directory, the API returns an array of files and subdirectories
- When requesting a file, the API returns the file metadata and content
- Binary files (images, etc.) have their contents encoded in base64
- For large files, it's better to use the `downloadUrl` to fetch the raw content
