/**
 * API timeouts in milliseconds
 */
export const TIMEOUTS = {
    QUICK: 5000, // 5 seconds
    DEFAULT: 10000, // 10 seconds
    SLOW: 30000, // 30 seconds
    VERY_SLOW: 60000, // 1 minute
} as const;

/**
 * Retry settings
 */
export const RETRY_SETTINGS = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
    MAX_RETRY_DELAY: 5000, // 5 seconds
} as const;

/**
 * Rate limit settings
 */
export const RATE_LIMIT = {
    DEFAULT_LIMIT: 100,
    DEFAULT_WINDOW: 60 * 1000, // 1 minute
    MAX_LIMIT: 1000,
    MAX_WINDOW: 60 * 60 * 1000, // 1 hour
} as const;

/**
 * Cache settings
 */
export const CACHE = {
    DEFAULT_TTL: 60 * 1000, // 1 minute
    MAX_TTL: 24 * 60 * 60 * 1000, // 1 day
    DEFAULT_KEY_PREFIX: 'api:',
} as const;

/**
 * Authentication settings
 */
export const AUTH = {
    TOKEN_HEADER: 'Authorization',
    TOKEN_PREFIX: 'Bearer ',
    SESSION_COOKIE: 'session',
    SESSION_MAX_AGE: 30 * 24 * 60 * 60, // 30 days
} as const;

/**
 * API version settings
 */
export const API_VERSION = {
    CURRENT: 'v1',
    SUPPORTED: ['v1'],
    DEFAULT: 'v1',
} as const;

/**
 * API endpoint settings
 */
export const ENDPOINTS = {
    BASE: '/api',
    VERSION: '/v1',
    AUTH: '/auth',
    WAITLIST: '/waitlist',
    DASHBOARD: '/dashboard',
    BUG_REPORTS: '/bug-reports',
} as const;

/**
 * API response settings
 */
export const RESPONSE = {
    DEFAULT_STATUS: 200,
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
} as const; 