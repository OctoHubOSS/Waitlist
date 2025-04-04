import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { DashboardError } from '@/components/dashboard/DashboardError';
import { getBaseUrl } from '@/lib/api';

async function getDashboardData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    try {
        const response = await fetch(`${getBaseUrl()}/api/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        return { 
            success: true, 
            data: data.data 
        };
    } catch (error) {
        console.error('Dashboard data fetch error:', error);
        
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
            errorDetails: {
                message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString(),
                path: '/api/dashboard',
                requestId: generateRequestId(),
                code: error instanceof Error ? error.name : 'UnknownError',
                // Don't include the stack trace in production
                context: {
                    url: '/api/dashboard',
                    method: 'GET',
                    attemptedAt: new Date().toISOString(),
                    sessionAvailable: !!session
                }
            },
            // Return minimal fallback data to prevent UI crashes
            data: {
                user: {
                    name: session.user.name || 'User',
                    email: session.user.email,
                    displayName: session.user.name,
                    createdAt: new Date().toISOString(),
                },
                waitlistPosition: 0,
                featureRequestsCount: 0,
                unreadNotificationsCount: 0,
                recentActivity: [],
            }
        };
    }
}

// Utility function to generate a request ID
function generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default async function DashboardPage() {
    const result = await getDashboardData();
    const data = result.data;

    if (!data) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-8">
            <WelcomeSection userName={data.user.displayName || data.user.name} />

            {!result.success ? (
                <DashboardError 
                    message={result.error || 'We encountered an issue loading your dashboard content.'}
                    details={result.errorDetails}
                />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard
                            title="Waitlist Position"
                            value={`#${data.waitlistPosition}`}
                            icon="TrendingUp"
                            progress={Math.min(100, (1000 - data.waitlistPosition) / 10)}
                            subtitle={`Top ${Math.round((data.waitlistPosition / 1000) * 100)}%`}
                        />
                        <StatsCard
                            title="Feature Requests"
                            value={data.featureRequestsCount}
                            icon="ClipboardList"
                            subtitle={data.featureRequestsCount === 0 ? 'No requests yet' : 'View your requests'}
                            href="/dashboard/feature-requests"
                        />
                        <StatsCard
                            title="Unread Notifications"
                            value={data.unreadNotificationsCount}
                            icon="Bell"
                            subtitle={data.unreadNotificationsCount === 0 ? 'All caught up!' : 'New updates available'}
                            href="/dashboard/notifications"
                        />
                        <StatsCard
                            title="Recent Activity"
                            value={data.recentActivity.length}
                            icon="History"
                            subtitle="Last 24 hours"
                            href="/dashboard/account/activity"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <ActivityFeed activities={data.recentActivity} />
                        </div>
                        <QuickActions />
                    </div>
                </>
            )}
        </div>
    );
}