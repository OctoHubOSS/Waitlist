'use client';

import { useState, useEffect } from 'react';
import { createApiClient } from '@/lib/api/client';
import { AlertCircle, CheckCircle, Info, MessageSquare, Clock, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AuditAction, AuditStatus } from '@/types/auditLogs';

interface Activity {
    id: string;
    action: string;
    status: string;
    details: any;
    createdAt: string;
}

interface Pagination {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

interface ActivityListProps {
    initialActivities: Activity[];
    initialPagination: Pagination;
}

export function ActivityList({ initialActivities, initialPagination }: ActivityListProps) {
    const [activities, setActivities] = useState<Activity[]>(initialActivities);
    const [pagination, setPagination] = useState<Pagination>(initialPagination);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());

    const loadMore = async () => {
        if (!pagination.hasMore || loading) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const nextPage = pagination.page + 1;
            const response = await apiClient.get(
                `/dashboard/activity?page=${nextPage}&pageSize=${pagination.pageSize}`
            );
            
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to load more activities');
            }
            
            setActivities(prev => [...prev, ...response.data.activities]);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while loading more activities');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedActivities(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Get appropriate icon for action type
    const getActionIcon = (action: string, status: string) => {
        // First check status to determine icon color
        const isSuccess = status === AuditStatus.SUCCESS;
        const isFailure = status === AuditStatus.FAILURE;
        const isWarning = status === AuditStatus.WARNING;
        
        // Common classes for all icons
        const baseClasses = "h-5 w-5";
        
        // Color classes based on status
        const colorClass = isSuccess ? "text-green-500" : 
                          isFailure ? "text-red-500" : 
                          isWarning ? "text-yellow-500" : 
                          "text-github-accent";

        // Choose icon based on action type
        switch(action) {
            case AuditAction.LOGIN:
            case AuditAction.LOGOUT:
            case AuditAction.REGISTER:
                return <CheckCircle className={`${baseClasses} ${colorClass}`} />;
            case AuditAction.SYSTEM_ERROR:
            case AuditAction.SYSTEM_WARNING:
                return <AlertCircle className={`${baseClasses} ${colorClass}`} />;
            case AuditAction.SYSTEM_INFO:
                return <Info className={`${baseClasses} ${colorClass}`} />;
            case AuditAction.DASHBOARD_ACCESS:
                return <Clock className={`${baseClasses} ${colorClass}`} />;
            default:
                return <MessageSquare className={`${baseClasses} ${colorClass}`} />;
        }
    };

    // Format action label to be more human-readable
    const formatActionLabel = (action: string): string => {
        switch(action) {
            case AuditAction.LOGIN:
                return "Login";
            case AuditAction.LOGOUT:
                return "Logout";
            case AuditAction.REGISTER:
                return "Registration";
            case AuditAction.DASHBOARD_ACCESS:
                return "Dashboard Access";
            case AuditAction.SYSTEM_ERROR:
                return "System Error";
            case AuditAction.SYSTEM_WARNING:
                return "System Warning";
            case AuditAction.SYSTEM_INFO:
                return "System Info";
            case AuditAction.PROFILE_UPDATE:
                return "Profile Updated";
            case AuditAction.SUBSCRIBE:
                return "Waitlist Subscription";
            case AuditAction.UNSUBSCRIBE:
                return "Waitlist Unsubscription";
            default:
                // Convert from SNAKE_CASE to Title Case
                return action
                    .split('_')
                    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                    .join(' ');
        }
    };

    // Get time ago for better UX
    const getTimeAgo = (dateString: string): string => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (error) {
            return "Unknown time";
        }
    };

    return (
        <div className="bg-github-dark-secondary rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Account Activity</h2>
                <div className="text-sm text-github-text-secondary">
                    {pagination.total} activities
                </div>
            </div>
            <div className="space-y-3">
                {activities.length === 0 ? (
                    <div className="flex items-center space-x-3 p-3 bg-github-dark rounded-lg">
                        <div className="p-2 bg-github-accent/20 rounded-full">
                            <MessageSquare className="h-5 w-5 text-github-accent" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-white">No activities to display</p>
                            <p className="text-xs text-github-text-secondary">Your account activity will appear here</p>
                        </div>
                    </div>
                ) : (
                    activities.map((activity) => {
                        const isExpanded = expandedActivities.has(activity.id);
                        return (
                            <div 
                                key={activity.id} 
                                className="bg-github-dark rounded-lg overflow-hidden"
                            >
                                <div 
                                    className="flex items-center space-x-3 p-3 cursor-pointer hover:bg-github-dark-secondary/20"
                                    onClick={() => toggleExpand(activity.id)}
                                >
                                    <div className="p-2 bg-github-accent/20 rounded-full">
                                        {getActionIcon(activity.action, activity.status)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-white">{formatActionLabel(activity.action)}</p>
                                            <ChevronDown 
                                                className={`h-4 w-4 text-github-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                                            />
                                        </div>
                                        <p className="text-xs text-github-text-secondary">
                                            {getTimeAgo(activity.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                
                                {isExpanded && activity.details && (
                                    <div className="px-4 pb-3 pt-0 text-xs text-github-text-secondary">
                                        <div className="mt-2 bg-github-dark-secondary/30 p-2 rounded overflow-x-auto">
                                            {activity.details.clientInfo && (
                                                <div className="mb-2">
                                                    <p>IP: {activity.details.clientInfo.ip || 'Unknown'}</p>
                                                    <p>Browser: {activity.details.clientInfo.browser || 'Unknown'}</p>
                                                    <p>OS: {activity.details.clientInfo.os || 'Unknown'}</p>
                                                    <p>Device: {activity.details.clientInfo.device || 'Unknown'}</p>
                                                </div>
                                            )}
                                            <pre className="whitespace-pre-wrap overflow-x-auto">
                                                {JSON.stringify(activity.details, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                
                {error && (
                    <div className="text-red-500 p-2 text-sm">{error}</div>
                )}
                
                {pagination.hasMore && (
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="w-full py-2 bg-github-dark hover:bg-github-dark-secondary/70 text-github-text-secondary rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More Activities'}
                    </button>
                )}
                
                {!pagination.hasMore && activities.length > 0 && (
                    <div className="text-center text-github-text-secondary text-sm py-2">
                        End of activity history
                    </div>
                )}
            </div>
        </div>
    );
}
