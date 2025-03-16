import { AuditAction, AuditCategory } from '@prisma/client';

export interface AuditLogOptions {
    action: AuditAction;
    category: AuditCategory;
    message: string;
    details?: Record<string, any>;
    metadata?: Record<string, any>;
    actorId?: string;
    actorIp?: string;
    userAgent?: string;
}

export interface EntityTarget {
    userId?: string;
    repositoryId?: string;
    organizationId?: string;
}

export interface AuditChangeSet {
    before: Record<string, any>;
    after: Record<string, any>;
    changes: Array<{
        field: string;
        oldValue: any;
        newValue: any;
    }>;
}

export interface AuditContext {
    actorId?: string;
    actorIp?: string;
    userAgent?: string;
    source?: string;
    requestId?: string;
    sessionId?: string;
} 