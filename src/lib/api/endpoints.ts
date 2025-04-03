/**
 * API endpoints for the application
 */
export const API_ENDPOINTS = {
    // Auth endpoints
    auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        verify: '/api/auth/verify',
        resendVerification: '/api/auth/resend-verification',
        validateEmail: '/api/auth/validate-email',
        forgotPassword: '/api/auth/forgot-password',
        resetPassword: '/api/auth/reset-password',
        accountLockdown: '/api/auth/account-lockdown',
        emailChange: '/api/auth/email-change',
        session: '/api/auth/session',
        csrf: '/api/auth/csrf',
        callback: (provider: string) => `/api/auth/callback/${provider}`,
        twoFactor: {
            setup: '/api/auth/2fa/setup',
            enable: '/api/auth/2fa/enable',
            verify: '/api/auth/2fa/verify',
            disable: '/api/auth/2fa/disable',
        },
    },

    // Dashboard endpoints
    dashboard: {
        main: '/api/dashboard',
        activity: '/api/dashboard/activity',
        sessions: '/api/dashboard/sessions',
        stats: '/api/dashboard/stats',
    },

    // User endpoints
    user: {
        profile: '/api/user/profile',
        image: '/api/user/image',
        settings: '/api/user/settings',
        notifications: '/api/user/notifications',
        resetPassword: '/api/user/reset-password',
        changeEmail: '/api/user/change-email',
        auditLogs: '/api/user/audit-logs',
    },

    // Account endpoints
    account: {
        profile: '/api/account/profile',
        settings: '/api/account/settings',
        security: '/api/account/security',
        sessions: '/api/account/sessions',
        auditLogs: '/api/account/audit-logs',
        deleteAccount: '/api/account/delete',
    },

    // Feature request endpoints
    featureRequests: {
        list: '/api/feature-requests',
        create: '/api/feature-requests',
        get: (id: string) => `/api/feature-requests/${id}`,
        update: (id: string) => `/api/feature-requests/${id}`,
        delete: (id: string) => `/api/feature-requests/${id}`,
        vote: (id: string) => `/api/feature-requests/${id}/vote`,
        comment: (id: string) => `/api/feature-requests/${id}/comments`,
    },

    // Survey endpoints
    surveys: {
        list: '/api/surveys',
        create: '/api/surveys',
        get: (id: string) => `/api/surveys/${id}`,
        update: (id: string) => `/api/surveys/${id}`,
        delete: (id: string) => `/api/surveys/${id}`,
        submit: (id: string) => `/api/surveys/${id}/submit`,
    },

    // Waitlist endpoints
    waitlist: {
        subscribe: '/api/waitlist/subscribe',
        status: '/api/waitlist/status',
        invite: '/api/waitlist/invite',
        list: '/api/waitlist/list',
        stats: '/api/waitlist/stats',
    },
    
    // Health check endpoint
    health: '/api/health',
} as const;

/**
 * Type for API endpoints
 */
export type ApiEndpoint = typeof API_ENDPOINTS;

/**
 * Type for auth endpoints
 */
export type AuthEndpoint = typeof API_ENDPOINTS.auth;

/**
 * Type for dashboard endpoints
 */
export type DashboardEndpoint = typeof API_ENDPOINTS.dashboard;

/**
 * Type for user endpoints
 */
export type UserEndpoint = typeof API_ENDPOINTS.user;

/**
 * Type for account endpoints
 */
export type AccountEndpoint = typeof API_ENDPOINTS.account;

/**
 * Type for feature request endpoints
 */
export type FeatureRequestEndpoint = typeof API_ENDPOINTS.featureRequests;

/**
 * Type for survey endpoints
 */
export type SurveyEndpoint = typeof API_ENDPOINTS.surveys;

/**
 * Type for waitlist endpoints
 */
export type WaitlistEndpoint = typeof API_ENDPOINTS.waitlist;

/**
 * A helper function to create API URLs
 */
export function createApiUrl(path: string, baseUrl?: string): string {
    // Use provided baseUrl or default to the environment variable
    const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || '';
    
    // Ensure baseUrl has a protocol for absolute URLs
    const normalizedBase = baseUrl ? 
        (base.startsWith('http') ? base : `http://${base}`) : '';
    
    // Normalize the API path to ensure it starts with /api
    const normalizedPath = path.startsWith('/api') ? 
        path : `/api${path.startsWith('/') ? path : `/${path}`}`;
    
    // Return either an absolute URL or a relative URL
    return normalizedBase ? 
        `${normalizedBase}${normalizedPath}` : normalizedPath;
}