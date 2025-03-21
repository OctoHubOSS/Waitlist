import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Standard API response format
 */
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
  meta?: Record<string, any>;
}

/**
 * Create a success response
 */
export function successResponse<T = any>(
  data?: T,
  message: string = 'Success',
  meta?: Record<string, any>,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Error response utilities
 */
export const errors = {
  badRequest: (message: string = 'Bad request', details?: any) => {
    const response: ApiResponse = {
      success: false,
      message,
      error: details ? { details } : undefined
    };
    return NextResponse.json(response, { status: 400 });
  },
  
  unauthorized: (message: string = 'Unauthorized') => {
    const response: ApiResponse = {
      success: false,
      message
    };
    return NextResponse.json(response, { status: 401 });
  },
  
  forbidden: (message: string = 'Forbidden') => {
    const response: ApiResponse = {
      success: false,
      message
    };
    return NextResponse.json(response, { status: 403 });
  },
  
  notFound: (message: string = 'Resource not found') => {
    const response: ApiResponse = {
      success: false,
      message
    };
    return NextResponse.json(response, { status: 404 });
  },
  
  conflict: (message: string = 'Resource already exists') => {
    const response: ApiResponse = {
      success: false,
      message
    };
    return NextResponse.json(response, { status: 409 });
  },
  
  tooManyRequests: (message: string = 'Rate limit exceeded', resetTime?: Date) => {
    const headers: HeadersInit = {};
    if (resetTime) {
      headers['Retry-After'] = Math.ceil((resetTime.getTime() - Date.now()) / 1000).toString();
      headers['X-RateLimit-Reset'] = Math.floor(resetTime.getTime() / 1000).toString();
    }
    
    const response: ApiResponse = {
      success: false,
      message
    };
    
    return NextResponse.json(response, { 
      status: 429,
      headers
    });
  },
  
  internal: (message: string = 'Internal server error', details?: any) => {
    console.error('API internal error:', message, details);
    
    const response: ApiResponse = {
      success: false,
      message,
      // Only include error details in development
      error: process.env.NODE_ENV === 'development' ? { details } : undefined
    };
    
    return NextResponse.json(response, { status: 500 });
  }
};

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any): NextResponse {
  console.error('API error:', error);
  
  // Handle prisma errors
  if (error.code && error.code.startsWith('P')) {
    // Prisma unique constraint violation
    if (error.code === 'P2002') {
      return errors.conflict(`Unique constraint violation: ${error.meta?.target || 'Unknown field'}`);
    }
    
    // Prisma record not found
    if (error.code === 'P2025') {
      return errors.notFound(error.message);
    }
  }
  
  // Handle validation errors
  if (error.name === 'ValidationError' || error.name === 'ZodError') {
    return errors.badRequest('Validation error', error.errors || error.issues);
  }
  
  // Handle known error types
  if (error.statusCode === 400) return errors.badRequest(error.message, error.details);
  if (error.statusCode === 401) return errors.unauthorized(error.message);
  if (error.statusCode === 403) return errors.forbidden(error.message);
  if (error.statusCode === 404) return errors.notFound(error.message);
  if (error.statusCode === 409) return errors.conflict(error.message);
  if (error.statusCode === 429) return errors.tooManyRequests(error.message, error.resetTime);
  
  // Default to internal server error
  return errors.internal(error.message || 'An unexpected error occurred');
}