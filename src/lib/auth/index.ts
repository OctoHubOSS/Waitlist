// Export existing auth functions
export * from './token';
export * from './token-service';
export * from './token-constants';
export * from './token-permissions';
// Remove the reference to tokenCache since we're using the existing cache system
// export { tokenCache } from './token-cache';

// Re-export auth options and core functions
export { authOptions, getSession, isAuthenticated, hashPassword, verifyPassword } from '@/lib/auth';
