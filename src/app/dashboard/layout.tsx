import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    return (
        <div className="min-h-screen bg-github-dark">
            <div className="lg:grid lg:grid-cols-[256px_1fr]">
                <DashboardNav />
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}