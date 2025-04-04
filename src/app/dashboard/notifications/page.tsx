import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { NotificationsList } from '@/components/dashboard/notifications/NotificationsList';
import { AlertCircle } from 'lucide-react';

async function getNotificationsData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/notifications?page=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch notifications');
        }
        
        const data = await response.json();
        return { 
            success: true, 
            data: data.data 
        };
    } catch (error) {
        console.error('Notifications fetch error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
            data: {
                notifications: [],
                pagination: {
                    total: 0,
                    unread: 0,
                    page: 1,
                    pageSize: 10,
                    hasMore: false
                }
            }
        };
    }
}

export default async function NotificationsPage() {
    const result = await getNotificationsData();
    const data = result.data;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="mt-1 text-sm text-github-text-secondary">
                    Stay updated with the latest information
                </p>
            </div>

            {!result.success && (
                <div className="bg-red-900/30 border border-red-900/50 rounded-lg p-4 flex items-center text-red-400">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div>
                        <h3 className="font-medium">Error loading notifications</h3>
                        <p className="text-sm">{result.error || 'Please try refreshing the page'}</p>
                    </div>
                </div>
            )}

            <NotificationsList 
                initialNotifications={data.notifications} 
                initialPagination={data.pagination} 
            />
        </div>
    );
}
