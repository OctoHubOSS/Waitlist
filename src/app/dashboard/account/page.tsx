import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { createApiClient } from '@/lib/api/client';
import { AccountSection } from '@/components/dashboard/account/AccountSection';
import { ProfileSection } from '@/components/dashboard/account/ProfileSection';
import { SecuritySection } from '@/components/dashboard/account/SecuritySection';
import { SessionsSection } from '@/components/dashboard/account/SessionsSection';
import { AuditLogsSection } from '@/components/dashboard/account/AuditLogsSection';

async function getAccountData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    const apiClient = createApiClient({
        baseUrl: process.env.NEXT_PUBLIC_APP_URL + '/api',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Email': session.user.email,
        },
    });

    const response = await apiClient.get('/account/profile');
    if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch account data');
    }

    return response.data;
}

export default async function AccountPage() {
    const data = await getAccountData();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-white mb-8">Account Settings</h1>

            <AccountSection>
                <ProfileSection user={data.user} />
                <SecuritySection />
                <SessionsSection sessions={data.sessions} />
                <AuditLogsSection logs={data.auditLogs} />
            </AccountSection>
        </div>
    );
} 