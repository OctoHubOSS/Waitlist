import { NextRequest, NextResponse } from 'next/server';
import { ApiMiddleware } from '../middleware';
import { tokenService, TokenWithOwner } from '@/lib/auth/token-service';
import { errors } from '../responses';

export interface TokenAuthOptions {
    /**
     * Required scopes for this route
     * If an array is provided, the token must have ALL the specified scopes
     */
    scopes?: string | string[];

    /**
     * Optional alternative scopes (any of these will work)
     * If provided, the token must have either all the scopes from `scopes`
     * OR all the scopes from any of these alternative scope sets
     */
    altScopes?: string[][];

    /**
     * Whether to add token info to context
     * Defaults to true
     */
    addToContext?: boolean;
}

/**
 * Middleware for token-based authentication
 */
export function withTokenAuth(options: TokenAuthOptions = {}): ApiMiddleware {
    const {
        scopes = [],
        altScopes = [],
        addToContext = true
    } = options;

    // Convert single scope to array for consistency
    const requiredScopes = Array.isArray(scopes) ? scopes : [scopes].filter(Boolean);

    return (handler) => async (context) => {
        const { req } = context;
        const result = await tokenService.validateRequest(req);

        if (!result.valid || !result.token) {
            return errors.unauthorized('Invalid API token');
        }

        // Check required scopes if any are specified
        if (requiredScopes.length > 0) {
            const hasPermission = tokenService.checkAllScopes(result.token, requiredScopes);
            
            // If main scopes check fails, try alternative scope sets if provided
            if (!hasPermission && altScopes.length > 0) {
                let hasAltPermission = false;
                
                for (const altScopeSet of altScopes) {
                    if (tokenService.checkAllScopes(result.token, altScopeSet)) {
                        hasAltPermission = true;
                        break;
                    }
                }
                
                if (!hasAltPermission) {
                    return errors.forbidden('Insufficient permissions for this operation');
                }
            } else if (!hasPermission) {
                return errors.forbidden('Insufficient permissions for this operation');
            }
        }

        // Record token usage (will be updated with actual response status later)
        try {
            await tokenService.recordTokenUsage(
                result.token.id,
                req.nextUrl.pathname,
                req.method,
                200,
                req.headers.get('x-forwarded-for') || req.ip,
                req.headers.get('user-agent')
            );
        } catch (error) {
            console.error('Failed to record token usage:', error);
        }

        // Add token to context if requested
        if (addToContext) {
            context.data = {
                ...context.data,
                token: {
                    token: result.token,
                    service: tokenService
                }
            };
        }

        // Process the request
        const response = await handler(context);

        // Update token usage with actual status code if it's a successful response
        try {
            if (response instanceof NextResponse && response.status) {
                await tokenService.recordTokenUsage(
                    result.token.id,
                    req.nextUrl.pathname,
                    req.method,
                    response.status,
                    req.headers.get('x-forwarded-for') || req.ip,
                    req.headers.get('user-agent')
                );
            }
        } catch (error) {
            console.error('Failed to update token usage:', error);
        }

        return response;
    };
}
