import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { errors } from "@/lib/api/responses";
import { z } from 'zod';
import { withApiHandler } from '@/lib/api/middleware';
import { withAuth } from '@/lib/api/middlewares/auth';
import { validateBody, schemas } from '@/lib/api/validation';
import { successResponse, handleApiError } from '@/lib/api/responses';
import { tokenService } from '@/lib/auth/token-service';
import { DEFAULT_TOKEN_EXPIRATION } from '@/lib/auth/token-constants';
import { TokenType } from '@prisma/client';

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

/**
 * POST /api/v1/tokens
 * Create a new API token for the current user
 */
export const POST = withApiHandler(
  withAuth(), // Only session auth for token creation
  async ({ req, data }) => {
    try {
      const userId = data.auth.session.user.id;
      
      // Define token creation schema
      const createTokenSchema = z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(1000).optional(),
        type: z.enum(['BASIC', 'ADVANCED']),
        scopes: z.array(z.string()),
        expiresIn: z.number().min(1).max(365).optional().default(DEFAULT_TOKEN_EXPIRATION),
        rateLimit: z.number().min(1).optional(),
        allowedIps: z.array(z.string()).optional(),
        allowedReferrers: z.array(z.string()).optional()
      });
      
      // Validate request body
      const validation = await validateBody(req, createTokenSchema);
      
      if (!validation.success) {
        return errors.badRequest(
          'Invalid token data',
          validation.error?.details
        );
      }
      
      const { name, description, type, scopes, expiresIn, rateLimit, allowedIps, allowedReferrers } = validation.data;
      
      // Create token
      const token = await tokenService.createToken({
        name,
        description,
        type: type as TokenType,
        scopes,
        expiresIn,
        rateLimit,
        allowedIps,
        allowedReferrers,
        userId
      });
      
      return successResponse(
        {
          id: token.id,
          token: token.token,
          name,
          description,
          type,
          scopes,
          expiresIn
        },
        'API token created successfully',
        undefined,
        201
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);

/**
 * GET /api/v1/tokens
 * List all tokens for the current user
 */
export const GET = withApiHandler(
  withAuth(),
  async ({ data }) => {
    try {
      const userId = data.auth.session.user.id;
      
      // Get tokens (excluding the hashed token value for security)
      const tokens = await tokenService.getUserTokens(userId);
      
      // Map to response format, excluding sensitive data
      const tokenResponses = tokens.map(token => ({
        id: token.id,
        name: token.name,
        description: token.description,
        type: token.type,
        scopes: token.scopes,
        expiresAt: token.expiresAt,
        lastUsedAt: token.lastUsedAt,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
        allowedIps: token.allowedIps,
        allowedReferrers: token.allowedReferrers,
        rateLimit: token.rateLimit,
        rateLimitUsed: token.rateLimitUsed,
        isExpired: token.expiresAt ? new Date(token.expiresAt) < new Date() : false
      }));
      
      return successResponse(
        tokenResponses,
        'API tokens retrieved successfully'
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);
