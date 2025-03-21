import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { errors } from "@/lib/api/responses";

/**
 * This file serves as a convenience redirect to the user-scoped token API
 * 
 * While we prefer the RESTful hierarchical structure of `/api/base/users/[id]/tokens`
 * for API design consistency, this endpoint provides a simpler URL for UI clients
 * that just want "my tokens".
 * 
 * All actual functionality is implemented in the user-scoped API endpoints.
 */

// GET /api/base/tokens - Redirect to the user's tokens endpoint
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Keep all query parameters when redirecting
        const url = new URL(`/api/base/users/${session.user.id}/tokens${req.nextUrl.search}`, req.url);
        
        return NextResponse.redirect(url);
    } catch (error) {
        console.error("Error in tokens redirect:", error);
        return errors.internal('Failed to process request');
    }
}

// POST /api/base/tokens - Redirect to the user's token creation endpoint
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        const url = new URL(`/api/base/users/${session.user.id}/tokens/create`, req.url);
        
        return NextResponse.redirect(url, 307); // 307 preserves the POST method
    } catch (error) {
        console.error("Error in tokens creation redirect:", error);
        return errors.internal('Failed to process request');
    }
}
