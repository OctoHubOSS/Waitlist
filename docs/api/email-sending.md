---
title: Email Service
description: Send email notifications from OctoSearch
category: API Reference
order: 12
---

# Email Service API

Allows administrators to send email notifications through the OctoSearch platform.

## Security Notice

This API is only accessible to authenticated administrators.

## Endpoint

```
POST /api/email/send
```

## Request Body

| Field | Required | Description |
|-------|----------|-------------|
| `to` | Yes | Recipient email address |
| `subject` | Yes | Email subject line |
| `text` | Yes | Plain text content of the email |
| `html` | No | HTML version of the email (defaults to text if not provided) |

## Example Request

```javascript
const sendNotification = async () => {
  const emailData = {
    to: "user@example.com",
    subject: "Important OctoSearch Update",
    text: "We've updated our terms of service. Please review the changes.",
    html: "<h1>Important Update</h1><p>We've updated our <b>terms of service</b>. Please review the changes.</p>"
  };
  
  const response = await fetch('/api/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailData)
  });
  
  return await response.json();
};
```

## Response

```json
{
  "message": "Email sent successfully",
  "messageId": "unique-message-id"
}
```

## Error Responses

### Unauthorized Access

```json
{
  "error": "Authentication required"
}
```

### Permission Denied

```json
{
  "error": "Permission denied"
}
```

### Invalid Request Format

```json
{
  "error": "Invalid email request",
  "details": {
    "to": ["Invalid email format"]
  }
}
```

## Notes

- This API is intended for administrative notifications only
- Rate limits may apply to prevent abuse
- Email delivery is handled by the platform's configured email service provider
- All emails are logged for auditing purposes
