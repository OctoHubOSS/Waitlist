'use client';

import { useState, useEffect } from 'react';
import { createApiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';
import { Bug, Send, X, Info } from 'lucide-react';
import { Priority, Severity } from '@prisma/client';

export function BugReportForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        steps: '',
        expected: '',
        actual: '',
        severity: 'MINOR' as Severity,
        priority: 'MEDIUM' as Priority,
        browser: '',
        os: '',
        device: '',
        version: '',
        environment: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Auto-detect browser info
    useEffect(() => {
        const userAgent = navigator.userAgent;
        
        // Simple browser detection
        let browser = 'Unknown';
        if (/firefox/i.test(userAgent)) browser = 'Firefox';
        else if (/chrome/i.test(userAgent)) browser = 'Chrome';
        else if (/safari/i.test(userAgent)) browser = 'Safari';
        else if (/edge/i.test(userAgent)) browser = 'Edge';
        else if (/opera|opr/i.test(userAgent)) browser = 'Opera';
        
        // Simple OS detection
        let os = 'Unknown';
        if (/windows/i.test(userAgent)) os = 'Windows';
        else if (/macintosh|mac os/i.test(userAgent)) os = 'MacOS';
        else if (/linux/i.test(userAgent)) os = 'Linux';
        else if (/android/i.test(userAgent)) os = 'Android';
        else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
        
        // Device type
        let device = 'Desktop';
        if (/mobile|iphone|ipod|android.*mobile/i.test(userAgent)) device = 'Mobile';
        else if (/ipad|android(?!.*mobile)/i.test(userAgent)) device = 'Tablet';
        
        setFormData(prev => ({
            ...prev,
            browser,
            os,
            device
        }));
    }, []);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.title.trim().length < 3) {
            setError('Title must be at least 3 characters long');
            return;
        }
        
        if (formData.description.trim().length < 10) {
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
            
            const response = await apiClient.post('/dashboard/bug-reports', formData);
            
            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to submit bug report');
            }
            
            // Redirect to the bug reports list
            router.push('/dashboard/bug-reports');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while submitting the bug report');
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
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Brief summary of the issue"
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
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Detailed description of the issue"
                        className="w-full px-4 py-2 bg-github-dark border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent min-h-[120px] resize-y"
                        required
                        minLength={10}
                        maxLength={2000}
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="steps" className="block text-sm font-medium text-white mb-1">
                            Steps to Reproduce
                        </label>
                        <textarea
                            id="steps"
                            name="steps"
                            value={formData.steps}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="1. Go to...\n2. Click on...\n3. Observe..."
                            className="w-full px-4 py-2 bg-github-dark border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent min-h-[120px] resize-y"
                        />
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="expected" className="block text-sm font-medium text-white mb-1">
                                Expected Behavior
                            </label>
                            <textarea
                                id="expected"
                                name="expected"
                                value={formData.expected}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="What should have happened"
                                className="w-full px-4 py-2 bg-github-dark border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent min-h-[50px] resize-y"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="actual" className="block text-sm font-medium text-white mb-1">
                                Actual Behavior
                            </label>
                            <textarea
                                id="actual"
                                name="actual"
                                value={formData.actual}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="What actually happened"
                                className="w-full px-4 py-2 bg-github-dark border border-github-border rounded-lg text-white placeholder-github-text-secondary focus:outline-none focus:ring-2 focus:ring-github-accent min-h-[50px] resize-y"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="severity" className="block text-sm font-medium text-white mb-1">
                            Severity
                        </label>
                        <select
                            id="severity"
                            name="severity"
                            value={formData.severity}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-github-dark border border-github-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-github-accent"
                        >
                            <option value="BLOCKER">Blocker - Application unusable</option>
                            <option value="CRITICAL">Critical - Major functionality broken</option>
                            <option value="MAJOR">Major - Important function affected</option>
                            <option value="MINOR">Minor - Minor loss of function</option>
                            <option value="TRIVIAL">Trivial - Cosmetic issue</option>
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium text-white mb-1">
                            Priority
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-4 py-2 bg-github-dark border border-github-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-github-accent"
                        >
                            <option value="CRITICAL">Critical - Needs immediate attention</option>
                            <option value="HIGH">High - Address as soon as possible</option>
                            <option value="MEDIUM">Medium - Normal priority</option>
                            <option value="LOW">Low - Address when time permits</option>
                            <option value="TRIVIAL">Trivial - No rush</option>
                        </select>
                    </div>
                </div>
                
                <div className="bg-github-dark/50 p-4 rounded-lg border border-github-border/50">
                    <div className="flex items-center mb-3">
                        <Info className="h-4 w-4 text-github-accent mr-2" />
                        <h3 className="text-sm font-medium text-white">System Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="browser" className="block text-xs text-github-text-secondary mb-1">
                                Browser
                            </label>
                            <input
                                type="text"
                                id="browser"
                                name="browser"
                                value={formData.browser}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-3 py-1.5 bg-github-dark border border-github-border rounded-md text-white text-sm"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="os" className="block text-xs text-github-text-secondary mb-1">
                                Operating System
                            </label>
                            <input
                                type="text"
                                id="os"
                                name="os"
                                value={formData.os}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-3 py-1.5 bg-github-dark border border-github-border rounded-md text-white text-sm"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="device" className="block text-xs text-github-text-secondary mb-1">
                                Device Type
                            </label>
                            <input
                                type="text"
                                id="device"
                                name="device"
                                value={formData.device}
                                onChange={handleChange}
                                disabled={loading}
                                className="w-full px-3 py-1.5 bg-github-dark border border-github-border rounded-md text-white text-sm"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label htmlFor="version" className="block text-xs text-github-text-secondary mb-1">
                                App Version
                            </label>
                            <input
                                type="text"
                                id="version"
                                name="version"
                                value={formData.version}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="e.g., 1.0.0"
                                className="w-full px-3 py-1.5 bg-github-dark border border-github-border rounded-md text-white text-sm"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="environment" className="block text-xs text-github-text-secondary mb-1">
                                Environment
                            </label>
                            <input
                                type="text"
                                id="environment"
                                name="environment"
                                value={formData.environment}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="e.g., Production, Development"
                                className="w-full px-3 py-1.5 bg-github-dark border border-github-border rounded-md text-white text-sm"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-4 py-2 bg-github-dark text-github-text-secondary rounded-lg hover:text-white transition-colors disabled:opacity-50 flex items-center"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/90 transition-colors disabled:opacity-50 flex items-center"
                    >
                        <Bug className="h-4 w-4 mr-2" />
                        {loading ? 'Submitting...' : 'Submit Bug Report'}
                    </button>
                </div>
            </form>
        </div>
    );
}
