import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { errors } from '@/lib/api/responses';
import { ApiMiddleware } from '../middleware';

export type AuthConfig = {
    required?: boolean;  // Whether authentication is required (default: false)
    allowAnonymous?: boolean;  // Whether to allow anonymous access (default: true)
    scope?: string;  // Required scope for the endpoint (optional)
};

const defaultConfig: AuthConfig = {
    required: false,
    allowAnonymous: true
};

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
export const withAuth = createAuthMiddleware({ required: true });
export const withOptionalAuth = createAuthMiddleware();
export const withAnonymousOnly = createAuthMiddleware({ allowAnonymous: true, required: false }); 