import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { linkGithubAccount } from "@/lib/account";
import { getOctokitClient } from "@/utils/github";
import { sendEmail, emailTemplates } from "@/lib/email";
import { z } from "zod";

// GitHub token schema validation
const githubTokenSchema = z.object({
    accessToken: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        // Get current session and ensure user is authenticated
        const session = await getSession();
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Parse and validate the request body
        const body = await req.json();
        const validation = githubTokenSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "GitHub access token is required" },
                { status: 400 }
            );
        }

        const { accessToken } = validation.data;
        const userId = session.user.id;

        // Get GitHub user info
        const octokit = getOctokitClient(accessToken);
        const { data: githubUser } = await octokit.rest.users.getAuthenticated();

        if (!githubUser || !githubUser.id) {
            return NextResponse.json(
                { error: "Failed to fetch GitHub user data" },
                { status: 400 }
            );
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

        return NextResponse.json({
            message: "GitHub account linked successfully",
            githubUsername: githubUser.login
        });
    } catch (error: any) {
        console.error("GitHub account linking error:", error);
        return NextResponse.json(
            { error: "Failed to link GitHub account", details: error.message },
            { status: 500 }
        );
    }
}
