import { NextResponse, NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const username = searchParams.get('username');
        const sort = searchParams.get('sort'); // created or updated
        const direction = searchParams.get('direction') || 'desc'; // asc or desc
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

        // Build request parameters
        const params: any = {
            username,
            per_page: perPage,
            page,
            direction
        };

        // Add sort if provided
        if (sort) params.sort = sort;

        // Fetch starred repositories
        const { data: starredRepos } = await octokit.rest.activity.listReposStarredByUser(params);

        // Format the response
        const formattedRepos = starredRepos.map(repo => ({
            id: repo.repo.id,
            name: repo.repo.name,
            fullName: repo.repo.full_name,
            description: repo.repo.description,
            private: repo.repo.private,
            fork: repo.repo.fork,
            url: repo.repo.html_url,
            homepage: repo.repo.homepage,
            language: repo.repo.language,
            forksCount: repo.repo.forks_count,
            stargazersCount: repo.repo.stargazers_count,
            watchersCount: repo.repo.watchers_count,
            size: repo.repo.size,
            defaultBranch: repo.repo.default_branch,
            openIssuesCount: repo.repo.open_issues_count,
            topics: repo.repo.topics,
            hasIssues: repo.repo.has_issues,
            hasProjects: repo.repo.has_projects,
            hasWiki: repo.repo.has_wiki,
            owner: {
                login: repo.repo.owner.login,
                avatar_url: repo.repo.owner.avatar_url,
                url: repo.repo.owner.html_url
            },
            // Add starred timestamp if available
            starred_at: repo.starred_at
        }));

        return NextResponse.json(formattedRepos);
    } catch (err: any) {
        // Handle specific GitHub error status codes
        if (err.status === 404) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.error("Error fetching starred repositories:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
