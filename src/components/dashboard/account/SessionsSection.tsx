'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api/client';
import { Laptop, Smartphone, Monitor, Globe, X } from 'lucide-react';

interface Session {
    id: string;
    userId: string;
    expires: string;
    userAgent?: string;
    ipAddress?: string;
    lastActive?: string;
    isCurrent?: boolean;
}

interface SessionsSectionProps {
    sessions: Session[];
}

export function SessionsSection({ sessions: initialSessions }: SessionsSectionProps) {
    const { data: sessionData } = useSession();
    const [sessions, setSessions] = useState<Session[]>(initialSessions);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getDeviceIcon = (userAgent: string = '') => {
        userAgent = userAgent.toLowerCase();
        
        if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
            return <Smartphone className="h-5 w-5 text-github-accent" />;
        } else if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
            return <Monitor className="h-5 w-5 text-github-accent" />;
        } else if (userAgent.includes('windows') || userAgent.includes('mac') || userAgent.includes('linux')) {
            return <Laptop className="h-5 w-5 text-github-accent" />;
        } else {
            return <Globe className="h-5 w-5 text-github-accent" />;
        }
    };

    const getDeviceType = (userAgent: string = '') => {
        userAgent = userAgent.toLowerCase();
        
        if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
            return "Mobile Device";
        } else if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
            return "Tablet";
        } else if (userAgent.includes('windows')) {
            return "Windows Computer";
        } else if (userAgent.includes('mac')) {
            return "Mac Computer";
        } else if (userAgent.includes('linux')) {
            return "Linux Computer";
        } else {
            return "Unknown Device";
        }
    };

    const handleRevokeSession = async (sessionId: string) => {
        try {
            setLoading(sessionId);
            setError(null);
            
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await apiClient.delete(`/dashboard/sessions`, {
                sessionId
            });

            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to revoke session');
            }

            setSessions(sessions.filter(s => s.id !== sessionId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while revoking the session');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="bg-github-dark-secondary rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Active Sessions</h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {sessions.length === 0 ? (
                    <div className="text-github-text-secondary text-center py-8">
                        No active sessions found other than your current session.
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div 
                            key={session.id} 
                            className={`bg-github-dark rounded-lg p-4 border ${
                                session.isCurrent 
                                    ? 'border-github-accent/30' 
                                    : 'border-transparent'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3">
                                    <div className="p-2 bg-github-accent/20 rounded-full mt-1">
                                        {getDeviceIcon(session.userAgent)}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-white font-medium">
                                                {getDeviceType(session.userAgent)}
                                            </h3>
                                            {session.isCurrent && (
                                                <span className="px-2 py-0.5 text-xs bg-github-accent text-white rounded-full">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-github-text-secondary mt-1">
                                            {session.ipAddress || 'Unknown IP'}
                                        </p>
                                        <div className="mt-2 flex flex-col text-xs text-github-text-secondary">
                                            <span>
                                                Last active: {
                                                    session.lastActive 
                                                        ? new Date(session.lastActive).toLocaleString() 
                                                        : 'Unknown'
                                                }
                                            </span>
                                            <span>
                                                Expires: {new Date(session.expires).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {!session.isCurrent && (
                                    <button
                                        onClick={() => handleRevokeSession(session.id)}
                                        disabled={loading === session.id}
                                        className="flex items-center space-x-1 px-3 py-1 text-sm text-red-400 hover:text-red-300 transition-colors rounded-md hover:bg-red-900/20 disabled:opacity-50"
                                    >
                                        <X className="h-4 w-4" />
                                        <span>{loading === session.id ? 'Revoking...' : 'Revoke'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}