/**
 * API route base classes and utilities
 */

// Core route handler
export { BaseApiRoute } from './base';

// Feature-specific route handlers
export { BaseWaitlistRoute } from './waitlist/base';
export { BaseDashboardRoute } from './dashboard';
export { BaseBugReportRoute } from './bug-reports';
export { BaseAuthRoute } from './auth';

// Example route
export { ExampleRoute } from './example';

// Route utilities
export { convertRequest, createResponse, handleError, logRequest } from './utils';
