import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { createApiClient } from '@/lib/api/client';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TrendingUp, ClipboardList, Bell, History } from 'lucide-react';

async function getDashboardData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    // Ensure we have the correct base URL with proper protocol
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const apiUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
    
    const apiClient = createApiClient({
        baseUrl: apiUrl + '/api',
        useSession: false, // Disable automatic session handling
        headers: {
            'Content-Type': 'application/json',
            'X-User-Email': session.user.email,
        },
    });

    try {
        const response = await apiClient.get('/dashboard');
        
        if (!response.success) {
            console.error('API error:', response.error);
            throw new Error(response.error?.message || 'Failed to fetch dashboard data');
        }
        
        return response.data;
    } catch (error) {
        console.error('Dashboard data fetch error:', error);
        // Return a minimal data structure to prevent UI crashes
        return {
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
        };
    }
}

export default async function DashboardPage() {
    const data = await getDashboardData();

    return (
        <div className="space-y-8">
            <WelcomeSection userName={data.user.displayName || data.user.name} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Waitlist Position"
                    value={`#${data.waitlistPosition}`}
                    icon={TrendingUp}
                    progress={(data.waitlistPosition / 1000) * 100}
                />
                <StatsCard
                    title="Feature Requests"
                    value={data.featureRequestsCount}
                    icon={ClipboardList}
                    subtitle={data.featureRequestsCount === 0 ? 'No requests yet' : 'View your requests'}
                />
                <StatsCard
                    title="Unread Notifications"
                    value={data.unreadNotificationsCount}
                    icon={Bell}
                    subtitle={data.unreadNotificationsCount === 0 ? 'All caught up!' : 'New updates available'}
                />
                <StatsCard
                    title="Recent Activity"
                    value={data.recentActivity.length}
                    icon={History}
                    subtitle="Last 24 hours"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <QuickActions
                    onFeatureRequest={() => { }}
                    onJoinDiscord={() => { }}
                />
                <ActivityFeed activities={data.recentActivity} />
            </div>
        </div>
    );
}