/**
 * API route base classes and utilities
 */

// Export the base API route class
export * from './base';

// Export specialized route base classes
export * from './auth/base';
export * from './waitlist/base';
export * from './dashboard/base';
export * from './bug-reports/base';

// Export specific route implementations
export * from './waitlist';
export * from './auth';
export * from './dashboard';
export * from './bug-reports';
