import { NextRequest } from 'next/server';
import { z } from 'zod';
import { BaseAuthRoute } from '../auth/base';
import prisma from '@/lib/database';
import { AuditLogger } from '@/lib/audit/logger';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

/**
 * Base class for dashboard-related API routes
 * 
 * This class extends BaseAuthRoute with specialized methods for working with
 * dashboard data, user activity, and notifications.
 */
export abstract class BaseDashboardRoute<TRequest = any, TResponse = any> extends BaseAuthRoute<TRequest, TResponse> {
    /**
     * Logs dashboard activity
     */
    protected async logDashboardActivity(
        action: AuditAction,
        status: AuditStatus,
        userId: string,
        details?: Record<string, any>,
        request?: NextRequest
    ): Promise<void> {
        try {
            await AuditLogger.logSystem(
                action,
                status,
                {
                    userId,
                    ...details,
                    dashboardAccess: true
                },
                request
            );
        } catch (error) {
            console.error('Failed to log dashboard activity:', error);
            // Don't throw to avoid disrupting the main flow
        }
    }

    /**
     * Get recent activity for a user
     */
    protected async getUserRecentActivity(userId: string, limit: number = 10, onlyPublic: boolean = false) {
        const actionsFilter = onlyPublic 
            ? {
                in: [
                    AuditAction.FEATURE_REQUESTED,
                    AuditAction.COMMENT_ADDED,
                    AuditAction.BUG_REPORTED
                ]
            }
            : {
                in: [
                    AuditAction.FEATURE_REQUESTED,
                    AuditAction.FEATURE_UPDATED,
                    AuditAction.COMMENT_ADDED,
                    AuditAction.REACTION_ADDED,
                    AuditAction.BUG_REPORTED,
                    AuditAction.BUG_UPDATED,
                    AuditAction.SURVEY_SUBMITTED
                ]
            };

        return prisma.auditLog.findMany({
            where: {
                userId,
                action: actionsFilter
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: limit
        });
    }

    /**
     * Get user notifications with pagination
     */
    protected async getUserNotifications(userId: string, page: number, pageSize: number, unreadOnly: boolean = false) {
        const where = {
            userId,
            ...(unreadOnly ? { isRead: false } : {})
        };

        const [notifications, totalCount, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: {
                    createdAt: 'desc'
                },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({
                where: {
                    userId,
                    isRead: false
                }
            })
        ]);

        return {
            notifications,
            pagination: {
                total: totalCount,
                unread: unreadCount,
                page,
                pageSize,
                hasMore: (page * pageSize) < totalCount
            }
        };
    }

    /**
     * Mark notifications as read
     */
    protected async markNotificationsAsRead(userId: string, notificationIds?: string[]) {
        if (notificationIds && notificationIds.length > 0) {
            // Mark specific notifications as read
            return prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId
                },
                data: {
                    isRead: true
                }
            });
        } else {
            // Mark all notifications as read
            return prisma.notification.updateMany({
                where: {
                    userId,
                    isRead: false
                },
                data: {
                    isRead: true
                }
            });
        }
    }

    /**
     * Get dashboard summary statistics
     */
    protected async getDashboardStats(userId: string) {
        const [
            featureRequestsCount,
            bugReportsCount,
            unreadNotificationsCount,
            userWaitlist
        ] = await Promise.all([
            prisma.featureRequest.count({
                where: { authorId: userId }
            }),
            prisma.bugReport.count({
                where: { authorId: userId }
            }),
            prisma.notification.count({
                where: {
                    userId,
                    isRead: false
                }
            }),
            prisma.waitlistSubscriber.findFirst({
                where: {
                    userId
                },
                select: {
                    position: true,
                    status: true
                }
            })
        ]);

        return {
            featureRequestsCount,
            bugReportsCount,
            unreadNotificationsCount,
            waitlistPosition: userWaitlist?.position || 0,
            waitlistStatus: userWaitlist?.status || null
        };
    }

    /**
     * Get user sessions
     */
    protected async getUserSessions(userId: string) {
        // Get current session token (for marking current session)
        const currentSession = await prisma.session.findFirst({
            where: {
                userId,
                expires: {
                    gt: new Date()
                }
            },
            orderBy: {
                expires: 'desc'
            }
        });

        // Get all active sessions for the user
        const sessions = await prisma.session.findMany({
            where: {
                userId,
                expires: {
                    gt: new Date()
                }
            },
            orderBy: {
                expires: 'desc'
            }
        });

        // Format for response
        return sessions.map(session => ({
            id: session.id,
            userId: session.userId,
            expires: session.expires.toISOString(),
            isCurrent: session.id === currentSession?.id
        }));
    }

    /**
     * End a user session by ID
     */
    protected async terminateSession(sessionId: string, userId: string) {
        return prisma.session.deleteMany({
            where: {
                id: sessionId,
                userId
            }
        });
    }
    
    /**
     * Validate pagination parameters
     */
    protected validatePaginationParams(page: number, pageSize: number, maxPageSize: number = 50): boolean {
        if (isNaN(page) || isNaN(pageSize) || page < 1 || pageSize < 1 || pageSize > maxPageSize) {
            return false;
        }
        return true;
    }
    
    /**
     * Generate pagination metadata
     */
    protected generatePaginationMetadata(total: number, page: number, pageSize: number) {
        return {
            total,
            page,
            pageSize,
            hasMore: (page * pageSize) < total,
            totalPages: Math.ceil(total / pageSize),
            hasPrevious: page > 1
        };
    }
}
