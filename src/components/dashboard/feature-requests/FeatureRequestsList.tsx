'use client';

import { useState } from 'react';
import { createApiClient } from '@/lib/api/client';
import { ThumbsUp, MessageSquare, Clock, Check, RefreshCw, X, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface FeatureRequest {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    upvotes: number;
    comments: number;
    isUserUpvoted: boolean;
}

interface Pagination {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

interface FeatureRequestsListProps {
    initialFeatureRequests: FeatureRequest[];
    initialPagination: Pagination;
}

export function FeatureRequestsList({ initialFeatureRequests, initialPagination }: FeatureRequestsListProps) {
    const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>(initialFeatureRequests);
    const [pagination, setPagination] = useState<Pagination>(initialPagination);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string | null>(null);
    const [myRequests, setMyRequests] = useState(false);

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
            let url = `/dashboard/feature-requests?page=${nextPage}&pageSize=${pagination.pageSize}`;
            
            if (filter) {
                url += `&status=${filter}`;
            }
            
            if (myRequests) {
                url += '&myRequests=true';
            }
            
            const response = await apiClient.get(url);
            
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to load more feature requests');
            }
            
            setFeatureRequests(prev => [...prev, ...response.data.featureRequests]);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while loading more feature requests');
        } finally {
            setLoading(false);
        }
    };

    const toggleUpvote = async (id: string) => {
        try {
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const request = featureRequests.find(r => r.id === id);
            if (!request) return;
            
            const isCurrentlyUpvoted = request.isUserUpvoted;
            
            // Optimistically update the UI
            setFeatureRequests(prev => 
                prev.map(fr => 
                    fr.id === id ? { 
                        ...fr, 
                        isUserUpvoted: !isCurrentlyUpvoted,
                        upvotes: isCurrentlyUpvoted ? fr.upvotes - 1 : fr.upvotes + 1
                    } : fr
                )
            );
            
            // Make the actual API call
            const response = await apiClient.post(`/feature-requests/${id}/upvote`, {
                upvote: !isCurrentlyUpvoted
            });
            
            if (!response.success) {
                // Revert the optimistic update if the API call fails
                setFeatureRequests(prev => 
                    prev.map(fr => 
                        fr.id === id ? { 
                            ...fr, 
                            isUserUpvoted: isCurrentlyUpvoted,
                            upvotes: isCurrentlyUpvoted ? fr.upvotes + 1 : fr.upvotes - 1
                        } : fr
                    )
                );
                throw new Error(response.error?.message || 'Failed to update upvote');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while updating upvote');
        }
    };

    const applyFilter = async (statusFilter: string | null, showMyRequests: boolean) => {
        setLoading(true);
        setError(null);
        
        try {
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            let url = `/dashboard/feature-requests?page=1&pageSize=${pagination.pageSize}`;
            
            if (statusFilter) {
                url += `&status=${statusFilter}`;
            }
            
            if (showMyRequests) {
                url += '&myRequests=true';
            }
            
            const response = await apiClient.get(url);
            
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to filter feature requests');
            }
            
            setFeatureRequests(response.data.featureRequests);
            setPagination(response.data.pagination);
            setFilter(statusFilter);
            setMyRequests(showMyRequests);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while filtering feature requests');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        let color;
        let icon;
        
        switch(status) {
            case 'OPEN':
                color = 'bg-blue-900/30 text-blue-400';
                icon = <Clock className="h-3 w-3 mr-1" />;
                break;
            case 'UNDER_REVIEW':
                color = 'bg-yellow-900/30 text-yellow-400';
                icon = <RefreshCw className="h-3 w-3 mr-1" />;
                break;
            case 'PLANNED':
            case 'IN_PROGRESS':
                color = 'bg-green-900/30 text-green-400';
                icon = <RefreshCw className="h-3 w-3 mr-1" />;
                break;
            case 'COMPLETED':
                color = 'bg-github-accent/30 text-github-accent';
                icon = <Check className="h-3 w-3 mr-1" />;
                break;
            case 'DECLINED':
                color = 'bg-red-900/30 text-red-400';
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
                <h2 className="text-lg font-semibold text-white">Feature Requests</h2>
                <div className="flex items-center space-x-2">
                    <select
                        value={filter || ''}
                        onChange={(e) => applyFilter(e.target.value || null, myRequests)}
                        className="px-3 py-1 bg-github-dark text-github-text-secondary rounded-md border border-github-border focus:outline-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="PLANNED">Planned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="DECLINED">Declined</option>
                    </select>
                    
                    <button
                        onClick={() => applyFilter(filter, !myRequests)}
                        className={`px-3 py-1 text-sm rounded-md ${
                            myRequests 
                                ? 'bg-github-accent text-white'
                                : 'text-github-text-secondary hover:text-white border border-github-border'
                        }`}
                    >
                        My Requests
                    </button>
                </div>
            </div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-3">
                {featureRequests.length === 0 ? (
                    <div className="flex items-center justify-center py-12 px-4 bg-github-dark rounded-lg">
                        <div className="text-center">
                            <div className="p-3 bg-github-accent/20 rounded-full inline-block mb-3">
                                <MessageSquare className="h-6 w-6 text-github-accent" />
                            </div>
                            <h3 className="text-white font-medium mb-1">No feature requests found</h3>
                            <p className="text-github-text-secondary text-sm mb-4">
                                {myRequests
                                    ? "You haven't submitted any feature requests yet"
                                    : "No feature requests match your filters"}
                            </p>
                            <Link 
                                href="/dashboard/feature-requests/new"
                                className="px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/90 transition-colors inline-flex items-center"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Submit a Request
                            </Link>
                        </div>
                    </div>
                ) : (
                    featureRequests.map((request) => (
                        <div 
                            key={request.id} 
                            className="bg-github-dark rounded-lg p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <Link href={`/dashboard/feature-requests/${request.id}`}>
                                        <h3 className="text-white font-medium hover:text-github-accent transition-colors">
                                            {request.title}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-github-text-secondary mt-1">
                                        {truncateText(request.description, 150)}
                                    </p>
                                </div>
                                <div>
                                    {getStatusBadge(request.status)}
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <button 
                                        className={`flex items-center space-x-1 text-sm ${
                                            request.isUserUpvoted 
                                                ? 'text-github-accent' 
                                                : 'text-github-text-secondary hover:text-white'
                                        }`}
                                        onClick={() => toggleUpvote(request.id)}
                                    >
                                        <ThumbsUp className="h-4 w-4" />
                                        <span>{request.upvotes}</span>
                                    </button>
                                    <div className="flex items-center space-x-1 text-sm text-github-text-secondary">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>{request.comments}</span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-xs text-github-text-secondary">
                                        {getTimeAgo(request.createdAt)}
                                    </span>
                                    <Link 
                                        href={`/dashboard/feature-requests/${request.id}`}
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
                        {loading ? 'Loading...' : 'Load More Feature Requests'}
                    </button>
                )}
                
                {!pagination.hasMore && featureRequests.length > 0 && (
                    <div className="text-center text-github-text-secondary text-sm py-2">
                        End of feature requests
                    </div>
                )}
            </div>
        </div>
    );
}
