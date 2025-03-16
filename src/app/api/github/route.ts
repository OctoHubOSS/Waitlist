import { successResponse } from "@/utils/responses";

export async function GET(request: Request) {
    return successResponse({
        message: 'OctoFlow GitHub API endpoint',
        documentation: '/api/docs/github'
    }, 'GitHub API is operational');
}
