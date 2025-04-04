import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { UserProfile } from '@/components/dashboard/account/UserProfile';

interface PageProps {
    params: {
        user: string;
    };
}

async function getUserProfileData(username: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect('/auth/login');
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/account/profile/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('User profile fetch error:', error);
        return null;
    }
}

export default async function UserProfilePage({ params }: PageProps) {
    const data = await getUserProfileData(params.user);
    
    if (!data) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">User Profile</h1>
                <p className="mt-1 text-sm text-github-text-secondary">
                    View community member details
                </p>
            </div>

            <UserProfile 
                user={data.user}
                contributions={data.contributions}
                isCurrentUser={data.isCurrentUser}
            />
        </div>
    );
}
