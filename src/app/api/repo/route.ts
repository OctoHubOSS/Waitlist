import { NextResponse, NextRequest } from "next/server";
import { RepoPage } from "@/types/repos";

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

    // Fetch repository data
    let repoData;
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
    });

    // Handle GitHub API errors for repo fetch
    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: `GitHub API error: ${repoResponse.status} ${repoResponse.statusText}` },
        { status: repoResponse.status }
      );
    }

    // Parse repository data
    repoData = await repoResponse.json();

    // If contents listing is requested, fetch the directory contents
    let contentsData = null;
    if (listContents) {
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
          "X-GitHub-Api-Version": "2022-11-28"
        },
      });

      // Handle GitHub API errors for contents fetch
      if (!contentsResponse.ok) {
        // Return just the repository data if contents fetch fails
        if (contentsResponse.status === 404) {
          return NextResponse.json({
            ...repoData,
            contents: null,
            contentsError: "Path not found"
          });
        }

        return NextResponse.json({
          ...repoData,
          contents: null,
          contentsError: `GitHub API error: ${contentsResponse.status} ${contentsResponse.statusText}`
        });
      }

      // Parse contents data
      contentsData = await contentsResponse.json();

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

      // Return combined data
      return NextResponse.json({
        ...repoData,
        contents: formattedContents,
        currentPath: path || '',
      });
    }

    // Return just the repository data if contents listing is not requested
    return NextResponse.json(repoData);
  } catch (err) {
    const error = err as Error;
    console.error("Error fetching repository data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}