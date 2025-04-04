import { MessageSquare, ChevronRight, AlertCircle, CheckCircle, Info, Bell } from 'lucide-react';
import { AuditAction, AuditStatus } from '@/types/auditLogs';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
    id: string;
    action: string;
    status: string;
    details: any;
    createdAt: string;
}

interface ActivityFeedProps {
    activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
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
                return <Bell className={`${baseClasses} ${colorClass}`} />;
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
        <div className="lg:col-span-2 bg-github-dark-secondary rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                <button className="text-sm text-github-accent hover:text-white transition-colors flex items-center">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                </button>
            </div>
            <div className="space-y-3">
                {activities.length === 0 ? (
                    <div className="flex items-center space-x-3 p-3 bg-github-dark rounded-lg">
                        <div className="p-2 bg-github-accent/20 rounded-full">
                            <MessageSquare className="h-5 w-5 text-github-accent" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-white">No recent activity to display</p>
                            <p className="text-xs text-github-text-secondary">Your activity will appear here</p>
                        </div>
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-github-dark rounded-lg">
                            <div className="p-2 bg-github-accent/20 rounded-full">
                                {getActionIcon(activity.action, activity.status)}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-white">{formatActionLabel(activity.action)}</p>
                                <p className="text-xs text-github-text-secondary">
                                    {getTimeAgo(activity.createdAt)}
                                </p>
                                {activity.details?.clientInfo && (
                                    <div className="mt-2 text-xs text-github-text-secondary">
                                        <p>Client: {activity.details.clientInfo.browser} on {activity.details.clientInfo.os}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}