import { NextRequest } from 'next/server';
import { BaseDashboardRoute } from '@/lib/api/routes/dashboard/base';
import { successResponse, errors } from '@/lib/api/responses';
import prisma from '@/lib/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { withTimeout } from '@/lib/api/utils';
import { AuditAction } from '@/types/auditLogs';

class ActivityRoute extends BaseDashboardRoute {
    constructor() {
        super();
    }

    async handle(request: NextRequest): Promise<Response> {
        try {
            return await withTimeout(this.getActivity(request), 5000);
        } catch (error) {
            if (error instanceof Error && error.message.includes('timed out')) {
                return errors.timeout('Activity request timed out');
            }
            return this.handleError(error);
        }
    }

    private async getActivity(request: NextRequest): Promise<Response> {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return errors.unauthorized('You must be logged in to view your activity');
            }

            const url = new URL(request.url);
            const page = parseInt(url.searchParams.get('page') || '1');
            const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
            const filter = url.searchParams.get('filter') || null;

            // Validate pagination params
            if (!this.validatePaginationParams(page, pageSize, 50)) {
                return errors.badRequest('Invalid pagination parameters');
            }

            // Find bug and feature report-related actions
            const actions = [
                AuditAction.FEATURE_REQUESTED,
                AuditAction.FEATURE_UPDATED,
                AuditAction.FEATURE_STATUS_CHANGED,
                AuditAction.COMMENT_ADDED,
                AuditAction.REACTION_ADDED,
                AuditAction.REACTION_REMOVED,
                // Bug report related actions
                AuditAction.BUG_REPORTED,
                AuditAction.BUG_UPDATED,
                AuditAction.BUG_STATUS_CHANGED,
                AuditAction.BUG_CLOSED,
                AuditAction.BUG_REOPENED
            ];

            // Calculate skip value for pagination
            const skip = (page - 1) * pageSize;

            // Build where clause based on filters
            const where: any = {
                userId: session.user.id,
                action: { in: actions }
            };

            if (filter) {
                where.action = { in: filter.split(',') as AuditAction[] };
            }

            // Get activities with pagination
            const [activities, total] = await Promise.all([
                prisma.auditLog.findMany({
                    where,
                    orderBy: { timestamp: 'desc' },
                    skip,
                    take: pageSize,
                    include: {
                        featureRequest: { 
                            select: { 
                                title: true,
                                status: true
                            } 
                        },
                        bugReport: {
                            select: {
                                title: true,
                                status: true,
                                severity: true
                            }
                        },
                        comment: {
                            select: {
                                content: true,
                                featureRequestId: true,
                                bugReportId: true
                            }
                        }
                    }
                }),
                prisma.auditLog.count({ where })
            ]);

            // Format activities for response
            const formattedActivities = activities.map(activity => {
                // Extract related entity information
                let relatedItem = null;
                if (activity.featureRequest) {
                    relatedItem = {
                        type: 'featureRequest',
                        id: activity.featureRequestId,
                        title: activity.featureRequest.title,
                        status: activity.featureRequest.status
                    };
                } else if (activity.bugReport) {
                    relatedItem = {
                        type: 'bugReport',
                        id: activity.bugReportId,
                        title: activity.bugReport.title,
                        status: activity.bugReport.status,
                        severity: activity.bugReport.severity
                    };
                } else if (activity.comment) {
                    const entityType = activity.comment.featureRequestId 
                        ? 'featureRequest' 
                        : 'bugReport';
                    const entityId = activity.comment.featureRequestId || activity.comment.bugReportId;
                    
                    relatedItem = {
                        type: 'comment',
                        id: activity.commentId,
                        entityType,
                        entityId,
                        preview: activity.comment.content.substring(0, 50) + 
                                (activity.comment.content.length > 50 ? '...' : '')
                    };
                }

                return {
                    id: activity.id,
                    action: activity.action,
                    timestamp: activity.timestamp.toISOString(),
                    entityType: activity.entityType,
                    entityId: activity.entityId,
                    metadata: activity.metadata,
                    relatedItem
                };
            });

            // Generate pagination metadata
            const pagination = this.generatePaginationMetadata(total, page, pageSize);

            return successResponse({
                activities: formattedActivities,
                pagination
            });
        } catch (error) {
            return this.handleError(error);
        }
    }
}

const route = new ActivityRoute();
export const GET = route.handle.bind(route);