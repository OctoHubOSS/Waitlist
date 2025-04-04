import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { SessionsSection } from '@/components/dashboard/account/SessionsSection';

async function getSessionsData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/sessions`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch sessions data');
        }
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Sessions data fetch error:', error);
        // Return empty data to prevent UI crashes
        return { sessions: [] };
    }
}

export default async function SessionsPage() {
    const data = await getSessionsData();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Sessions</h1>
                <p className="mt-1 text-sm text-github-text-secondary">
                    Manage your active sessions across devices
                </p>
            </div>

            <SessionsSection sessions={data.sessions} />
        </div>
    );
}