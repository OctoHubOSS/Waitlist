import { withApiHandler } from '@/lib/api/middleware';
import { withAuth } from '@/lib/api/middlewares/auth';
import { successResponse, handleApiError } from '@/lib/api/responses';

/**
 * GET /api/v1/auth/test
 * Test endpoint that works with both session and token auth
 */
export const GET = withApiHandler(
  withAuth({ allowToken: true, tokenScopes: 'user:read' }),
  async ({ data }) => {
    try {
      // Determine auth type and return appropriate response
      if (data.auth.type === 'session') {
        return successResponse({
          authType: 'session',
          userId: data.auth.session.user.id,
          userEmail: data.auth.session.user.email
        }, 'Authentication successful via session');
      } else {
        return successResponse({
          authType: 'token',
          tokenId: data.auth.token.id,
          tokenName: data.auth.token.name,
          scopes: data.auth.token.scopes,
          userId: data.auth.token.userId || null,
          orgId: data.auth.token.orgId || null
        }, 'Authentication successful via API token');
      }
    } catch (error) {
      return handleApiError(error);
    }
  }
);
