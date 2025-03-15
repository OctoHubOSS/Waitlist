---
title: Quick Start Guide
description: Get up and running with OctoSearch in minutes.
category: Getting Started
order: 2
---

# Quick Start Guide

Follow these simple steps to start using OctoSearch effectively.

## Basic Search

The simplest way to use OctoSearch is through the main search bar:

1. Enter your search query
2. Select the type of entity you want to find (users, repositories, organizations)
3. Press Enter or click the search icon

## Advanced Filters

For more precise results, use the advanced filters:

### User Filters

- **Language**: Filter by programming language expertise
- **Location**: Find users in specific geographic areas
- **Repository count**: Filter by number of public repositories
- **Followers**: Find users with specific follower ranges

### Repository Filters

```javascript
// Example of using the Repository Search API
const searchRepos = async (query) => {
  const params = new URLSearchParams({
    q: query,
    sort: 'stars',
    order: 'desc',
    per_page: 10
  });
  
  const response = await fetch(`/api/search/repos?${params}`);
  const data = await response.json();
  return data.items;
};
```

### Organization Filters

- **Member count**: Filter by organization size
- **Repository count**: Find organizations with specific numbers of public repos
- **Type**: Filter by nonprofit, company, education, etc.

## Saved Searches

To save your searches for later:

1. Perform your search with desired filters
2. Click the "Save Search" button
3. Give your search a name
4. Access saved searches from your profile

## Next Steps

Now that you know the basics, explore the [Search APIs](/docs/search-apis) documentation to learn about integrating OctoSearch into your applications.
