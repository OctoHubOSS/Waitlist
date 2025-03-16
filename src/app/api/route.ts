import { version } from "@root/package.json";
import { successResponse } from "@/utils/responses";

export async function GET() {
    return successResponse({
        message: 'Welcome to the Octoflow API',
        documentation: "https://octoflow.ca/docs",
        version: `v${version}`,
        endpoints: {
            users: '/api/base/users',
            repositories: '/api/base/repositories',
            organizations: '/api/base/organizations',
            pullRequests: '/api/base/pull-requests',
            issues: '/api/base/issues',
        }
    });
}
