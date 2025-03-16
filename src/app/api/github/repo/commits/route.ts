import { NextResponse, NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const owner = searchParams.get('owner');
        const repo = searchParams.get('repo');
        const path = searchParams.get('path'); // Optional to filter commits by file path
        const sha = searchParams.get('sha'); // Branch, tag, or commit SHA
        const author = searchParams.get('author'); // Filter by author
        const since = searchParams.get('since'); // ISO 8601 timestamp
        const until = searchParams.get('until'); // ISO 8601 timestamp
        const perPage = parseInt(searchParams.get('per_page') || '30');
        const page = parseInt(searchParams.get('page') || '1');

        // Validate required parameters
        if (!owner || !repo) {
            return NextResponse.json(
                { error: "Missing required parameters: 'owner' and 'repo'" },
                { status: 400 }
            );
        }

        const octokit = getOctokitClient();

        // Build request params
        const params: any = {
            owner,
            repo,
            per_page: perPage,
            page
        };

        // Add optional filters if they exist
        if (path) params.path = path;
        if (sha) params.sha = sha;
        if (author) params.author = author;
        if (since) params.since = since;
        if (until) params.until = until;

        // Fetch commits
        const { data: commits } = await octokit.rest.repos.listCommits(params);

        // Format the response
        const formattedCommits = commits.map(commit => ({
            sha: commit.sha,
            commit: {
                message: commit.commit.message,
                author: {
                    name: commit.commit.author?.name,
                    email: commit.commit.author?.email,
                    date: commit.commit.author?.date
                },
                committer: {
                    name: commit.commit.committer?.name,
                    email: commit.commit.committer?.email,
                    date: commit.commit.committer?.date
                }
            },
            author: commit.author ? {
                login: commit.author.login,
                avatar_url: commit.author.avatar_url,
                url: commit.author.html_url
            } : null,
            committer: commit.committer ? {
                login: commit.committer.login,
                avatar_url: commit.committer.avatar_url,
                url: commit.committer.html_url
            } : null,
            html_url: commit.html_url,
            stats: commit.stats
        }));

        return NextResponse.json(formattedCommits);
    } catch (err: any) {
        // Handle specific GitHub error status codes
        if (err.status === 404) {
            return NextResponse.json({ error: "Repository not found" }, { status: 404 });
        }

        console.error("Error fetching repository commits:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
