import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseApiRoute } from '../../routes/base';
import prisma from '@/lib/database';
import { AuditLogger } from '@/lib/audit/logger';
import { AuditAction, AuditStatus } from '@/types/auditLogs';
import { BugStatus, Priority, Severity, ReactionType } from '@prisma/client';
import { validateRequest, rateLimit, requireAuth } from '../../middleware';
import { ApiResponse } from '@/types/apiClient';

/**
 * Base bug report route class
 * 
 * This class provides common functionality for all bug report routes:
 * - Default rate limiting
 * - Default authentication
 * - Default validation
 * - Default audit logging
 */
export class BaseBugReportRoute<T = any, R = any> extends BaseApiRoute<T, R> {
    constructor(config: {
        path?: string;
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        schema?: {
            request?: z.ZodType<T>;
            response?: z.ZodType<R>;
        };
        middleware?: any[];
        auditAction?: AuditAction;
        requireAuth?: boolean;
        rateLimit?: {
            limit?: number;
            windowMs?: number;
        };
        timeout?: number;
    } = {}) {
        super({
            ...config,
            auditAction: config.auditAction || AuditAction.CUSTOM,
            requireAuth: config.requireAuth ?? true,
            rateLimit: config.rateLimit || {
                limit: 20,
                windowMs: 60000
            }
        });
    }

    /**
     * Logs bug report activity
     */
    protected async logBugReportActivity(
        action: AuditAction,
        status: AuditStatus,
        userId: string,
        bugReportId?: string,
        details?: Record<string, any>,
        request?: NextRequest
    ): Promise<void> {
        try {
            await AuditLogger.logSystem(
                action,
                status,
                {
                    userId,
                    bugReportId,
                    ...details,
                    bugReportAction: true
                },
                request
            );
        } catch (error) {
            console.error('Failed to log bug report activity:', error);
            // Don't throw to avoid disrupting the main flow
        }
    }

    /**
     * Find a bug report by ID with extended information
     */
    protected async findBugReportWithDetails(bugReportId: string, currentUserId: string) {
        return prisma.bugReport.findUnique({
            where: { id: bugReportId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                _count: {
                    select: {
                        reactions: true,
                        comments: true
                    }
                },
                reactions: {
                    where: {
                        userId: currentUserId
                    },
                    take: 1
                }
            }
        });
    }

    /**
     * Get comments for a bug report
     */
    protected async getBugReportComments(bugReportId: string) {
        return prisma.comment.findMany({
            where: {
                bugReportId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
    }

    /**
     * Check if user has permission to modify a bug report
     */
    protected canModifyBugReport(bugReport: any, userId: string, userRole?: string): boolean {
        // Allow admins and moderators to modify any bug report
        if (userRole === 'ADMIN' || userRole === 'MODERATOR') {
            return true;
        }

        // Otherwise, only the author can modify their own reports
        return bugReport.authorId === userId;
    }

    /**
     * Create a notification about a bug report action
     */
    protected async createBugReportNotification(
        type: 'COMMENT_REPLY' | 'REACTION',
        title: string,
        content: string,
        recipientId: string
    ) {
        return prisma.notification.create({
            data: {
                type,
                title,
                content,
                userId: recipientId,
                isRead: false,
            }
        });
    }

    /**
     * Format bug report data for response
     */
    protected formatBugReportResponse(bugReport: any, includeDetails: boolean = false) {
        const baseResponse = {
            id: bugReport.id,
            title: bugReport.title,
            status: bugReport.status,
            severity: bugReport.severity,
            priority: bugReport.priority,
            createdAt: bugReport.createdAt.toISOString(),
            updatedAt: bugReport.updatedAt.toISOString(),
            authorName: bugReport.author?.name || 'Unknown User',
        };

        if (!includeDetails) {
            return baseResponse;
        }

        return {
            ...baseResponse,
            description: bugReport.description,
            steps: bugReport.steps,
            expected: bugReport.expected,
            actual: bugReport.actual,
            browser: bugReport.browser,
            os: bugReport.os,
            device: bugReport.device,
            version: bugReport.version,
            environment: bugReport.environment,
            authorId: bugReport.authorId,
            reactions: bugReport._count?.reactions || 0,
            comments: bugReport._count?.comments || 0,
            userReaction: bugReport.reactions?.length > 0 ? bugReport.reactions[0].type : null,
        };
    }

    /**
     * Validate bug report status transition
     */
    protected isValidStatusTransition(currentStatus: BugStatus, newStatus: BugStatus): boolean {
        // Define allowed transitions
        const allowedTransitions: Record<BugStatus, BugStatus[]> = {
            [BugStatus.OPEN]: [BugStatus.CONFIRMED, BugStatus.CLOSED, BugStatus.WONT_FIX, BugStatus.CANT_REPRODUCE, BugStatus.DUPLICATE],
            [BugStatus.CONFIRMED]: [BugStatus.IN_PROGRESS, BugStatus.CLOSED, BugStatus.WONT_FIX],
            [BugStatus.IN_PROGRESS]: [BugStatus.FIXED, BugStatus.WONT_FIX, BugStatus.CLOSED],
            [BugStatus.FIXED]: [BugStatus.CLOSED, BugStatus.REOPENED],
            [BugStatus.WONT_FIX]: [BugStatus.REOPENED, BugStatus.CLOSED],
            [BugStatus.CLOSED]: [BugStatus.REOPENED],
            [BugStatus.REOPENED]: [BugStatus.CONFIRMED, BugStatus.IN_PROGRESS, BugStatus.CLOSED],
            [BugStatus.CANT_REPRODUCE]: [BugStatus.CONFIRMED, BugStatus.CLOSED, BugStatus.REOPENED],
            [BugStatus.DUPLICATE]: [BugStatus.OPEN, BugStatus.CLOSED]
        };

        // Allow transition to same status for other field updates
        if (currentStatus === newStatus) {
            return true;
        }

        return allowedTransitions[currentStatus]?.includes(newStatus) || false;
    }

    /**
     * Get bug reports with pagination and filtering
     */
    protected async getPaginatedBugReports(
        page: number,
        pageSize: number,
        filter: any,
        currentUserId: string
    ) {
        // Validate pagination params
        if (page < 1 || pageSize < 1 || pageSize > 50) {
            throw new Error('Invalid pagination parameters');
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * pageSize;

        // Get total count
        const totalBugReports = await prisma.bugReport.count({ where: filter });

        // Get paginated bug reports
        const bugReports = await prisma.bugReport.findMany({
            where: filter,
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
            include: {
                author: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: {
                        reactions: true,
                        comments: true
                    }
                }
            }
        });

        return {
            bugReports,
            pagination: {
                total: totalBugReports,
                page,
                pageSize,
                hasMore: skip + bugReports.length < totalBugReports
            }
        };
    }

    /**
     * Creates a success response with bug report data
     */
    protected successResponse(data: R): ApiResponse<R> {
        return {
            data,
            status: 200,
            headers: {}
        };
    }

    /**
     * Creates an error response for bug report operations
     */
    protected errorResponse(error: {
        code: string;
        message: string;
        details?: any;
    }, statusCode: number = 500): ApiResponse<R> {
        return {
            data: null as any,
            status: statusCode,
            headers: {}
        };
    }
}
