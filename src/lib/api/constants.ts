/**
 * API HTTP methods
 */
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
    OPTIONS: 'OPTIONS',
    HEAD: 'HEAD',
} as const;

/**
 * API response status codes
 */
export const STATUS_CODES = {
    // Success responses
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    
    // Redirection responses
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NOT_MODIFIED: 304,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,
    
    // Client error responses
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    CONFLICT: 409,
    GONE: 410,
    UNSUPPORTED_MEDIA_TYPE: 415,
    TOO_MANY_REQUESTS: 429,
    
    // Server error responses
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
} as const;

/**
 * API error codes
 */
export const ERROR_CODES = {
    // Validation errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_PARAMETERS: 'INVALID_PARAMETERS',
    MISSING_PARAMETERS: 'MISSING_PARAMETERS',
    
    // Authentication errors
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    SESSION_EXPIRED: 'SESSION_EXPIRED',
    
    // Resource errors
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    RESOURCE_EXISTS: 'RESOURCE_EXISTS',
    RESOURCE_GONE: 'RESOURCE_GONE',
    
    // Rate limiting errors
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    
    // Server errors
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    
    // Client errors
    REQUEST_FAILED: 'REQUEST_FAILED',
    REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
    NETWORK_ERROR: 'NETWORK_ERROR',
    INVALID_RESPONSE: 'INVALID_RESPONSE',
    RESPONSE_PROCESSING_ERROR: 'RESPONSE_PROCESSING_ERROR',
} as const;

/**
 * API error messages
 */
export const ERROR_MESSAGES = {
    // Validation errors
    VALIDATION_ERROR: 'Validation failed',
    INVALID_PARAMETERS: 'Invalid parameters provided',
    MISSING_PARAMETERS: 'Required parameters missing',
    
    // Authentication errors
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    INVALID_CREDENTIALS: 'Invalid credentials',
    TOKEN_EXPIRED: 'Authentication token expired',
    TOKEN_INVALID: 'Invalid authentication token',
    SESSION_EXPIRED: 'Your session has expired',
    
    // Resource errors
    NOT_FOUND: 'Resource not found',
    CONFLICT: 'Resource conflict',
    RESOURCE_EXISTS: 'Resource already exists',
    RESOURCE_GONE: 'Resource no longer available',
    
    // Rate limiting errors
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
    
    // Server errors
    INTERNAL_SERVER_ERROR: 'Internal server error',
    SERVICE_UNAVAILABLE: 'Service unavailable',
    DATABASE_ERROR: 'Database error occurred',
    EXTERNAL_SERVICE_ERROR: 'External service error',
    
    // Client errors
    REQUEST_FAILED: 'Request failed',
    REQUEST_TIMEOUT: 'Request timed out',
    NETWORK_ERROR: 'Network error',
    INVALID_RESPONSE: 'Invalid response received',
    RESPONSE_PROCESSING_ERROR: 'Error processing response',
} as const;

/**
 * API headers
 */
export const HEADERS = {
    // Standard headers
    CONTENT_TYPE: 'Content-Type',
    AUTHORIZATION: 'Authorization',
    ACCEPT: 'Accept',
    USER_AGENT: 'User-Agent',
    ORIGIN: 'Origin',
    REFERER: 'Referer',
    
    // Custom headers
    X_REQUEST_ID: 'X-Request-ID',
    X_CORRELATION_ID: 'X-Correlation-ID',
    X_API_KEY: 'X-API-Key',
    X_USER_EMAIL: 'X-User-Email',
    X_USER_ID: 'X-User-ID',
} as const;

/**
 * API content types
 */
export const CONTENT_TYPES = {
    JSON: 'application/json',
    FORM_DATA: 'multipart/form-data',
    URL_ENCODED: 'application/x-www-form-urlencoded',
    TEXT: 'text/plain',
    HTML: 'text/html',
    XML: 'application/xml',
    CSV: 'text/csv',
    PDF: 'application/pdf',
    BINARY: 'application/octet-stream',
} as const;

/**
 * API rate limits
 */
export const RATE_LIMITS = {
    DEFAULT: 100, // requests per minute
    AUTH: 5, // requests per minute
    UPLOAD: 10, // requests per minute
} as const;

/**
 * API timeouts (in milliseconds)
 */
export const TIMEOUTS = {
    DEFAULT: 30000, // 30 seconds
    UPLOAD: 60000, // 60 seconds
    DOWNLOAD: 120000, // 120 seconds
    AUTH: 10000, // 10 seconds
    QUICK: 5000, // 5 seconds
} as const;

/**
 * API retry settings
 */
export const RETRY_SETTINGS = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
    MAX_RETRY_DELAY: 5000, // 5 seconds
    RETRY_CODES: [408, 429, 500, 502, 503, 504], // HTTP status codes to retry on
} as const;

/**
 * API pagination settings
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

/**
 * API caching settings (in milliseconds)
 */
export const CACHE_SETTINGS = {
    DEFAULT_TTL: 300000, // 5 minutes
    SHORT_TTL: 60000, // 1 minute
    LONG_TTL: 3600000, // 1 hour
    SESSION_TTL: 60000, // 1 minute
} as const;