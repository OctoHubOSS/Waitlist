import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { linkGithubAccount } from "@/lib/account";
import { getOctokitClient } from "@/utils/github";
import { sendEmail, emailTemplates } from "@/lib/email";
import { successResponse, errors, handleApiError } from "@/lib/api/responses";
import { schemas, validateBody } from "@/lib/api/validation";
import { z } from "zod";

/**
 * POST /api/auth/link-github
 * Links a GitHub account to the current user's account
 */
export async function POST(req: NextRequest) {
    try {
        // Get current session and ensure user is authenticated
        const session = await getSession();
        if (!session?.user?.id) {
            return errors.unauthorized("You must be logged in to link a GitHub account");
        }

        // Parse and validate the request body
        const githubTokenSchema = z.object({
            accessToken: schemas.tokens.accessToken
        });

        const validation = await validateBody(req, githubTokenSchema);

        if (!validation.success) {
            return errors.badRequest(
                "GitHub access token is required",
                validation.error?.details
            );
        }

        const { accessToken }: any = validation.data;

        const userId = session.user.id;

        // Get GitHub user info
        try {
            const octokit = getOctokitClient(accessToken);
            const { data: githubUser } = await octokit.rest.users.getAuthenticated();

            if (!githubUser || !githubUser.id) {
                return errors.badRequest("Failed to fetch GitHub user data");
            }

            // Link GitHub account to user
            await linkGithubAccount(
                userId,
                githubUser.id.toString(),
                githubUser.login,
                githubUser.name || undefined
            );

            // Send confirmation email if user has email
            if (session.user.email) {
                const emailTemplate = emailTemplates.githubLinked(githubUser.login);
                await sendEmail({
                    to: session.user.email,
                    ...emailTemplate
                });
            }

            return successResponse(
                { githubUsername: githubUser.login },
                "GitHub account linked successfully"
            );
        } catch (githubError) {
            return errors.github(
                "GitHub API error",
                { originalError: (githubError as Error).message }
            );
        }
    } catch (error) {
        return handleApiError(error);
    }
}