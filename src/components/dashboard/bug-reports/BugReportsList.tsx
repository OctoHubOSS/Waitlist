'use client';

import { useState } from 'react';
import { createApiClient } from '@/lib/api/client';
import { Bug, MessageSquare, AlertTriangle, Clock, CheckCircle, X, ChevronRight, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface BugReport {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    severity: string;
    createdAt: string;
    updatedAt: string;
    reactions: number;
    comments: number;
    authorName: string;
    browser: string | null;
    os: string | null;
}

interface Pagination {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

interface BugReportsListProps {
    initialBugReports: BugReport[];
    initialPagination: Pagination;
}

export function BugReportsList({ initialBugReports, initialPagination }: BugReportsListProps) {
    const [bugReports, setBugReports] = useState<BugReport[]>(initialBugReports);
    const [pagination, setPagination] = useState<Pagination>(initialPagination);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        status: '',
        severity: '',
        priority: '',
        myReports: false
    });
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

    const loadMore = async () => {
        if (!pagination.hasMore || loading) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const nextPage = pagination.page + 1;
            let url = `/dashboard/bug-reports?page=${nextPage}&pageSize=${pagination.pageSize}`;
            
            // Add filters to URL
            if (filters.status) url += `&status=${filters.status}`;
            if (filters.severity) url += `&severity=${filters.severity}`;
            if (filters.priority) url += `&priority=${filters.priority}`;
            if (filters.myReports) url += '&myReports=true';
            
            const response = await apiClient.get(url);
            
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to load more bug reports');
            }
            
            setBugReports(prev => [...prev, ...response.data.bugReports]);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while loading bug reports');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            let url = `/dashboard/bug-reports?page=1&pageSize=${pagination.pageSize}`;
            
            // Add filters to URL
            if (filters.status) url += `&status=${filters.status}`;
            if (filters.severity) url += `&severity=${filters.severity}`;
            if (filters.priority) url += `&priority=${filters.priority}`;
            if (filters.myReports) url += '&myReports=true';
            
            const response = await apiClient.get(url);
            
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to filter bug reports');
            }
            
            setBugReports(response.data.bugReports);
            setPagination(response.data.pagination);
            setIsFilterMenuOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while filtering bug reports');
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setFilters({
            status: '',
            severity: '',
            priority: '',
            myReports: false
        });
    };

    const getStatusBadge = (status: string) => {
        let color;
        let icon;
        
        switch(status) {
            case 'OPEN':
                color = 'bg-blue-900/30 text-blue-400';
                icon = <Clock className="h-3 w-3 mr-1" />;
                break;
            case 'CONFIRMED':
            case 'IN_PROGRESS':
                color = 'bg-yellow-900/30 text-yellow-400';
                icon = <AlertTriangle className="h-3 w-3 mr-1" />;
                break;
            case 'FIXED':
                color = 'bg-green-900/30 text-green-400';
                icon = <CheckCircle className="h-3 w-3 mr-1" />;
                break;
            case 'CLOSED':
            case 'WONT_FIX':
                color = 'bg-gray-700/30 text-gray-400';
                icon = <X className="h-3 w-3 mr-1" />;
                break;
            default:
                color = 'bg-gray-900/30 text-gray-400';
                icon = <Clock className="h-3 w-3 mr-1" />;
        }
        
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs inline-flex items-center ${color}`}>
                {icon}
                {status.replace('_', ' ')}
            </span>
        );
    };

    const getSeverityBadge = (severity: string) => {
        let color;
        
        switch(severity) {
            case 'BLOCKER':
                color = 'bg-red-900/30 text-red-400';
                break;
            case 'CRITICAL':
                color = 'bg-red-900/30 text-red-400';
                break;
            case 'MAJOR':
                color = 'bg-orange-900/30 text-orange-400';
                break;
            case 'MINOR':
                color = 'bg-blue-900/30 text-blue-400';
                break;
            case 'TRIVIAL':
                color = 'bg-gray-700/30 text-gray-400';
                break;
            default:
                color = 'bg-gray-900/30 text-gray-400';
        }
        
        return (
            <span className={`px-2 py-0.5 rounded-full text-xs ${color}`}>
                {severity}
            </span>
        );
    };

    const getTimeAgo = (dateString: string): string => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true });
        } catch (error) {
            return "Unknown time";
        }
    };

    const truncateText = (text: string, maxLength: number): string => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="bg-github-dark-secondary rounded-xl p-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Bug Reports</h2>
                
                <div className="relative">
                    <button
                        onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                        className="px-3 py-1 bg-github-dark text-github-text-secondary rounded-md border border-github-border hover:text-white flex items-center space-x-2"
                    >
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                        {(filters.status || filters.severity || filters.priority || filters.myReports) && (
                            <span className="ml-1 w-2 h-2 bg-github-accent rounded-full"></span>
                        )}
                    </button>
                    
                    {isFilterMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-github-dark z-10 rounded-md shadow-lg py-2 border border-github-border">
                            <div className="px-3 py-2">
                                <label className="block text-sm font-medium text-white mb-1">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="w-full px-2 py-1 bg-github-dark-secondary text-github-text-secondary rounded-md border border-github-border focus:outline-none text-sm"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="OPEN">Open</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="FIXED">Fixed</option>
                                    <option value="WONT_FIX">Won't Fix</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                            </div>
                            
                            <div className="px-3 py-2">
                                <label className="block text-sm font-medium text-white mb-1">Severity</label>
                                <select
                                    value={filters.severity}
                                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                                    className="w-full px-2 py-1 bg-github-dark-secondary text-github-text-secondary rounded-md border border-github-border focus:outline-none text-sm"
                                >
                                    <option value="">All Severities</option>
                                    <option value="BLOCKER">Blocker</option>
                                    <option value="CRITICAL">Critical</option>
                                    <option value="MAJOR">Major</option>
                                    <option value="MINOR">Minor</option>
                                    <option value="TRIVIAL">Trivial</option>
                                </select>
                            </div>
                            
                            <div className="px-3 py-2">
                                <label className="block text-sm font-medium text-white mb-1">Priority</label>
                                <select
                                    value={filters.priority}
                                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                    className="w-full px-2 py-1 bg-github-dark-secondary text-github-text-secondary rounded-md border border-github-border focus:outline-none text-sm"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="CRITICAL">Critical</option>
                                    <option value="HIGH">High</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="LOW">Low</option>
                                    <option value="TRIVIAL">Trivial</option>
                                </select>
                            </div>
                            
                            <div className="px-3 py-2">
                                <label className="flex items-center text-sm font-medium text-white">
                                    <input
                                        type="checkbox"
                                        checked={filters.myReports}
                                        onChange={(e) => setFilters({ ...filters, myReports: e.target.checked })}
                                        className="mr-2"
                                    />
                                    My Reports Only
                                </label>
                            </div>
                            
                            <div className="border-t border-github-border mt-2 pt-2 px-3 flex justify-between">
                                <button
                                    onClick={resetFilters}
                                    className="text-github-text-secondary hover:text-white text-sm"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="bg-github-accent text-white px-3 py-1 rounded-md text-sm"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-3">
                {bugReports.length === 0 ? (
                    <div className="flex items-center justify-center py-12 px-4 bg-github-dark rounded-lg">
                        <div className="text-center">
                            <div className="p-3 bg-red-500/20 rounded-full inline-block mb-3">
                                <Bug className="h-6 w-6 text-red-500" />
                            </div>
                            <h3 className="text-white font-medium mb-1">No bug reports found</h3>
                            <p className="text-github-text-secondary text-sm mb-4">
                                {filters.myReports
                                    ? "You haven't reported any bugs yet"
                                    : Object.values(filters).some(Boolean)
                                    ? "No bug reports match your filters"
                                    : "No bugs have been reported yet"}
                            </p>
                            <Link 
                                href="/dashboard/bug-reports/new"
                                className="px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/90 transition-colors inline-flex items-center"
                            >
                                <Bug className="h-4 w-4 mr-2" />
                                Report a Bug
                            </Link>
                        </div>
                    </div>
                ) : (
                    bugReports.map((report) => (
                        <div 
                            key={report.id} 
                            className="bg-github-dark rounded-lg p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <Link href={`/dashboard/bug-reports/${report.id}`}>
                                        <h3 className="text-white font-medium hover:text-github-accent transition-colors">
                                            {report.title}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center mt-1 space-x-2">
                                        <span className="text-xs text-github-text-secondary">
                                            Reported by {report.authorName}
                                        </span>
                                        {report.browser && (
                                            <>
                                                <span className="text-github-text-secondary">•</span>
                                                <span className="text-xs text-github-text-secondary">
                                                    {report.browser} {report.os ? `on ${report.os}` : ''}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-sm text-github-text-secondary mt-2">
                                        {truncateText(report.description, 150)}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                    {getStatusBadge(report.status)}
                                    {getSeverityBadge(report.severity)}
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1 text-sm text-github-text-secondary">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>{report.comments}</span>
                                    </div>
                                    {report.reactions > 0 && (
                                        <div className="flex items-center space-x-1 text-sm text-github-text-secondary">
                                            <span>💬</span>
                                            <span>{report.reactions}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-xs text-github-text-secondary">
                                        {getTimeAgo(report.createdAt)}
                                    </span>
                                    <Link 
                                        href={`/dashboard/bug-reports/${report.id}`}
                                        className="text-xs text-github-accent hover:text-white flex items-center transition-colors"
                                    >
                                        View
                                        <ChevronRight className="h-3 w-3 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                
                {pagination.hasMore && (
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="w-full py-2 bg-github-dark hover:bg-github-dark-secondary/70 text-github-text-secondary rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More Bug Reports'}
                    </button>
                )}
                
                {!pagination.hasMore && bugReports.length > 0 && (
                    <div className="text-center text-github-text-secondary text-sm py-2">
                        End of bug reports
                    </div>
                )}
            </div>
        </div>
    );
}
