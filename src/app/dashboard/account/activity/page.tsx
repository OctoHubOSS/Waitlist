import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

async function getActivityData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    const response = await fetch(`/api/dashboard/activity`, {
        headers: {
            'X-User-Email': session.user.email,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch activity');
    }

    return response.json();
}

export default async function ActivityPage() {
    const data = await getActivityData();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Activity</h1>
                <p className="mt-1 text-sm text-github-text-secondary">
                    View your recent account activity
                </p>
            </div>

            <ActivityFeed activities={data.activities} />
        </div>
    );
} 