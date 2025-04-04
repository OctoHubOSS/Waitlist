'use client';

import { useState } from 'react';
import { createApiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { ThumbsUp, MessageSquare, Send, AlertCircle, Clock, Check, RefreshCw, X } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface FeatureRequest {
    id: string;
    title: string;
    description: string;
    status: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    updatedAt: string;
    upvotes: number;
    isUserUpvoted: boolean;
}

interface Comment {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    updatedAt: string;
}

interface FeatureRequestDetailProps {
    request: FeatureRequest;
    comments: Comment[];
}

export function FeatureRequestDetail({ request, comments: initialComments }: FeatureRequestDetailProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isUpvoted, setIsUpvoted] = useState(request.isUserUpvoted);
    const [upvotes, setUpvotes] = useState(request.upvotes);
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const toggleUpvote = async () => {
        try {
            // Optimistically update UI
            setIsUpvoted(!isUpvoted);
            setUpvotes(isUpvoted ? upvotes - 1 : upvotes + 1);
            
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const response = await apiClient.post(`/feature-requests/${request.id}/upvote`, {
                upvote: !isUpvoted
            });
            
            if (!response.success) {
                // Revert if the API call fails
                setIsUpvoted(isUpvoted);
                setUpvotes(upvotes);
                throw new Error(response.error?.message || 'Failed to update upvote');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while updating upvote');
        }
    };
    
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
            
            const response = await apiClient.post(`/feature-requests/${request.id}/comments`, {
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
    
    const getStatusBadge = (status: string) => {
        let color;
        let icon;
        
        switch(status) {
            case 'OPEN':
                color = 'bg-blue-900/30 text-blue-400';
                icon = <Clock className="h-4 w-4 mr-1" />;
                break;
            case 'UNDER_REVIEW':
                color = 'bg-yellow-900/30 text-yellow-400';
                icon = <RefreshCw className="h-4 w-4 mr-1" />;
                break;
            case 'PLANNED':
            case 'IN_PROGRESS':
                color = 'bg-green-900/30 text-green-400';
                icon = <RefreshCw className="h-4 w-4 mr-1" />;
                break;
            case 'COMPLETED':
                color = 'bg-github-accent/30 text-github-accent';
                icon = <Check className="h-4 w-4 mr-1" />;
                break;
            case 'DECLINED':
                color = 'bg-red-900/30 text-red-400';
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
    
    const formatDate = (dateString: string): string => {
        try {
            return format(new Date(dateString), 'MMM d, yyyy h:mm a');
        } catch (error) {
            return "Unknown date";
        }
    };
    
    return (
        <div className="space-y-6">
            {/* Feature Request Detail Card */}
            <div className="bg-github-dark-secondary rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">{request.title}</h2>
                    {getStatusBadge(request.status)}
                </div>
                
                <div className="flex items-center text-github-text-secondary text-sm mb-6 space-x-4">
                    <span>Submitted by {request.authorName}</span>
                    <span>•</span>
                    <span>{formatDate(request.createdAt)}</span>
                </div>
                
                <div className="bg-github-dark rounded-lg p-4 mb-6">
                    <p className="text-github-text-primary whitespace-pre-wrap">
                        {request.description}
                    </p>
                </div>
                
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={toggleUpvote}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md ${
                            isUpvoted 
                                ? 'bg-github-accent/20 text-github-accent' 
                                : 'text-github-text-secondary hover:bg-github-dark hover:text-white'
                        }`}
                    >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{upvotes} Upvotes</span>
                    </button>
                    
                    <div className="flex items-center space-x-2 text-github-text-secondary">
                        <MessageSquare className="h-4 w-4" />
                        <span>{comments.length} Comments</span>
                    </div>
                    
                    <Link
                        href="/dashboard/feature-requests"
                        className="ml-auto text-sm text-github-text-secondary hover:text-white"
                    >
                        Back to all requests
                    </Link>
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
                            placeholder="Share your thoughts on this feature request..."
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
