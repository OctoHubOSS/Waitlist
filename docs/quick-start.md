---
title: Quick Start Guide
description: Get up and running with OctoHub in minutes.
category: Getting Started
order: 2
---

# Quick Start Guide

Follow these simple steps to start using OctoHub effectively.

## Basic Setup

The simplest way to get started with OctoHub is:

1. Create your account
2. Create or import a repository
3. Invite team members
4. Set up access controls

## Advanced Features

### User Management

- **Teams**: Create teams with different permission levels
- **Access Control**: Define custom access rules for repositories
- **Activity Tracking**: Monitor user contributions and activity

### Repository Tools

```javascript
// Example of using the Repository API
const createRepo = async (repoData) => {
  const response = await fetch('/api/repos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_TOKEN'
    },
    body: JSON.stringify(repoData)
  });
  
  return await response.json();
};
```

### Organization Settings

- **Member management**: Add, remove, and manage organization members
- **Repository defaults**: Set default settings for new repositories
- **Audit logs**: Track all actions within your organization

## Saved Configurations

To save your configuration preferences:

1. Navigate to Settings
2. Configure your preferences
3. Save your configuration profile
4. Apply to new or existing repositories

## Next Steps

Now that you know the basics, explore the [API Documentation](/docs/api-overview) to learn about integrating OctoHub into your development workflows.
