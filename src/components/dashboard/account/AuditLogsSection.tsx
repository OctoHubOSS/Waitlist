'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api/client';
import { AuditAction, AuditStatus } from '@/lib/audit/logger';

interface AuditLog {
    id: string;
    userId: string;
    action: AuditAction;
    status: AuditStatus;
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
}

interface AuditLogsSectionProps {
    logs: AuditLog[];
}

export function AuditLogsSection({ logs: initialLogs }: AuditLogsSectionProps) {
    const { data: session } = useSession();
    const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadMore = async () => {
        try {
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await apiClient.get<AuditLog[]>(`/account/audit-logs?page=${page + 1}`);

            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to fetch audit logs');
            }

            const newLogs = response.data || [];
            setLogs(prev => [...prev, ...newLogs]);
            setHasMore(newLogs.length === 10); // Assuming 10 is our page size
            setPage(prev => prev + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while fetching audit logs');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">Audit Logs</h3>
                <p className="mt-1 text-sm text-github-text-secondary">
                    View your account activity history
                </p>
            </div>

            <div className="bg-github-dark-secondary/50 rounded-lg p-6">
                {error && (
                    <div className="mb-4 text-red-500 text-sm">{error}</div>
                )}

                <div className="space-y-4">
                    {logs.length === 0 ? (
                        <div className="text-github-text-secondary">No audit logs found.</div>
                    ) : (
                        <>
                            {logs.map((log) => (
                                <div key={log.id} className="bg-github-dark rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-white font-medium">
                                                {log.action}
                                            </h3>
                                            <p className="text-sm text-github-text-secondary">
                                                {log.status}
                                            </p>
                                            <p className="text-xs text-github-text-secondary mt-1">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    {log.details?.clientInfo && (
                                        <div className="mt-2 text-xs text-github-text-secondary">
                                            <p>IP: {log.details.clientInfo.ip}</p>
                                            <p>Browser: {log.details.clientInfo.browser}</p>
                                            <p>OS: {log.details.clientInfo.os}</p>
                                            <p>Device: {log.details.clientInfo.device}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {hasMore && (
                                <button
                                    onClick={loadMore}
                                    className="w-full py-2 px-4 bg-github-dark-secondary hover:bg-github-dark-secondary/80 text-white rounded-lg transition-colors"
                                >
                                    Load More
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 