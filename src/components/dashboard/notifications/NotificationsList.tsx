'use client';

import { useState, useEffect } from 'react';
import { createApiClient } from '@/lib/api/client';
import { Bell, CheckCircle, AlertTriangle, Info, ChevronRight, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    type: string;
    title: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

interface Pagination {
    total: number;
    unread: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

interface NotificationsListProps {
    initialNotifications: Notification[];
    initialPagination: Pagination;
}

export function NotificationsList({ initialNotifications, initialPagination }: NotificationsListProps) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [pagination, setPagination] = useState<Pagination>(initialPagination);
    const [loading, setLoading] = useState(false);
    const [markingRead, setMarkingRead] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filterUnread, setFilterUnread] = useState(false);

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
                `/dashboard/notifications?page=${nextPage}&pageSize=${pagination.pageSize}${filterUnread ? '&unreadOnly=true' : ''}`
            );
            
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to load more notifications');
            }
            
            setNotifications(prev => [...prev, ...response.data.notifications]);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while loading more notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationIds?: string[]) => {
        setMarkingRead(true);
        setError(null);
        
        try {
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await apiClient.post('/dashboard/notifications', {
                notificationIds,
                markAll: !notificationIds
            });
            
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to mark notifications as read');
            }
            
            if (notificationIds) {
                // Update just the specified notifications
                setNotifications(prev => 
                    prev.map(notification => 
                        notificationIds.includes(notification.id) 
                            ? { ...notification, isRead: true } 
                            : notification
                    )
                );
            } else {
                // All notifications are now read
                setNotifications(prev => 
                    prev.map(notification => ({ ...notification, isRead: true }))
                );
                setPagination(prev => ({ ...prev, unread: 0 }));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while marking notifications as read');
        } finally {
            setMarkingRead(false);
        }
    };

    const toggleReadFilter = async () => {
        const newFilterState = !filterUnread;
        setFilterUnread(newFilterState);
        setLoading(true);
        
        try {
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await apiClient.get(
                `/dashboard/notifications?page=1&pageSize=${pagination.pageSize}${newFilterState ? '&unreadOnly=true' : ''}`
            );
            
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to filter notifications');
            }
            
            setNotifications(response.data.notifications);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while filtering notifications');
        } finally {
            setLoading(false);
        }
    };

    // Get appropriate icon for notification type
    const getNotificationIcon = (type: string, isRead: boolean) => {
        // Base classes
        const baseClasses = "h-5 w-5";
        
        // Color class depending on read status
        const colorClass = isRead ? "text-github-text-secondary" : "text-github-accent";

        // Choose icon based on notification type
        switch(type) {
            case 'WAITLIST_UPDATE':
            case 'POSITION_CHANGE':
                return <Bell className={`${baseClasses} ${colorClass}`} />;
            case 'FEATURE_UPDATE':
                return <CheckCircle className={`${baseClasses} ${colorClass}`} />;
            case 'COMMENT_REPLY':
            case 'REACTION':
                return <AlertTriangle className={`${baseClasses} ${colorClass}`} />;
            case 'INVITE':
            case 'SURVEY':
                return <Info className={`${baseClasses} ${colorClass}`} />;
            default:
                return <Bell className={`${baseClasses} ${colorClass}`} />;
        }
    };

    // Get time ago
    const getTimeAgo = (dateString: string): string => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (error) {
            return "Unknown time";
        }
    };

    return (
        <div className="bg-github-dark-secondary rounded-xl p-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Your Notifications</h2>
                <div className="flex items-center space-x-4">
                    <div className="text-sm">
                        <span className="text-github-text-secondary">
                            {pagination.unread} unread
                        </span>
                        <span className="text-github-text-secondary mx-2">•</span>
                        <span className="text-github-text-secondary">
                            {pagination.total} total
                        </span>
                    </div>
                    <button
                        onClick={toggleReadFilter}
                        className={`px-3 py-1 text-sm rounded-md ${
                            filterUnread 
                                ? 'bg-github-accent text-white'
                                : 'text-github-text-secondary hover:text-white'
                        }`}
                    >
                        {filterUnread ? 'All Notifications' : 'Unread Only'}
                    </button>
                    <button
                        onClick={() => markAsRead()}
                        disabled={markingRead || pagination.unread === 0}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-github-accent hover:text-white transition-colors disabled:opacity-50 disabled:text-github-text-secondary"
                    >
                        <Check className="h-4 w-4" />
                        <span>Mark All Read</span>
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-3">
                {notifications.length === 0 ? (
                    <div className="flex items-center justify-center py-12 px-4 bg-github-dark rounded-lg">
                        <div className="text-center">
                            <div className="p-3 bg-github-accent/20 rounded-full inline-block mb-3">
                                <Bell className="h-6 w-6 text-github-accent" />
                            </div>
                            <h3 className="text-white font-medium mb-1">No notifications</h3>
                            <p className="text-github-text-secondary text-sm">
                                {filterUnread 
                                    ? "You've read all your notifications"
                                    : "You don't have any notifications yet"}
                            </p>
                        </div>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div 
                            key={notification.id} 
                            className={`flex items-start space-x-3 p-4 rounded-lg ${
                                notification.isRead 
                                    ? 'bg-github-dark/50' 
                                    : 'bg-github-dark border-l-2 border-github-accent'
                            }`}
                        >
                            <div className="p-2 bg-github-accent/20 rounded-full mt-1">
                                {getNotificationIcon(notification.type, notification.isRead)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className={`font-medium ${notification.isRead ? 'text-github-text-secondary' : 'text-white'}`}>
                                            {notification.title}
                                        </h3>
                                        <p className="text-sm text-github-text-secondary mt-1">
                                            {notification.content}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead([notification.id])}
                                            disabled={markingRead}
                                            className="ml-2 p-1 text-github-text-secondary hover:text-white rounded-full hover:bg-github-dark-secondary"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <p className="text-xs text-github-text-secondary">
                                        {getTimeAgo(notification.createdAt)}
                                    </p>
                                    <button className="text-xs text-github-accent hover:text-white flex items-center transition-colors">
                                        View Details
                                        <ChevronRight className="h-3 w-3 ml-1" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                
                {pagination.hasMore && (
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="w-full py-2 bg-github-dark hover:bg-github-dark-secondary/70 text-github-text-secondary rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More Notifications'}
                    </button>
                )}
                
                {!pagination.hasMore && notifications.length > 0 && (
                    <div className="text-center text-github-text-secondary text-sm py-2">
                        End of notifications
                    </div>
                )}
            </div>
        </div>
    );
}
