import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { FeatureRequestDetail } from '@/components/dashboard/feature-requests/FeatureRequestDetail';

interface PageProps {
    params: {
        id: string;
    };
}

async function getFeatureRequestData(id: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard/feature-requests/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch feature request');
        }
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Feature request fetch error:', error);
        return null;
    }
}

export default async function FeatureRequestPage({ params }: PageProps) {
    const data = await getFeatureRequestData(params.id);
    
    if (!data) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Feature Request</h1>
                <p className="mt-1 text-sm text-github-text-secondary">
                    View and discuss feature ideas
                </p>
            </div>

            <FeatureRequestDetail 
                request={data.featureRequest} 
                comments={data.comments} 
            />
        </div>
    );
}
