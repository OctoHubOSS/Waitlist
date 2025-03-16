import { NextResponse } from 'next/server';
import { version } from "@root/package.json";

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'Welcome to the Octoflow API',
        documentation: "https://octoflow.ca/docs",
        version: `v${version}`,
        endpoints: {
            users: '/api/users',
            repositories: '/api/repositories',
            organizations: '/api/organizations',
            pullRequests: '/api/pull-requests',
            issues: '/api/issues',
        }
    });
}
