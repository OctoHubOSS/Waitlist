'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bug, ChevronRight, AlertCircle, Clock, CheckCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BugReport {
    id: string;
    title: string;
    status: string;
    severity: string;
    createdAt: string;
    authorName: string;
    comments: number;
}

interface RecentBugReportsSectionProps {
    reports: BugReport[];
}

export function RecentBugReportsSection({ reports }: RecentBugReportsSectionProps) {
    const [expanded, setExpanded] = useState(false);
    
    const displayReports = expanded ? reports : reports.slice(0, 3);
    
    const getStatusIcon = (status: string) => {
        switch(status) {
            case 'OPEN':
                return <Clock className="h-4 w-4 text-blue-400" />;
            case 'CONFIRMED':
            case 'IN_PROGRESS':
                return <AlertCircle className="h-4 w-4 text-yellow-400" />;
            case 'FIXED':
                return <CheckCircle className="h-4 w-4 text-green-400" />;
            case 'CLOSED':
            case 'WONT_FIX':
                return <X className="h-4 w-4 text-gray-400" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch(severity) {
            case 'BLOCKER':
            case 'CRITICAL':
                return 'text-red-400';
            case 'MAJOR':
                return 'text-orange-400';
            case 'MINOR':
                return 'text-blue-400';
            case 'TRIVIAL':
                return 'text-gray-400';
            default:
                return 'text-gray-400';
        }
    };
    
    return (
        <div className="bg-github-dark-secondary rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Bug className="h-5 w-5 text-red-400 mr-2" />
                    <h2 className="text-lg font-semibold text-white">Recent Bug Reports</h2>
                </div>
                <Link
                    href="/dashboard/bug-reports"
                    className="text-github-text-secondary hover:text-white text-sm flex items-center group"
                >
                    View all
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>
            
            {reports.length === 0 ? (
                <div className="text-center py-8 text-github-text-secondary">
                    <p>No bug reports yet</p>
                    <Link
                        href="/dashboard/bug-reports/new"
                        className="text-github-accent hover:underline text-sm mt-2 inline-block"
                    >
                        Report a bug
                    </Link>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {displayReports.map((report) => (
                            <Link 
                                key={report.id}
                                href={`/dashboard/bug-reports/${report.id}`}
                                className="block bg-github-dark p-3 rounded-lg hover:bg-github-dark/70 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 mr-4">
                                        <h3 className="text-white font-medium leading-tight">
                                            {report.title}
                                        </h3>
                                        <p className="text-xs text-github-text-secondary mt-1">
                                            Reported by {report.authorName} • {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 flex flex-col items-end">
                                        <div className="flex items-center">
                                            {getStatusIcon(report.status)}
                                            <span className="text-xs ml-1 text-github-text-secondary">
                                                {report.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="text-xs mt-1">
                                            <span className={`${getSeverityColor(report.severity)}`}>
                                                {report.severity} Severity
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    
                    {reports.length > 3 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="w-full mt-3 text-sm text-github-text-secondary hover:text-white py-2 flex justify-center items-center"
                        >
                            {expanded ? 'Show less' : `Show ${reports.length - 3} more`}
                        </button>
                    )}
                    
                    <div className="mt-4 pt-3 border-t border-github-border flex justify-center">
                        <Link
                            href="/dashboard/bug-reports/new"
                            className="px-3 py-1.5 bg-github-dark hover:bg-github-dark/70 text-github-accent rounded-md transition-colors text-sm inline-flex items-center"
                        >
                            <Bug className="h-4 w-4 mr-1.5" />
                            Report a new bug
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}
