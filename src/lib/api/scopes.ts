/**
 * API scope definitions and utilities
 */

/**
 * Available API scopes
 */
export const API_SCOPES = {
  // User-related scopes
  'user:read': 'Read user information',
  'user:email:read': 'Read user email',
  'user:profile:read': 'Read user profile',
  'user:write': 'Update user information',
  'user:profile:write': 'Update user profile',
  'user:admin': 'Administration of users',
  
  // Repository-related scopes
  'repo:read': 'List and view repositories',
  'repo:code:read': 'Read repository code',
  'repo:issues:read': 'Read repository issues',
  'repo:prs:read': 'Read repository pull requests',
  'repo:releases:read': 'Read repository releases',
  'repo:wiki:read': 'Read repository wiki',
  'repo:webhooks:read': 'Read repository webhooks',
  'repo:write': 'Create and update repositories',
  'repo:code:write': 'Write repository code',
  'repo:issues:write': 'Create and update issues',
  'repo:prs:write': 'Create and update pull requests',
  'repo:releases:write': 'Create and update releases',
  'repo:wiki:write': 'Create and update wiki pages',
  'repo:webhooks:write': 'Manage repository webhooks',
  'repo:admin': 'Full repository administration',
  
  // Organization-related scopes
  'org:read': 'View organization information',
  'org:members:read': 'List organization members',
  'org:teams:read': 'List organization teams',
  'org:write': 'Update organization information',
  'org:members:write': 'Manage organization members',
  'org:teams:write': 'Manage organization teams',
  'org:admin': 'Full organization administration',
  
  // Team-related scopes
  'team:read': 'View team information',
  'team:write': 'Update team information',
  'team:admin': 'Full team administration',
  
  // Other functionality
  'search:read': 'Perform searches',
  'analytics:read': 'Access analytics data',
  'package:read': 'List and view packages',
  'package:write': 'Create and update packages'
};

export type ApiScope = keyof typeof API_SCOPES;

/**
 * Check if a given set of scopes includes a required scope
 */
export function hasScope(scopes: string[], requiredScope: string): boolean {
  // Direct match
  if (scopes.includes(requiredScope)) {
    return true;
  }
  
  // Check for admin scope - which implies all permissions for that resource
  const resourceType = requiredScope.split(':')[0];
  if (scopes.includes(`${resourceType}:admin`)) {
    return true;
  }
  
  // Check for write scope includes read permissions
  if (requiredScope.endsWith(':read')) {
    const writeScope = requiredScope.replace(':read', ':write');
    if (scopes.includes(writeScope)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get all scopes assigned to a specific category
 */
export function getCategoryScopes(category: string): string[] {
  return Object.keys(API_SCOPES).filter(scope => scope.startsWith(`${category}:`));
}

/**
 * Format a scope for display
 */
export function formatScope(scope: string): string {
  return API_SCOPES[scope as ApiScope] || scope;
}

/**
 * Categorize scopes for better organization in the UI
 */
export function categorizeScopes(scopes: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {};
  
  scopes.forEach(scope => {
    const category = scope.split(':')[0];
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(scope);
  });
  
  return categories;
}
