import { PrismaClient } from '@prisma/client';
import { AuditLogOptions, EntityTarget, AuditContext, AuditChangeSet } from '@/types/audit';

export class AuditLogClient {
    private prisma: PrismaClient;
    private context?: AuditContext;

    constructor(prisma: PrismaClient, context?: AuditContext) {
        this.prisma = prisma;
        this.context = context;
    }

    /**
     * Create a new audit log entry
     */
    async log(options: AuditLogOptions, target: EntityTarget) {
        const { action, category, message, details, metadata, actorId, actorIp, userAgent } = options;

        return this.prisma.auditLog.create({
            data: {
                action,
                category,
                message,
                details,
                metadata: this.context ? {
                    ...metadata,
                    context: JSON.parse(JSON.stringify(this.context)),
                } : metadata,
                actorId: actorId || this.context?.actorId,
                actorIp: actorIp || this.context?.actorIp,
                userAgent: userAgent || this.context?.userAgent,
                ...target,
            },
        });
    }

    /**
     * Create an audit log entry for a change in data
     */
    async logChange(
        options: Omit<AuditLogOptions, 'details'>,
        target: EntityTarget,
        changeSet: AuditChangeSet
    ) {
        return this.log(
            {
                ...options,
                details: {
                    before: changeSet.before,
                    after: changeSet.after,
                    changes: changeSet.changes,
                },
            },
            target
        );
    }

    /**
     * Create a new audit log client with additional context
     */
    withContext(context: AuditContext): AuditLogClient {
        return new AuditLogClient(this.prisma, {
            ...this.context,
            ...context,
        });
    }

    /**
     * Helper to compute changes between two objects
     */
    static computeChanges(before: Record<string, any>, after: Record<string, any>): AuditChangeSet {
        const changes = [];

        // Get all unique keys from both objects
        const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

        for (const key of keys) {
            const oldValue = before[key];
            const newValue = after[key];

            // Only record if values are different
            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changes.push({
                    field: key,
                    oldValue,
                    newValue,
                });
            }
        }

        return {
            before,
            after,
            changes,
        };
    }
} 