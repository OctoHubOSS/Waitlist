import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { BugReportForm } from '@/components/dashboard/bug-reports/BugReportForm';

export default async function NewBugReportPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Report a Bug</h1>
                <p className="mt-1 text-sm text-github-text-secondary">
                    Help us improve by reporting issues you encounter
                </p>
            </div>

            <BugReportForm />
        </div>
    );
}
