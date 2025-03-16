import { NextResponse, NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";

export async function GET(req: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = req.nextUrl.searchParams;
        const owner = searchParams.get('owner');
        const repo = searchParams.get('repo');
        const state = searchParams.get('state') || 'all'; // open, closed, all
        const labels = searchParams.get('labels'); // comma-separated list of label names
        const sort = searchParams.get('sort') || 'created'; // created, updated, comments
        const direction = searchParams.get('direction') || 'desc'; // asc or desc
        const perPage = parseInt(searchParams.get('per_page') || '30');
        const page = parseInt(searchParams.get('page') || '1');
        const type = searchParams.get('type'); // issue, pr, or all (undefined)

        // Validate required parameters
        if (!owner || !repo) {
            return NextResponse.json(
                { error: "Missing required parameters: 'owner' and 'repo'" },
                { status: 400 }
            );
        }

        const octokit = getOctokitClient();

        const params: any = {
            owner,
            repo,
            state,
            sort,
            direction,
            per_page: perPage,
            page
        };

        // Add labels if provided
        if (labels) {
            params.labels = labels;
        }

        // Fetch issues/PRs
        let issues;
        if (type === 'pr') {
            // For pull requests only
            const { data } = await octokit.rest.pulls.list(params);
            issues = data;
        } else {
            // For issues (including PRs by default)
            const { data } = await octokit.rest.issues.listForRepo(params);

            // Filter out PRs if type is explicitly set to 'issue'
            if (type === 'issue') {
                issues = data.filter(item => !item.pull_request);
            } else {
                issues = data;
            }
        }

        // Format the response
        const formattedIssues = issues.map(issue => ({
            id: issue.id,
            number: issue.number,
            title: issue.title,
            state: issue.state,
            locked: issue.locked,
            assignee: issue.assignee ? {
                login: issue.assignee.login,
                avatar_url: issue.assignee.avatar_url
            } : null,
            assignees: issue.assignees?.map(assignee => ({
                login: assignee.login,
                avatar_url: assignee.avatar_url
            })),
            labels: issue.labels.map((label: any) => ({
                name: label.name,
                color: label.color,
                description: label.description
            })),
            author: {
                login: issue.user?.login,
                avatar_url: issue.user?.avatar_url
            },
            created_at: issue.created_at,
            updated_at: issue.updated_at,
            closed_at: issue.closed_at,
            body: issue.body,
            comments: issue.comments,
            url: issue.html_url,
            // Include additional PR-specific fields if available
            ...(issue.pull_request && {
                pull_request: {
                    url: issue.pull_request.html_url,
                    merged_at: issue.pull_request.merged_at
                }
            })
        }));

        return NextResponse.json(formattedIssues);
    } catch (err: any) {
        // Handle specific GitHub error status codes
        if (err.status === 404) {
            return NextResponse.json({ error: "Repository not found" }, { status: 404 });
        }

        console.error("Error fetching issues:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
