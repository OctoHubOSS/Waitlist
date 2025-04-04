'use client';

import { useState } from 'react';
import { createApiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { Send, X } from 'lucide-react';

export function FeatureRequestForm() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (title.trim().length < 3) {
            setError('Title must be at least 3 characters long');
            return;
        }
        
        if (description.trim().length < 10) {
            setError('Description must be at least 10 characters long');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            const response = await apiClient.post('/dashboard/feature-requests', {
                title: title.trim(),
                description: description.trim()
            });
            
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to submit feature request');
            }
            
            // Redirect to the feature request list or the created request
            router.push('/dashboard/feature-requests');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while submitting the feature request');
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancel = () => {
        router.back();
    };
    
    return (
        <div className="bg-github-dark-secondary rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-900/30 border border-red-900 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}
                
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-white mb-1">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={loading}
                        placeholder="Briefly describe the feature you'd like to see"
                        className="w-full px-4 py-2 bg-github-dark border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent"
                        required
                        minLength={3}
                        maxLength={100}
                    />
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-white mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                        placeholder="Provide details about how this feature would work and why it would be valuable"
                        className="w-full px-4 py-2 bg-github-dark border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent min-h-[200px] resize-y"
                        required
                        minLength={10}
                        maxLength={2000}
                    />
                    <div className="text-right mt-1 text-xs text-github-text-secondary">
                        {description.length}/2000 characters
                    </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-4 py-2 bg-github-dark text-github-text-secondary rounded-lg hover:text-white transition-colors disabled:opacity-50"
                    >
                        <div className="flex items-center">
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </div>
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/90 transition-colors disabled:opacity-50"
                    >
                        <div className="flex items-center">
                            <Send className="h-4 w-4 mr-2" />
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </div>
                    </button>
                </div>
            </form>
        </div>
    );
}
