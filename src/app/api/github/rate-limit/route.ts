import { NextRequest } from "next/server";
import { getOctokitClient } from "@/utils/github";
import { successResponse, errors } from "@/utils/responses";

export async function GET(req: NextRequest) {
    try {
        const octokit = getOctokitClient();

        // Fetch rate limit information
        const { data } = await octokit.rest.rateLimit.get();

        // Format the response with useful information
        const rateLimits = {
            core: {
                limit: data.resources.core.limit,
                remaining: data.resources.core.remaining,
                reset: new Date(data.resources.core.reset * 1000).toISOString(),
                used: data.resources.core.used,
                percentRemaining: Math.round((data.resources.core.remaining / data.resources.core.limit) * 100)
            },
            search: {
                limit: data.resources.search.limit,
                remaining: data.resources.search.remaining,
                reset: new Date(data.resources.search.reset * 1000).toISOString(),
                used: data.resources.search.used,
                percentRemaining: Math.round((data.resources.search.remaining / data.resources.search.limit) * 100)
            },
            ...(data.resources.graphql && {
                graphql: {
                    limit: data.resources.graphql.limit,
                    remaining: data.resources.graphql.remaining,
                    reset: new Date(data.resources.graphql.reset * 1000).toISOString(),
                    used: data.resources.graphql.used,
                    percentRemaining: Math.round((data.resources.graphql.remaining / data.resources.graphql.limit) * 100)
                }
            }),
            // Include rate limit for the authenticated user
            authenticated: !!data.rate.limit
        };

        return successResponse(rateLimits, 'GitHub rate limits retrieved successfully');
    } catch (err: any) {
        console.error("Error fetching rate limits:", err);
        return errors.github(err.message);
    }
}
