import { NextRequest } from 'next/server';
import { tokenService } from './token-service';

/**
 * Utility for validating tokens in API routes
 */
export class TokenValidator {
  /**
   * Validate a token from a request
   * 
   * @param req The Next.js request
   * @param requiredScopes Optional scopes the token must have
   * @returns Validation result
   */
  static async validateRequest(req: NextRequest, requiredScopes?: string[]) {
    const result = await tokenService.validateRequest(req);
    
    if (!result.valid || !result.token) {
      return { 
        valid: false, 
        error: result.error || 'Invalid token',
        token: null 
      };
    }
    
    // Check scopes if provided
    if (requiredScopes && requiredScopes.length > 0) {
      const hasAllScopes = tokenService.checkAllScopes(result.token, requiredScopes);
      
      if (!hasAllScopes) {
        return {
          valid: false,
          error: 'Insufficient permissions',
          token: result.token,
          missingScopes: requiredScopes.filter(
            scope => !tokenService.checkPermission(result.token!, scope)
          )
        };
      }
    }
    
    return {
      valid: true,
      token: result.token
    };
  }
  
  /**
   * Check if a request has a valid token with required scopes
   * 
   * @param req The Next.js request
   * @param requiredScopes Optional scopes the token must have
   * @returns True if token is valid and has all required scopes
   */
  static async hasValidToken(req: NextRequest, requiredScopes?: string[]) {
    const result = await this.validateRequest(req, requiredScopes);
    return result.valid;
  }
  
  /**
   * Extract user ID from a token request
   * 
   * @param req The Next.js request
   * @returns User ID if present, null otherwise
   */
  static async getUserId(req: NextRequest) {
    const result = await tokenService.validateRequest(req);
    return result.valid && result.token?.userId ? result.token.userId : null;
  }
  
  /**
   * Extract organization ID from a token request
   * 
   * @param req The Next.js request
   * @returns Organization ID if present, null otherwise
   */
  static async getOrgId(req: NextRequest) {
    const result = await tokenService.validateRequest(req);
    return result.valid && result.token?.orgId ? result.token.orgId : null;
  }
}
