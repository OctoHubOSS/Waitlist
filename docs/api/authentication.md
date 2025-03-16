---
title: Authentication API
description: User authentication and account management endpoints
category: API Reference
order: 11
---

# Authentication API

OctoSearch provides comprehensive authentication endpoints for user registration, login, account management, and GitHub integration.

## User Registration

### Endpoint

```
POST /api/auth/register
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe",
  "image": "https://example.com/avatar.jpg" // Optional
}
```

### Response

```json
{
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://example.com/avatar.jpg",
    "createdAt": "2023-06-15T10:00:00Z"
  },
  "message": "User registered successfully"
}
```

## Password Management

### Change Password

```
POST /api/auth/change-password
```

#### Request Body
```json
{
  "currentPassword": "CurrentPassword123",
  "newPassword": "NewSecurePassword456"
}
```

### Add Password

For accounts created with OAuth that need to add password authentication:

```
POST /api/auth/add-password
```

#### Request Body
```json
{
  "password": "SecurePassword123"
}
```

### Reset Password

```
POST /api/auth/reset-password
```

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "NewSecurePassword456",
  "token": "reset_token_received_by_email"
}
```

### Forgot Password

```
POST /api/auth/forgot-password
```

#### Request Body
```json
{
  "email": "user@example.com"
}
```

## GitHub Account Integration

### Link GitHub Account

```
POST /api/auth/link-github
```

#### Request Body
```json
{
  "accessToken": "github_oauth_access_token"
}
```

### Unlink GitHub Account

```
POST /api/auth/unlink-github
```

## Notes

- All authentication endpoints except registration and password reset require an authenticated session
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- GitHub account linking allows enhanced features like higher API rate limits
- Email verification may be required for certain operations
