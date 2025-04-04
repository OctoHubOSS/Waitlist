import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { FeatureRequestsList } from '@/components/dashboard/feature-requests/FeatureRequestsList';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { DashboardError } from '@/components/dashboard/DashboardError';

async function getFeatureRequestsData() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/feature-requests?page=1&pageSize=10`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch feature requests');
        }
        
        const data = await response.json();
        return { 
            success: true, 
            data: data.data 
        };
    } catch (error) {
        console.error('Feature requests fetch error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unexpected error occurred',
            errorDetails: error instanceof Error ? {
                message: error.message,
                stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
                timestamp: new Date().toISOString(),
                path: '/api/dashboard/feature-requests'
            } : undefined,
            // Return empty data to prevent UI crashes
            data: {
                featureRequests: [],
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

export default async function FeatureRequestsPage() {
    const result = await getFeatureRequestsData();
    const data = result.data;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Feature Requests</h1>
                    <p className="mt-1 text-sm text-github-text-secondary">
                        Browse and submit feature ideas for OctoHub
                    </p>
                </div>
                <Link 
                    href="/dashboard/feature-requests/new"
                    className="flex items-center space-x-2 px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/90 transition-colors"
                >
                    <PlusCircle className="h-4 w-4" />
                    <span>New Request</span>
                </Link>
            </div>

            {!result.success ? (
                <DashboardError 
                    title="Error Loading Feature Requests"
                    message={result.error || 'Failed to load feature requests. Please try again later.'}
                    details={result.errorDetails}
                />
            ) : (
                <FeatureRequestsList 
                    initialFeatureRequests={data.featureRequests} 
                    initialPagination={data.pagination} 
                />
            )}
        </div>
    );
}
