import { NextResponse, NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";

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
    const octokit = getOctokitClient();

    // Fetch repository data
    const { data: repoData } = await octokit.rest.repos.get({
      owner,
      repo
    });

    // If contents listing is requested, fetch the directory contents
    let contentsData = null;
    let contentsError = null;

    if (listContents) {
      try {
        const { data: contents } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ...(ref && { ref })
        });

        // Format the contents data for better usage
        contentsData = Array.isArray(contents) ? contents.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          sha: item.sha,
          url: item.html_url,
          download_url: item.download_url,
          // Only include content for very small files if it's included in the response
          content: item.size < 10000 ? item.content : undefined,
        })) : contents;

      } catch (error: any) {
        console.error("Error fetching contents:", error);
        contentsError = error.message || "Failed to fetch repository contents";
      }
    }

    // Return combined data with proper structure
    return NextResponse.json({
      repository: repoData,
      contents: contentsData,
      contentsError,
      currentPath: path || ''
    });

  } catch (err: any) {
    const error = err as Error;

    // Handle specific GitHub error status codes
    if (err.status === 404) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 });
    }

    console.error("Error fetching repository data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}