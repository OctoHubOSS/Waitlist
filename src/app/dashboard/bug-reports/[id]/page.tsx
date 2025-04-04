import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { BugReportDetail } from '@/components/dashboard/bug-reports/BugReportDetail';

interface PageProps {
    params: {
        id: string;
    };
}

async function getBugReportData(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/bug-reports/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch bug report');
        }
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Bug report fetch error:', error);
        return null;
    }
}

export default async function BugReportPage({ params }: PageProps) {
    const data = await getBugReportData(params.id);
    
    if (!data) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Bug Report</h1>
                <p className="mt-1 text-sm text-github-text-secondary">
                    View and discuss reported issues
                </p>
            </div>

            <BugReportDetail 
                bugReport={data.bugReport} 
                comments={data.comments} 
            />
        </div>
    );
}
