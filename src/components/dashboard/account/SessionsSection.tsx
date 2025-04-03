'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api/client';
import { getDeviceType } from '@/lib/auth/config';

interface Session {
    id: string;
    userId: string;
    expires: string;
    sessionToken: string;
    userAgent: string;
    ipAddress: string;
    createdAt: string;
}

interface SessionsSectionProps {
    sessions: Session[];
}

export function SessionsSection({ sessions: initialSessions }: SessionsSectionProps) {
    const { data: session } = useSession();
    const [sessions, setSessions] = useState<Session[]>(initialSessions);
    const [error, setError] = useState<string | null>(null);

    const handleRevokeSession = async (sessionId: string) => {
        try {
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await apiClient.delete(`/account/sessions/${sessionId}`);

            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to revoke session');
            }

            setSessions(sessions.filter(s => s.id !== sessionId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while revoking the session');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">Active Sessions</h3>
                <p className="mt-1 text-sm text-github-text-secondary">
                    Manage your active sessions across devices
                </p>
            </div>

            <div className="bg-github-dark-secondary/50 rounded-lg p-6">
                {error && (
                    <div className="mb-4 text-red-500 text-sm">{error}</div>
                )}

                <div className="space-y-4">
                    {sessions.length === 0 ? (
                        <div className="text-github-text-secondary">No active sessions found.</div>
                    ) : (
                        sessions.map((session) => (
                            <div key={session.id} className="bg-github-dark rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-white font-medium">
                                            {getDeviceType(session.userAgent)}
                                        </h3>
                                        <p className="text-sm text-github-text-secondary">
                                            {session.ipAddress}
                                        </p>
                                        <p className="text-xs text-github-text-secondary mt-1">
                                            Last active: {new Date(session.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    {session.sessionToken !== session?.sessionToken && (
                                        <button
                                            onClick={() => handleRevokeSession(session.id)}
                                            className="px-3 py-1 text-sm text-red-500 hover:text-red-400 transition-colors"
                                        >
                                            Revoke
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
} 