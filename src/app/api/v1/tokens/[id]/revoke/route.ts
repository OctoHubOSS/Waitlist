import { NextRequest } from 'next/server';
import { withApiHandler } from '@/lib/api/middleware';
import { withAuth } from '@/lib/api/middlewares/auth';
import { successResponse, errors, handleApiError } from '@/lib/api/responses';
import { tokenService } from '@/lib/auth/token-service';
import prisma from '@/lib/database';

/**
 * POST /api/v1/tokens/:id/revoke
 * Revoke a specific API token
 */
export const POST = withApiHandler(
  withAuth(),
  async ({ params, data }) => {
    try {
      const { id } = params;
      const userId = data.auth.session.user.id;
      
      // Check if this token belongs to the user
      const token = await prisma.apiToken.findFirst({
        where: {
          id,
          userId,
          deletedAt: null
        }
      });
      
      if (!token) {
        return errors.notFound('Token not found or already revoked');
      }
      
      // Revoke the token
      const success = await tokenService.revokeToken(id, userId);
      
      if (success) {
        return successResponse(
          null,
          'API token revoked successfully'
        );
      } else {
        return errors.internal('Failed to revoke token');
      }
    } catch (error) {
      return handleApiError(error);
    }
  }
);
