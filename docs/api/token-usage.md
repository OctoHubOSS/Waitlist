---
title: Token Usage
description: OctoHub API Token Usage Guide
category: API Reference
order: 18
---

# OctoHub API Token Usage Guide

This guide explains how to use API tokens to access the OctoHub API programmatically.

## Authentication

To authenticate with the OctoHub API, include your token in the Authorization header of your request:

```
Authorization: Bearer YOUR_API_TOKEN
```

## Base URL

All API requests should be sent to:

```
https://api.octohub.dev/v1
```

## Code Examples

### cURL

```bash
# Make a basic request with curl
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://api.octohub.dev/v1/search?q=react

# Upload data with curl
curl -X POST \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Repository", "description": "A test repository"}' \
  https://api.octohub.dev/v1/repos
```

### JavaScript/TypeScript

```javascript
// Using fetch API in JavaScript/TypeScript
const fetchData = async () => {
  const response = await fetch("https://api.octohub.dev/v1/search?q=react", {
    headers: {
      Authorization: "Bearer YOUR_API_TOKEN",
    },
  });

  const data = await response.json();
  console.log(data);
};

// Using Axios
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.octohub.dev/v1",
  headers: {
    Authorization: "Bearer YOUR_API_TOKEN",
  },
});

// Get data
api
  .get("/search", { params: { q: "react" } })
  .then((response) => console.log(response.data))
  .catch((error) => console.error(error));

// Post data
api
  .post("/repos", {
    name: "My Repository",
    description: "A test repository",
  })
  .then((response) => console.log(response.data))
  .catch((error) => console.error(error));
```

### Python

```python
# Using requests in Python
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN'
}

# Get data
response = requests.get(
    'https://api.octohub.dev/v1/search',
    params={'q': 'react'},
    headers=headers
)
data = response.json()
print(data)

# Post data
response = requests.post(
    'https://api.octohub.dev/v1/repos',
    json={
        'name': 'My Repository',
        'description': 'A test repository'
    },
    headers=headers
)
data = response.json()
print(data)
```

### Go

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	// Get data
	req, err := http.NewRequest("GET", "https://api.octohub.dev/v1/search?q=react", nil)
	if err != nil {
		fmt.Println("Error creating request:", err)
		return
	}

	req.Header.Add("Authorization", "Bearer YOUR_API_TOKEN")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("Error making request:", err)
		return
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response:", err)
		return
	}

	fmt.Println(string(body))

	// Post data
	data := map[string]string{
		"name":        "My Repository",
		"description": "A test repository",
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		fmt.Println("Error marshaling data:", err)
		return
	}

	postReq, err := http.NewRequest("POST", "https://api.octohub.dev/v1/repos", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error creating POST request:", err)
		return
	}

	postReq.Header.Add("Authorization", "Bearer YOUR_API_TOKEN")
	postReq.Header.Add("Content-Type", "application/json")

	postResp, err := client.Do(postReq)
	if err != nil {
		fmt.Println("Error making POST request:", err)
		return
	}
	defer postResp.Body.Close()

	postBody, err := ioutil.ReadAll(postResp.Body)
	if err != nil {
		fmt.Println("Error reading POST response:", err)
		return
	}

	fmt.Println(string(postBody))
}
```

## Rate Limiting

The OctoHub API has rate limits to ensure fair usage:

- Basic tokens: 1,000 requests per hour
- Advanced tokens: 5,000 requests per hour
- Rate limit information is included in response headers:
  - X-RateLimit-Limit: Maximum number of requests
  - X-RateLimit-Remaining: Remaining requests for the time window
  - X-RateLimit-Reset: Time when the rate limit will reset (Unix timestamp)
