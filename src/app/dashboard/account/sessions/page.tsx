import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { SessionsSection } from '@/components/dashboard/account/SessionsSection';

async function getSessionsData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    const response = await fetch(`/api/dashboard/sessions`, {
        headers: {
            'X-User-Email': session.user.email,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch sessions');
    }

    return response.json();
}

export default async function SessionsPage() {
    const data = await getSessionsData();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Sessions</h1>
                <p className="mt-1 text-sm text-github-text-secondary">
                    Manage your active sessions
                </p>
            </div>

            <SessionsSection sessions={data.sessions} />
        </div>
    );
} 