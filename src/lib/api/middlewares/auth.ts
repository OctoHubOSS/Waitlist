import { getAuthSession } from '@/lib/auth';
import { errors } from '@/lib/api/responses';
import { ApiMiddleware, ApiHandler, ApiContext } from '../middleware';
import { NextResponse } from 'next/server';
import { tokenService } from '@/lib/auth/token-service';

export type AuthConfig = {
  required?: boolean;  // Whether authentication is required (default: false)
  allowAnonymous?: boolean;  // Whether to allow anonymous access (default: true)
  scope?: string;  // Required scope for the endpoint (optional)
  allowToken?: boolean;  // Whether to allow API token authentication (default: true)
  requireAdmin?: boolean;  // Whether to require admin role (default: false)
};

const defaultConfig: AuthConfig = {
  required: false,
  allowAnonymous: true,
  allowToken: true
};

/**
 * Middleware that supports both session-based and token-based authentication
 */
export const withAuth = (config: AuthConfig = {}): ApiMiddleware => {
  const finalConfig = { ...defaultConfig, ...config };

  return (handler: ApiHandler): ApiHandler => {
    return async (context: ApiContext) => {
      try {
        // Try to get the session first
        const session = await getAuthSession();

        // Handle authentication requirements
        if (finalConfig.required && !session?.user) {
          // If session auth failed and token auth is allowed, try token
          if (finalConfig.allowToken) {
            const tokenResult = await tokenService.validateRequest(context.req);
            if (!tokenResult.valid || !tokenResult.token) {
              return errors.unauthorized('Authentication required for this endpoint');
            }

            // Handle scope requirements for token
            if (finalConfig.scope && tokenResult.token) {
              if (!tokenService.checkPermission(tokenResult.token, finalConfig.scope)) {
                return errors.forbidden(`Required scope: ${finalConfig.scope}`);
              }
            }

            // Add token to context
            context.data = {
              ...context.data,
              auth: {
                type: 'token',
                token: tokenResult.token,
                userId: tokenResult.token.userId,
                orgId: tokenResult.token.orgId,
                scopes: tokenResult.token.scopes,
              },
            };
          } else {
            return errors.unauthorized('Authentication required for this endpoint');
          }
        } else if (session?.user) {
          // Handle admin requirement for session auth
          if (finalConfig.requireAdmin && session.user.role !== 'ADMIN') {
            return errors.forbidden('Admin access required');
          }

          // Handle scope requirements for session
          if (finalConfig.scope) {
            const userScopes = (session.user as any).scopes || [];
            if (!userScopes.includes(finalConfig.scope)) {
              return errors.forbidden(`Required scope: ${finalConfig.scope}`);
            }
          }

          // Add session to context
          context.data = {
            ...context.data,
            auth: {
              type: 'session',
              session,
              userId: session.user.id,
              scopes: (session.user as any).scopes || [],
            },
          };
        }

        return handler(context);
      } catch (error) {
        console.error('Auth middleware error:', error);
        return errors.internal('Internal Server Error');
      }
    };
  };
};

// Common auth middleware configurations
export const withOptionalAuth = withAuth();
export const withAnonymousOnly = withAuth({ allowAnonymous: true, required: false });