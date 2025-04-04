import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { ActivityList } from '@/components/dashboard/account/ActivityList';

async function getActivityData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/activity?page=1&pageSize=20`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch activity data');
        }
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Activity data fetch error:', error);
        // Return empty data to prevent UI crashes
        return {
            activities: [],
            pagination: {
                total: 0,
                page: 1,
                pageSize: 20,
                hasMore: false
            }
        };
    }
}

export default async function ActivityPage() {
    const data = await getActivityData();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Activity Log</h1>
                <p className="mt-1 text-sm text-github-text-secondary">
                    View your recent account activity and login history
                </p>
            </div>

            <ActivityList 
                initialActivities={data.activities} 
                initialPagination={data.pagination} 
            />
        </div>
    );
}