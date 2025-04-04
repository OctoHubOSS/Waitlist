'use client';

import { useState } from 'react';
import { createApiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { 
    ThumbsUp, MessageSquare, Send, AlertCircle, 
    Clock, Check, RefreshCw, X, ArrowLeft,
    Heart, Smile, ThumbsDown, Eye, Rocket
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ReactionType } from '@prisma/client';

interface BugReport {
    id: string;
    title: string;
    description: string;
    steps: string | null;
    expected: string | null;
    actual: string | null;
    status: string;
    priority: string;
    severity: string;
    browser: string | null;
    os: string | null;
    device: string | null;
    version: string | null;
    environment: string | null;
    authorId: string;
    authorName: string;
    createdAt: string;
    updatedAt: string;
    reactions: number;
    userReaction: string | null;
}

interface Comment {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    updatedAt: string;
}

interface BugReportDetailProps {
    bugReport: BugReport;
    comments: Comment[];
}

export function BugReportDetail({ bugReport, comments: initialComments }: BugReportDetailProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [userReaction, setUserReaction] = useState<string | null>(bugReport.userReaction);
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [reactionLoading, setReactionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const submitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newComment.trim().length < 1) {
            return;
        }
        
        setCommentLoading(true);
        setError(null);
        
        try {
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const response = await apiClient.post(`/dashboard/bug-reports/${bugReport.id}/comments`, {
                content: newComment.trim()
            });
            
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to submit comment');
            }
            
            // Add the new comment to the list
            setComments([
                ...comments,
                response.data.comment
            ]);
            setNewComment('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while submitting your comment');
        } finally {
            setCommentLoading(false);
        }
    };
    
    const handleReaction = async (type: ReactionType) => {
        if (reactionLoading) return;
        
        setReactionLoading(type);
        
        try {
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const response = await apiClient.post(`/dashboard/bug-reports/${bugReport.id}/reactions`, {
                type
            });
            
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to add reaction');
            }
            
            // Toggle the reaction state
            setUserReaction(userReaction === type ? null : type);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while adding reaction');
        } finally {
            setReactionLoading(null);
        }
    };
    
    const getStatusBadge = (status: string) => {
        let color;
        let icon;
        
        switch(status) {
            case 'OPEN':
                color = 'bg-blue-900/30 text-blue-400';
                icon = <Clock className="h-4 w-4 mr-1" />;
                break;
            case 'CONFIRMED':
            case 'IN_PROGRESS':
                color = 'bg-yellow-900/30 text-yellow-400';
                icon = <RefreshCw className="h-4 w-4 mr-1" />;
                break;
            case 'FIXED':
                color = 'bg-green-900/30 text-green-400';
                icon = <Check className="h-4 w-4 mr-1" />;
                break;
            case 'CLOSED':
            case 'WONT_FIX':
                color = 'bg-gray-700/30 text-gray-400';
                icon = <X className="h-4 w-4 mr-1" />;
                break;
            default:
                color = 'bg-gray-900/30 text-gray-400';
                icon = <Clock className="h-4 w-4 mr-1" />;
        }
        
        return (
            <span className={`px-3 py-1 rounded-md text-sm inline-flex items-center ${color}`}>
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
            <span className={`px-3 py-1 rounded-md text-sm ${color}`}>
                Severity: {severity}
            </span>
        );
    };
    
    const getPriorityBadge = (priority: string) => {
        let color;
        
        switch(priority) {
            case 'CRITICAL':
                color = 'bg-purple-900/30 text-purple-400';
                break;
            case 'HIGH':
                color = 'bg-pink-900/30 text-pink-400';
                break;
            case 'MEDIUM':
                color = 'bg-indigo-900/30 text-indigo-400';
                break;
            case 'LOW':
                color = 'bg-cyan-900/30 text-cyan-400';
                break;
            case 'TRIVIAL':
                color = 'bg-gray-700/30 text-gray-400';
                break;
            default:
                color = 'bg-gray-900/30 text-gray-400';
        }
        
        return (
            <span className={`px-3 py-1 rounded-md text-sm ${color}`}>
                Priority: {priority}
            </span>
        );
    };
    
    const formatDate = (dateString: string): string => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy h:mm a');
        } catch (error) {
            return "Unknown date";
        }
    };
    
    const getReactionIcon = (type: ReactionType) => {
        switch (type) {
            case 'LIKE':
                return <ThumbsUp className="h-4 w-4" />;
            case 'DISLIKE':
                return <ThumbsDown className="h-4 w-4" />;
            case 'LAUGH':
                return <Smile className="h-4 w-4" />;
            case 'HEART':
                return <Heart className="h-4 w-4" />;
            case 'ROCKET':
                return <Rocket className="h-4 w-4" />;
            case 'EYES':
                return <Eye className="h-4 w-4" />;
            default:
                return <ThumbsUp className="h-4 w-4" />;
        }
    };
    
    return (
        <div className="space-y-6">
            {/* Bug Report Detail Card */}
            <div className="bg-github-dark-secondary rounded-xl p-6">
                <div className="mb-4">
                    <Link 
                        href="/dashboard/bug-reports" 
                        className="text-github-text-secondary hover:text-white flex items-center text-sm mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Bug Reports
                    </Link>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h2 className="text-xl font-semibold text-white">{bugReport.title}</h2>
                        {getStatusBadge(bugReport.status)}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        {getSeverityBadge(bugReport.severity)}
                        {getPriorityBadge(bugReport.priority)}
                    </div>
                    
                    <div className="flex items-center text-github-text-secondary text-sm mb-6 space-x-4">
                        <span>Reported by {bugReport.authorName}</span>
                        <span>•</span>
                        <span>{formatDate(bugReport.createdAt)}</span>
                    </div>
                    
                    <div className="bg-github-dark rounded-lg p-4 mb-6">
                        <p className="text-github-text-primary whitespace-pre-wrap">
                            {bugReport.description}
                        </p>
                    </div>
                    
                    {/* System Info */}
                    <div className="bg-github-dark/50 p-4 rounded-lg border border-github-border/50 mb-6">
                        <h3 className="text-sm font-medium text-white mb-3">System Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            {bugReport.browser && (
                                <div>
                                    <span className="text-github-text-secondary">Browser:</span>
                                    <span className="ml-2 text-white">{bugReport.browser}</span>
                                </div>
                            )}
                            
                            {bugReport.os && (
                                <div>
                                    <span className="text-github-text-secondary">OS:</span>
                                    <span className="ml-2 text-white">{bugReport.os}</span>
                                </div>
                            )}
                            
                            {bugReport.device && (
                                <div>
                                    <span className="text-github-text-secondary">Device:</span>
                                    <span className="ml-2 text-white">{bugReport.device}</span>
                                </div>
                            )}
                            
                            {bugReport.version && (
                                <div>
                                    <span className="text-github-text-secondary">Version:</span>
                                    <span className="ml-2 text-white">{bugReport.version}</span>
                                </div>
                            )}
                            
                            {bugReport.environment && (
                                <div>
                                    <span className="text-github-text-secondary">Environment:</span>
                                    <span className="ml-2 text-white">{bugReport.environment}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Repro Steps, Expected and Actual Behavior */}
                    {(bugReport.steps || bugReport.expected || bugReport.actual) && (
                        <div className="space-y-4 mb-6">
                            {bugReport.steps && (
                                <div>
                                    <h3 className="text-sm font-medium text-white mb-2">Steps to Reproduce</h3>
                                    <div className="bg-github-dark p-3 rounded-lg">
                                        <p className="text-github-text-primary whitespace-pre-wrap text-sm">
                                            {bugReport.steps}
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {bugReport.expected && (
                                    <div>
                                        <h3 className="text-sm font-medium text-white mb-2">Expected Behavior</h3>
                                        <div className="bg-github-dark p-3 rounded-lg h-full">
                                            <p className="text-github-text-primary whitespace-pre-wrap text-sm">
                                                {bugReport.expected}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                {bugReport.actual && (
                                    <div>
                                        <h3 className="text-sm font-medium text-white mb-2">Actual Behavior</h3>
                                        <div className="bg-github-dark p-3 rounded-lg h-full">
                                            <p className="text-github-text-primary whitespace-pre-wrap text-sm">
                                                {bugReport.actual}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Reactions */}
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-white mb-2">Reactions</h3>
                        <div className="flex flex-wrap gap-2">
                            {(['LIKE', 'HEART', 'LAUGH', 'ROCKET', 'EYES'] as ReactionType[]).map(type => (
                                <button
                                    key={type}
                                    onClick={() => handleReaction(type)}
                                    disabled={!!reactionLoading}
                                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md ${
                                        userReaction === type 
                                            ? 'bg-github-accent/20 text-github-accent' 
                                            : 'bg-github-dark hover:bg-github-dark-secondary text-github-text-secondary hover:text-white'
                                    } transition-colors`}
                                >
                                    {getReactionIcon(type)}
                                    <span className="ml-1">{type.charAt(0) + type.slice(1).toLowerCase()}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Comments Section */}
            <div className="bg-github-dark-secondary rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                </h3>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400 text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {error}
                    </div>
                )}
                
                {/* Comment List */}
                <div className="space-y-4 mb-6">
                    {comments.length === 0 ? (
                        <div className="bg-github-dark rounded-lg p-4 text-github-text-secondary text-center">
                            No comments yet. Be the first to share your thoughts!
                        </div>
                    ) : (
                        comments.map((comment) => (
                            <div key={comment.id} className="bg-github-dark rounded-lg p-4">
                                <div className="flex items-center text-sm text-github-text-secondary mb-2">
                                    <span className="font-medium text-white">{comment.authorName}</span>
                                    <span className="mx-2">•</span>
                                    <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                                </div>
                                <p className="text-github-text-primary whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>
                
                {/* New Comment Form */}
                {session && (
                    <form onSubmit={submitComment} className="mt-6">
                        <label htmlFor="comment" className="block text-sm font-medium text-white mb-1">
                            Add your comment
                        </label>
                        <textarea
                            id="comment"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={commentLoading}
                            placeholder="Share your thoughts or additional information..."
                            className="w-full px-4 py-2 bg-github-dark border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent min-h-[120px] resize-y mb-3"
                            required
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={commentLoading || newComment.trim().length === 0}
                                className="px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/90 transition-colors disabled:opacity-50 flex items-center"
                            >
                                <Send className="h-4 w-4 mr-2" />
                                {commentLoading ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
