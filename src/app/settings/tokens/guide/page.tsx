"use client";

import { useState } from "react";
import Link from "next/link";
import { FaArrowLeft, FaCode, FaCopy, FaTerminal } from "react-icons/fa";
import { MdLanguage } from "react-icons/md";
import SettingsLayout from "@/components/Layout/Settings";

export default function TokenUsageGuidePage() {
  const [language, setLanguage] = useState<'curl' | 'node' | 'python' | 'go'>('curl');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy code:', err);
      });
  };

  const renderCodeSample = () => {
    switch (language) {
      case 'curl':
        return `# Make a basic request with curl
curl -H "Authorization: Bearer YOUR_API_TOKEN" \\
  https://api.octosearch.dev/v1/search?q=react

# Upload data with curl
curl -X POST \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "My Repository", "description": "A test repository"}' \\
  https://api.octosearch.dev/v1/repos`;

      case 'node':
        return `// Using fetch API in JavaScript/TypeScript
const fetchData = async () => {
  const response = await fetch('https://api.octosearch.dev/v1/search?q=react', {
    headers: {
      'Authorization': 'Bearer YOUR_API_TOKEN'
    }
  });
  
  const data = await response.json();
  console.log(data);
};

// Using Axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.octosearch.dev/v1',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN'
  }
});

// Get data
api.get('/search', { params: { q: 'react' } })
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

// Post data
api.post('/repos', {
  name: 'My Repository',
  description: 'A test repository'
})
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`;

      case 'python':
        return `# Using requests in Python
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN'
}

# Get data
response = requests.get(
    'https://api.octosearch.dev/v1/search',
    params={'q': 'react'},
    headers=headers
)
data = response.json()
print(data)

# Post data
response = requests.post(
    'https://api.octosearch.dev/v1/repos',
    json={
        'name': 'My Repository',
        'description': 'A test repository'
    },
    headers=headers
)
data = response.json()
print(data)`;

      case 'go':
        return `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

func main() {
	// Get data
	req, err := http.NewRequest("GET", "https://api.octosearch.dev/v1/search?q=react", nil)
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
	
	postReq, err := http.NewRequest("POST", "https://api.octosearch.dev/v1/repos", bytes.NewBuffer(jsonData))
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
}`;
    }
  };

  return (
    <SettingsLayout
      title="API Token Usage Guide"
      description="Learn how to use API tokens to authenticate with the OctoSearch API"
    >
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">API Token Usage Guide</h1>
          <Link
            href="/settings/tokens"
            className="btn btn-ghost btn-sm flex items-center"
          >
            <FaArrowLeft className="mr-2" /> Back to tokens
          </Link>
        </div>
        <p className="text-github-text-secondary mt-2">
          Learn how to use API tokens to access the OctoSearch API programmatically.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Authentication</h2>
          <div className="bg-github-dark-secondary/40 border border-github-border rounded-md p-4">
            <p className="text-github-text-secondary mb-4">
              To authenticate with the OctoSearch API, include your token in the Authorization header of your request:
            </p>
            <div className="bg-github-dark rounded-md p-3 font-mono text-sm overflow-auto">
              <code className="text-github-text-secondary">
                Authorization: Bearer YOUR_API_TOKEN
              </code>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Base URL</h2>
          <div className="bg-github-dark-secondary/40 border border-github-border rounded-md p-4">
            <p className="text-github-text-secondary mb-2">All API requests should be sent to:</p>
            <div className="bg-github-dark rounded-md p-3 font-mono text-sm overflow-auto">
              <code className="text-github-text-secondary">
                https://api.octosearch.dev/v1
              </code>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Code Examples</h2>
          <div className="bg-github-dark-secondary/40 border border-github-border rounded-md p-4">
            <div className="flex mb-4 overflow-x-auto">
              <button 
                className={`px-4 py-2 rounded-md flex items-center mr-2 ${language === 'curl' ? 'bg-github-accent text-white' : 'bg-github-dark text-github-text-secondary'}`}
                onClick={() => setLanguage('curl')}
              >
                <FaTerminal className="mr-2" /> cURL
              </button>
              <button 
                className={`px-4 py-2 rounded-md flex items-center mr-2 ${language === 'node' ? 'bg-github-accent text-white' : 'bg-github-dark text-github-text-secondary'}`}
                onClick={() => setLanguage('node')}
              >
                <FaCode className="mr-2" /> JavaScript
              </button>
              <button 
                className={`px-4 py-2 rounded-md flex items-center mr-2 ${language === 'python' ? 'bg-github-accent text-white' : 'bg-github-dark text-github-text-secondary'}`}
                onClick={() => setLanguage('python')}
              >
                <FaCode className="mr-2" /> Python
              </button>
              <button 
                className={`px-4 py-2 rounded-md flex items-center ${language === 'go' ? 'bg-github-accent text-white' : 'bg-github-dark text-github-text-secondary'}`}
                onClick={() => setLanguage('go')}
              >
                <FaCode className="mr-2" /> Go
              </button>
            </div>
            
            <div className="relative">
              <div className="bg-github-dark rounded-md p-4 font-mono text-sm overflow-auto">
                <pre className="text-github-text-secondary whitespace-pre-wrap">
                  {renderCodeSample()}
                </pre>
              </div>
              <button 
                onClick={() => copyToClipboard(renderCodeSample())}
                className="absolute top-2 right-2 p-2 rounded-md bg-github-dark-secondary/80 hover:bg-github-dark-secondary text-github-text-secondary hover:text-white"
                title="Copy to clipboard"
              >
                <FaCopy />
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Rate Limiting</h2>
          <div className="bg-github-dark-secondary/40 border border-github-border rounded-md p-4">
            <p className="text-github-text-secondary mb-4">
              The OctoSearch API has rate limits to ensure fair usage:
            </p>
            <ul className="list-disc list-inside space-y-2 text-github-text-secondary">
              <li>Basic tokens: 1,000 requests per hour</li>
              <li>Advanced tokens: 5,000 requests per hour</li>
              <li>
                Rate limit information is included in response headers:
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>X-RateLimit-Limit: Maximum number of requests</li>
                  <li>X-RateLimit-Remaining: Remaining requests for the time window</li>
                  <li>X-RateLimit-Reset: Time when the rate limit will reset (Unix timestamp)</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">API Documentation</h2>
          <div className="bg-github-dark-secondary/40 border border-github-border rounded-md p-4">
            <p className="text-github-text-secondary mb-4">
              For detailed documentation of all available endpoints and response formats, visit our API documentation:
            </p>
            <Link
              href="/docs/api"
              className="btn btn-primary flex items-center"
            >
              <MdLanguage className="mr-2" /> View API Documentation
            </Link>
          </div>
        </section>
      </div>
    </SettingsLayout>
  );
}
