/**
 * Available scopes for API tokens
 * These define the permissions that a token has within the system
 */
export const API_SCOPES = {
    READ: {
        // User-related scopes
        USER: 'user:read',
        USER_EMAIL: 'user:email:read',
        USER_PROFILE: 'user:profile:read',

        // Repository scopes
        REPO: 'repo:read',
        REPO_CODE: 'repo:code:read',
        REPO_ISSUES: 'repo:issues:read',
        REPO_PRs: 'repo:prs:read',
        REPO_RELEASES: 'repo:releases:read',
        REPO_WIKI: 'repo:wiki:read',
        REPO_WEBHOOKS: 'repo:webhooks:read',

        // Organization scopes
        ORG: 'org:read',
        ORG_MEMBERS: 'org:members:read',
        ORG_TEAMS: 'org:teams:read',

        // Team scopes
        TEAM: 'team:read',
        
        // Package scopes
        PACKAGE: 'package:read',
        
        // Analytics scopes
        ANALYTICS: 'analytics:read',
        
        // Search scopes
        SEARCH: 'search:read',
    },
    
    WRITE: {
        // User-related scopes
        USER: 'user:write',
        USER_PROFILE: 'user:profile:write',
        
        // Repository scopes
        REPO: 'repo:write',
        REPO_CODE: 'repo:code:write',
        REPO_ISSUES: 'repo:issues:write',
        REPO_PRs: 'repo:prs:write',
        REPO_RELEASES: 'repo:releases:write',
        REPO_WIKI: 'repo:wiki:write',
        REPO_WEBHOOKS: 'repo:webhooks:write',
        
        // Organization scopes
        ORG: 'org:write',
        ORG_MEMBERS: 'org:members:write',
        ORG_TEAMS: 'org:teams:write',
        
        // Team scopes
        TEAM: 'team:write',
        
        // Package scopes
        PACKAGE: 'package:write',
    },
    
    ADMIN: {
        // User admin scopes
        USER: 'user:admin',
        
        // Repository admin scopes
        REPO: 'repo:admin',
        
        // Organization admin scopes
        ORG: 'org:admin',
        
        // Team admin scopes
        TEAM: 'team:admin',
    }
};

// Type for all possible API scopes
export type ApiScope = 
    | typeof API_SCOPES.READ[keyof typeof API_SCOPES.READ] 
    | typeof API_SCOPES.WRITE[keyof typeof API_SCOPES.WRITE]
    | typeof API_SCOPES.ADMIN[keyof typeof API_SCOPES.ADMIN];

/**
 * Check if a token with the given scopes has access to the required scope
 * This takes into account the hierarchy of scopes (admin:* > write:* > read:*)
 */
export function hasScope(tokenScopes: string[], requiredScope: string): boolean {
    // Direct match
    if (tokenScopes.includes(requiredScope)) {
        return true;
    }
    
    // Check if token has admin access (which implies write and read)
    const [resource, permission, subresource] = requiredScope.split(':');
    
    if (tokenScopes.includes(`${resource}:admin`)) {
        return true;
    }
    
    // If checking for read, having write also grants access
    if (permission === 'read' && tokenScopes.includes(`${resource}:write`)) {
        return true;
    }
    
    // Check for granular permissions with subresources
    if (subresource) {
        // If token has full access to resource, it has access to all subresources
        if (tokenScopes.includes(`${resource}:${permission}`)) {
            return true;
        }
        
        // Check admin at subresource level
        if (tokenScopes.includes(`${resource}:admin`)) {
            return true;
        }
        
        // Check write access for read requests at subresource level
        if (permission === 'read' && tokenScopes.includes(`${resource}:${subresource}:write`)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Get a list of available scopes for a specific token type
 */
export function getAvailableScopesForType(type: 'basic' | 'advanced'): ApiScope[] {
    if (type === 'basic') {
        // Basic tokens only get read scopes
        return Object.values(API_SCOPES.READ);
    } else {
        // Advanced tokens get all scopes
        return [
            ...Object.values(API_SCOPES.READ),
            ...Object.values(API_SCOPES.WRITE),
            ...Object.values(API_SCOPES.ADMIN)
        ];
    }
}
