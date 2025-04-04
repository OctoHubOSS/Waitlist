import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { FeatureRequestForm } from '@/components/dashboard/feature-requests/FeatureRequestForm';

export default async function NewFeatureRequestPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Submit Feature Request</h1>
                <p className="mt-1 text-sm text-github-text-secondary">
                    Share your ideas to help improve OctoHub
                </p>
            </div>

            <FeatureRequestForm />
        </div>
    );
}
