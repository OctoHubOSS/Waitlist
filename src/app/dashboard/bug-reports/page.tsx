import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { BugReportsList } from '@/components/dashboard/bug-reports/BugReportsList';
import Link from 'next/link';
import { BugIcon, PlusCircle } from 'lucide-react';
import { DashboardError } from '@/components/dashboard/DashboardError';

async function getBugReportsData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/bug-reports?page=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch bug reports');
        }
        
        const data = await response.json();
        return { 
            success: true, 
            data: data.data 
        };
    } catch (error) {
        console.error('Bug reports fetch error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
            errorDetails: error instanceof Error ? {
                message: error.message,
                timestamp: new Date().toISOString(),
                path: '/api/dashboard/bug-reports'
            } : undefined,
            data: {
                bugReports: [],
                pagination: {
                    total: 0,
                    page: 1,
                    pageSize: 10,
                    hasMore: false
                }
            }
        };
    }
}

export default async function BugReportsPage() {
    const result = await getBugReportsData();
    const data = result.data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Bug Reports</h1>
                    <p className="mt-1 text-sm text-github-text-secondary">
                        Track and report issues with the application
                    </p>
                </div>
                <Link 
                    href="/dashboard/bug-reports/new"
                    className="flex items-center space-x-2 px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/90 transition-colors"
                >
                    <PlusCircle className="h-4 w-4" />
                    <span>Report Bug</span>
                </Link>
            </div>

            {!result.success ? (
                <DashboardError 
                    title="Error Loading Bug Reports"
                    message={result.error || 'Failed to load bug reports. Please try again later.'}
                    details={result.errorDetails}
                />
            ) : (
                <BugReportsList 
                    initialBugReports={data.bugReports} 
                    initialPagination={data.pagination} 
                />
            )}
        </div>
    );
}
