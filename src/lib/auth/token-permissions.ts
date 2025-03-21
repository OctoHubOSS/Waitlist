import { TokenWithOwner } from './token-service';
import { SCOPE_SETS } from './token-constants';

/**
 * Utility functions for checking token permissions in components 
 */

/**
 * Check if a token has a specific permission
 */
export function hasTokenPermission(token: TokenWithOwner, requiredScope: string): boolean {
  // Check if token is valid
  if (!token || token.deletedAt || (token.expiresAt && new Date(token.expiresAt) < new Date())) {
    return false;
  }
  
  const scopes = token.scopes as string[];
  
  // Check for direct match
  if (scopes.includes(requiredScope)) {
    return true;
  }
  
  // Check for admin permission
  const resourceType = requiredScope.split(':')[0];
  if (scopes.includes(`${resourceType}:admin`)) {
    return true;
  }
  
  // Check if it's a read permission and token has write permission
  if (requiredScope.endsWith(':read') && scopes.includes(`${resourceType}:write`)) {
    return true;
  }
  
  return false;
}

/**
 * Check if a token has all specified permissions
 */
export function hasAllTokenPermissions(token: TokenWithOwner, requiredScopes: string[]): boolean {
  return requiredScopes.every(scope => hasTokenPermission(token, scope));
}

/**
 * Check if a token has any of the specified permissions
 */
export function hasAnyTokenPermission(token: TokenWithOwner, requiredScopes: string[]): boolean {
  return requiredScopes.some(scope => hasTokenPermission(token, scope));
}

/**
 * Check if a token has a predefined scope set
 */
export function hasTokenScopeSet(token: TokenWithOwner, scopeSetKey: keyof typeof SCOPE_SETS): boolean {
  return hasAllTokenPermissions(token, SCOPE_SETS[scopeSetKey]);
}

/**
 * Get a list of missing permissions from a required set
 */
export function getMissingPermissions(token: TokenWithOwner, requiredScopes: string[]): string[] {
  return requiredScopes.filter(scope => !hasTokenPermission(token, scope));
}

/**
 * Get a human-readable description of a scope
 */
export function getScopeDescription(scope: string): string {
  const [resource, action] = scope.split(':');
  
  const resourceLabels: Record<string, string> = {
    'user': 'User accounts',
    'repo': 'Repositories',
    'org': 'Organizations',
    'team': 'Teams',
    'package': 'Packages',
    'analytics': 'Analytics',
    'search': 'Search'
  };
  
  const actionLabels: Record<string, string> = {
    'read': 'Read access to',
    'write': 'Read and write access to',
    'admin': 'Full administrative access to',
    'email': 'Email addresses for',
    'profile': 'Profile information for',
    'code': 'Code in',
    'issues': 'Issues in',
    'prs': 'Pull requests in',
    'releases': 'Releases in',
    'wiki': 'Wiki in',
    'webhooks': 'Webhooks for',
    'members': 'Members of',
    'teams': 'Teams in'
  };
  
  const resourceLabel = resourceLabels[resource] || resource;
  const actionLabel = actionLabels[action] || action;
  
  return `${actionLabel} ${resourceLabel}`;
}
