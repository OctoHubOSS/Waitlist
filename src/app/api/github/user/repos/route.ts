import { NextResponse, NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const username = searchParams.get('username');
        const sort = searchParams.get('sort') || 'updated'; // created, updated, pushed, full_name
        const direction = searchParams.get('direction') || 'desc'; // asc or desc
        const type = searchParams.get('type') || 'all'; // all, owner, member
        const perPage = parseInt(searchParams.get('per_page') || '30');
        const page = parseInt(searchParams.get('page') || '1');

        // Validate required parameters
        if (!username) {
            return NextResponse.json(
                { error: "Missing required parameter: 'username'" },
                { status: 400 }
            );
        }

        const octokit = getOctokitClient();

        // Fetch repositories for the user
        const { data: repos } = await octokit.rest.repos.listForUser({
            username,
            sort,
            direction,
            type,
            per_page: perPage,
            page
        });

        // Format the response
        const formattedRepos = repos.map(repo => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            private: repo.private,
            description: repo.description,
            fork: repo.fork,
            createdAt: repo.created_at,
            updatedAt: repo.updated_at,
            pushedAt: repo.pushed_at,
            homepage: repo.homepage,
            size: repo.size,
            stargazersCount: repo.stargazers_count,
            watchersCount: repo.watchers_count,
            language: repo.language,
            forksCount: repo.forks_count,
            openIssuesCount: repo.open_issues_count,
            defaultBranch: repo.default_branch,
            topics: repo.topics,
            visibility: repo.visibility,
            url: repo.html_url
        }));

        return NextResponse.json(formattedRepos);
    } catch (err: any) {
        // Handle specific GitHub error status codes
        if (err.status === 404) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.error("Error fetching user repositories:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
