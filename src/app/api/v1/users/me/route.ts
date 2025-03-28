import { NextRequest } from 'next/server';
import { withApiHandler } from '@/lib/api/middleware';
import { withAuth } from '@/lib/api/middlewares/auth';
import { successResponse, handleApiError } from '@/lib/api/responses';
import prisma from '@/lib/database';

/**
 * GET /api/v1/users/me
 * Get the current user's profile
 */
export const GET = withApiHandler(
  withAuth({ allowToken: true, tokenScopes: 'user:read' }),
  async ({ data }) => {
    try {
      // Get user ID from context
      let userId: string;
      
      if (data.auth.type === 'session') {
        userId = data.auth.session.user.id;
      } else { // token auth
        // For tokens linked to a user, use that user
        userId = data.auth.token.userId || '';
        
        // If token is org-owned, check if user has access permissions
        if (!userId && data.auth.token.orgId) {
          return successResponse({
            message: 'This token is organization-owned and cannot access user data'
          }, 'Unauthorized');
        }
        
        if (!userId) {
          return successResponse({
            message: 'This token is not associated with a user'
          }, 'Unauthorized');
        }
      }
      
      // Get user profile data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          displayName: true,
          bio: true,
          website: true,
          location: true,
          githubUsername: true,
          status: true,
          lastActiveAt: true,
          createdAt: true,
        }
      });
      
      if (!user) {
        return successResponse(null, 'User not found');
      }
      
      return successResponse(user, 'User profile retrieved successfully');
    } catch (error) {
      return handleApiError(error);
    }
  }
);
