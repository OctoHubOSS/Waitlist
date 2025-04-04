import { ApiMiddleware, ApiRequest, ApiResponse } from '@/types/apiClient';
import { ERROR_CODES, ERROR_MESSAGES } from '../constants';
import { SessionService } from '@/lib/auth/session';

/**
 * Middleware to require authentication
 */
export function requireAuth(options: {
    redirectUrl?: string;
    errorMessage?: string;
} = {}): ApiMiddleware {
    const {
        redirectUrl,
        errorMessage = ERROR_MESSAGES.UNAUTHORIZED
    } = options;

    return async (req: ApiRequest, res: ApiResponse, next: () => Promise<void>) => {
        try {
            const authHeader = req.headers instanceof Headers
                ? req.headers.get('authorization')
                : (req.headers as Record<string, string>)['authorization'];

            const sessionToken = authHeader?.split(' ')[1];

            if (!sessionToken) {
                throw new Error('No session token provided');
            }

            const session = await SessionService.getSession(sessionToken);

            if (!session?.user) {
                res.success = false;
                res.error = {
                    name: 'AuthenticationError',
                    code: ERROR_CODES.UNAUTHORIZED,
                    message: errorMessage,
                    statusCode: 401
                };

                if (redirectUrl) {
                    res.headers = {
                        ...res.headers,
                        'Location': redirectUrl
                    };
                }

                return;
            }

            // Add user to request
            req.user = {
                id: session.user.id,
                email: session.user.email,
                role: session.user.role
            };

            await next();
        } catch (error) {
            res.success = false;
            res.error = {
                name: 'AuthenticationError',
                code: ERROR_CODES.UNAUTHORIZED,
                message: errorMessage,
                statusCode: 401
            };
        }
    };
} 