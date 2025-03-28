import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { errors } from '@/lib/api/responses';
import { ApiMiddleware } from '../middleware';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { tokenService } from '@/lib/auth/token-service';
import prisma from '@/lib/database';

export type AuthConfig = {
    required?: boolean;  // Whether authentication is required (default: false)
    allowAnonymous?: boolean;  // Whether to allow anonymous access (default: true)
    scope?: string;  // Required scope for the endpoint (optional)
};

const defaultConfig: AuthConfig = {
    required: false,
    allowAnonymous: true
};

export interface AuthOptions {
  /**
   * Whether to allow API token authentication
   * @default false
   */
  allowToken?: boolean;
  
  /**
   * Required scopes if using token authentication
   */
  tokenScopes?: string | string[];
  
  /**
   * Alternative scopes for token authentication
   */
  altTokenScopes?: string[][];
  
  /**
   * Whether to require admin role for session auth
   * @default false
   */
  requireAdmin?: boolean;
}

/**
 * Middleware that supports both session-based and token-based authentication
 */
export function withAuth(options: AuthOptions = {}): ApiMiddleware {
  const {
    allowToken = false,
    tokenScopes = [],
    altTokenScopes = [],
    requireAdmin = false
  } = options;

  // Convert single scope to array for consistency
  const requiredScopes = Array.isArray(tokenScopes) ? tokenScopes : [tokenScopes].filter(Boolean);

  return (handler) => async (context) => {
    const { req } = context;
    const authHeader = req.headers.get('authorization');
    
    // Check for token authentication first if allowed
    if (allowToken && authHeader?.startsWith('Bearer ')) {
      const tokenResult = await tokenService.validateRequest(req);
      
      if (tokenResult.valid && tokenResult.token) {
        // Check token permissions if scopes are specified
        if (requiredScopes.length > 0) {
          const hasPermission = tokenService.checkAllScopes(tokenResult.token, requiredScopes);
          
          // Try alternative scopes if main scopes check fails
          if (!hasPermission && altTokenScopes.length > 0) {
            let hasAltPermission = false;
            
            for (const altScopeSet of altTokenScopes) {
              if (tokenService.checkAllScopes(tokenResult.token, altScopeSet)) {
                hasAltPermission = true;
                break;
              }
            }
            
            if (!hasAltPermission) {
              return errors.forbidden('Insufficient token permissions');
            }
          } else if (!hasPermission) {
            return errors.forbidden('Insufficient token permissions');
          }
        }
        
        // Record token usage
        await tokenService.recordTokenUsage(
          tokenResult.token.id,
          req.nextUrl.pathname,
          req.method,
          200,
          req.headers.get('x-forwarded-for') || req.ip,
          req.headers.get('user-agent')
        ).catch(err => {
          console.error('Failed to record token usage:', err);
        });
        
        // Add token to context
        context.data = {
          ...context.data,
          auth: {
            type: 'token',
            token: tokenResult.token,
            service: tokenService
          }
        };
        
        // Process request with token auth
        const response = await handler(context);
        
        // Update token usage with actual status code
        if (response instanceof NextResponse && response.status) {
          tokenService.recordTokenUsage(
            tokenResult.token.id,
            req.nextUrl.pathname,
            req.method,
            response.status,
            req.headers.get('x-forwarded-for') || req.ip,
            req.headers.get('user-agent')
          ).catch(err => {
            console.error('Failed to update token usage:', err);
          });
        }
        
        return response;
      }
      
      // If token auth failed but was attempted, return unauthorized
      if (authHeader) {
        return errors.unauthorized('Invalid API token');
      }
    }
    
    // Fall back to session authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return errors.unauthorized('You must be logged in to access this resource');
    }
    
    // Check admin role if required
    if (requireAdmin && !session.user.isAdmin) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      });
      
      if (user?.role !== 'ADMIN') {
        return errors.forbidden('Admin access required');
      }
    }
    
    // Add session to context
    context.data = {
      ...context.data,
      auth: {
        type: 'session',
        session
      }
    };
    
    // Process request with session auth
    return handler(context);
  };
}

/**
 * Creates a middleware that handles authentication with flexible configuration
 * 
 * @param config Authentication configuration
 * @returns Middleware that handles authentication based on the config
 */
export function createAuthMiddleware(config: AuthConfig = {}): ApiMiddleware {
    const finalConfig = { ...defaultConfig, ...config };

    return (handler) => async (context) => {
        // Try to get the session
        const session = await getServerSession(authOptions);

        // Handle authentication requirements
        if (finalConfig.required && !session?.user) {
            return errors.unauthorized('Authentication required for this endpoint');
        }

        // Handle anonymous access
        if (!finalConfig.allowAnonymous && !session?.user) {
            return errors.unauthorized('Anonymous access not allowed');
        }

        // Handle scope requirements
        if (finalConfig.scope && session?.user) {
            const userScopes = (session.user as any).scopes || [];
            if (!userScopes.includes(finalConfig.scope)) {
                return errors.forbidden(`Required scope: ${finalConfig.scope}`);
            }
        }

        // Add auth info to context
        context.data = {
            ...context.data,
            auth: {
                authenticated: !!session?.user,
                session,
                // Add any other useful auth info here
                scopes: (session?.user as any)?.scopes || []
            }
        };

        return handler(context);
    };
}

// Common auth middleware configurations
export const withOptionalAuth = createAuthMiddleware();
export const withAnonymousOnly = createAuthMiddleware({ allowAnonymous: true, required: false });