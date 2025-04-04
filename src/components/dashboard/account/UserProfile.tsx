'use client';

import { User, Calendar, MessageSquare, ThumbsUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface UserProfileProps {
    user: {
        id: string;
        name: string;
        displayName: string | null;
        username: string | null;
        email: string;
        createdAt: string;
    };
    contributions: {
        featureRequests: number;
        comments: number;
        upvotes: number;
        joinedDays: number;
    };
    isCurrentUser: boolean;
}

export function UserProfile({ user, contributions, isCurrentUser }: UserProfileProps) {
    const formatDate = (dateString: string): string => {
        try {
            return format(new Date(dateString), 'MMMM d, yyyy');
        } catch (error) {
            return "Unknown date";
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-github-dark-secondary rounded-xl p-6">
                <div className="flex items-center space-x-4">
                    <div className="p-4 bg-github-accent text-white rounded-full">
                        <User className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {user.displayName || user.name}
                            {user.username && (
                                <span className="text-github-text-secondary font-normal ml-2">
                                    @{user.username}
                                </span>
                            )}
                        </h2>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-github-text-secondary">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Joined {formatDate(user.createdAt)}</span>
                            </div>
                            {isCurrentUser && (
                                <Link 
                                    href="/dashboard/account" 
                                    className="text-github-accent hover:text-white transition-colors"
                                >
                                    Edit Profile
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-github-dark-secondary rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Contributions</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-github-border pb-3">
                            <div className="flex items-center text-github-text-secondary">
                                <MessageSquare className="h-5 w-5 mr-2" />
                                <span>Feature Requests</span>
                            </div>
                            <span className="text-white font-medium">{contributions.featureRequests}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-github-border pb-3">
                            <div className="flex items-center text-github-text-secondary">
                                <MessageSquare className="h-5 w-5 mr-2" />
                                <span>Comments</span>
                            </div>
                            <span className="text-white font-medium">{contributions.comments}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-github-border pb-3">
                            <div className="flex items-center text-github-text-secondary">
                                <ThumbsUp className="h-5 w-5 mr-2" />
                                <span>Upvotes Given</span>
                            </div>
                            <span className="text-white font-medium">{contributions.upvotes}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center text-github-text-secondary">
                                <Clock className="h-5 w-5 mr-2" />
                                <span>Days as Member</span>
                            </div>
                            <span className="text-white font-medium">{contributions.joinedDays}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-github-dark-secondary rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="h-48 flex items-center justify-center text-github-text-secondary">
                        <p>Activity feed coming soon</p>
                    </div>
                </div>
            </div>
            
            {isCurrentUser && (
                <div className="bg-github-dark-secondary rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Member Status</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-github-text-secondary">
                                Your account is in good standing
                            </p>
                            <p className="text-github-text-secondary text-sm mt-1">
                                Thank you for being part of our community!
                            </p>
                        </div>
                        <Link 
                            href="/dashboard/account/settings"
                            className="px-4 py-2 bg-github-dark text-github-text-secondary rounded-lg hover:text-white transition-colors"
                        >
                            Account Settings
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
