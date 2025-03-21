/**
 * Pre-defined scope sets for common use cases
 */
export const SCOPE_SETS = {
  /**
   * Basic read-only scopes for general API access
   */
  BASIC_READ: [
    'user:read',
    'repo:read',
    'org:read',
    'search:read'
  ],

  /**
   * Full read-only access across all resources
   */
  FULL_READ: [
    'user:read',
    'user:email:read',
    'user:profile:read',
    'repo:read',
    'repo:code:read',
    'repo:issues:read',
    'repo:prs:read',
    'repo:releases:read',
    'repo:wiki:read',
    'repo:webhooks:read',
    'org:read',
    'org:members:read',
    'org:teams:read',
    'team:read',
    'package:read',
    'analytics:read',
    'search:read'
  ],

  /**
   * Full write access across all resources
   */
  FULL_WRITE: [
    'user:write',
    'user:profile:write',
    'repo:write',
    'repo:code:write',
    'repo:issues:write',
    'repo:prs:write',
    'repo:releases:write',
    'repo:wiki:write',
    'repo:webhooks:write',
    'org:write',
    'org:members:write',
    'org:teams:write',
    'team:write',
    'package:write'
  ],

  /**
   * All admin scopes
   */
  ADMIN: [
    'user:admin',
    'repo:admin',
    'org:admin',
    'team:admin'
  ],

  /**
   * Repository management scopes
   */
  REPO_MANAGEMENT: [
    'repo:read',
    'repo:write',
    'repo:webhooks:read',
    'repo:webhooks:write'
  ],

  /**
   * Issue and PR management scopes
   */
  ISSUES_PRS: [
    'repo:read',
    'repo:issues:read',
    'repo:issues:write',
    'repo:prs:read',
    'repo:prs:write'
  ],

  /**
   * Organization management scopes
   */
  ORG_MANAGEMENT: [
    'org:read',
    'org:write',
    'org:members:read',
    'org:members:write',
    'org:teams:read',
    'org:teams:write'
  ]
};

/**
 * Default token expiration in days
 */
export const DEFAULT_TOKEN_EXPIRATION = 90; // 90 days

/**
 * Default rate limits for tokens (requests per hour)
 */
export const DEFAULT_RATE_LIMITS = {
  BASIC: 1000,
  ADVANCED: 5000
};
