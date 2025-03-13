import { NextResponse, NextRequest } from "next/server";
import { getCached, setCached } from "@/utils/cache"; // Import your singleton cache

// Cache TTL in seconds
const REPO_CACHE_TTL = 3600; // 1 hour for repo data
const CONTENTS_CACHE_TTL = 1800; // 30 minutes for contents (files change more often)

export async function GET(req: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const path = searchParams.get('path') || ''; // Optional path parameter
    const ref = searchParams.get('ref') || ''; // Optional branch/tag parameter

    // Validate required parameters
    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing required parameters: 'owner' and 'repo'" },
        { status: 400 }
      );
    }

    // Check if contents listing is requested
    const listContents = searchParams.get('contents') === 'true';

    // Create cache keys
    const repoCacheKey = `github-repo-${owner}-${repo}`;
    const contentsCacheKey = `github-contents-${owner}-${repo}-${path}-${ref || 'default'}`;

    // Fetch repository data (try cache first)
    let repoData = getCached(repoCacheKey);

    // If not in cache, fetch from GitHub API
    if (!repoData) {
      console.log(`Cache miss for ${repoCacheKey}, fetching from GitHub API...`);

      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          // Add your GitHub token if available from env vars
          ...(process.env.GITHUB_TOKEN && {
            "Authorization": `token ${process.env.GITHUB_TOKEN}`
          })
        },
      });

      // Check GitHub API rate limits
      const rateLimit = {
        limit: parseInt(repoResponse.headers.get("x-ratelimit-limit") || "0"),
        remaining: parseInt(repoResponse.headers.get("x-ratelimit-remaining") || "0"),
        reset: parseInt(repoResponse.headers.get("x-ratelimit-reset") || "0"),
      };

      if (rateLimit.remaining <= 5) {
        const resetDate = new Date(rateLimit.reset * 1000).toLocaleString();
        console.warn(`GitHub API rate limit nearly exceeded. Resets at ${resetDate}`);
      }

      // Handle GitHub API errors for repo fetch
      if (!repoResponse.ok) {
        if (repoResponse.status === 404) {
          return NextResponse.json(
            { error: "Repository not found" },
            { status: 404 }
          );
        }

        if (repoResponse.status === 403 && rateLimit.remaining === 0) {
          return NextResponse.json(
            { error: "GitHub API rate limit exceeded. Please try again later." },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { error: `GitHub API error: ${repoResponse.status} ${repoResponse.statusText}` },
          { status: repoResponse.status }
        );
      }

      // Parse repository data
      repoData = await repoResponse.json();

      // Cache the repository data
      setCached(repoCacheKey, repoData, REPO_CACHE_TTL);
      console.log(`Cached repository data with key: ${repoCacheKey}`);
    } else {
      console.log(`Cache hit for ${repoCacheKey}`);
    }

    // If contents listing is requested, fetch the directory contents
    let contentsData = null;
    if (listContents) {
      // Try to get contents from cache first
      contentsData = getCached(contentsCacheKey);

      if (!contentsData) {
        console.log(`Cache miss for ${contentsCacheKey}, fetching from GitHub API...`);

        // Build the contents URL with optional path and ref
        let contentsUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
        if (path) {
          contentsUrl += `/${path}`;
        }
        if (ref) {
          contentsUrl += `?ref=${ref}`;
        }

        const contentsResponse = await fetch(contentsUrl, {
          headers: {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            // Add your GitHub token if available from env vars
            ...(process.env.GITHUB_TOKEN && {
              "Authorization": `token ${process.env.GITHUB_TOKEN}`
            })
          },
        });

        // Check rate limits
        const contentRateLimit = {
          remaining: parseInt(contentsResponse.headers.get("x-ratelimit-remaining") || "0"),
        };

        // Handle GitHub API errors for contents fetch
        if (!contentsResponse.ok) {
          // Return just the repository data if contents fetch fails
          if (contentsResponse.status === 404) {
            return NextResponse.json({
              repository: repoData,
              contents: null,
              contentsError: "Path not found",
              currentPath: path || '',
            });
          }

          if (contentsResponse.status === 403 && contentRateLimit.remaining === 0) {
            return NextResponse.json({
              repository: repoData,
              contents: null,
              contentsError: "GitHub API rate limit exceeded. Please try again later.",
              currentPath: path || '',
            }, { status: 429 });
          }

          return NextResponse.json({
            repository: repoData,
            contents: null,
            contentsError: `GitHub API error: ${contentsResponse.status} ${contentsResponse.statusText}`,
            currentPath: path || '',
          });
        }

        // Parse contents data
        contentsData = await contentsResponse.json();

        // Cache the contents data
        setCached(contentsCacheKey, contentsData, CONTENTS_CACHE_TTL);
        console.log(`Cached contents data with key: ${contentsCacheKey}`);
      } else {
        console.log(`Cache hit for ${contentsCacheKey}`);
      }

      // Format the contents data for better usage
      const formattedContents = Array.isArray(contentsData) ? contentsData.map(item => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
        sha: item.sha,
        url: item.html_url,
        download_url: item.download_url,
        // Only include content for very small files if it's included in the response
        content: item.size < 10000 ? item.content : undefined,
      })) : contentsData;

      // Return combined data with proper structure
      return NextResponse.json({
        repository: repoData,
        contents: formattedContents,
        currentPath: path || '',
      });
    }

    // Return just the repository data if contents listing is not requested
    return NextResponse.json({
      repository: repoData,
      contents: null,
      currentPath: ''
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error fetching repository data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}