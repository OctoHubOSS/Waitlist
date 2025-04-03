'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createApiClient } from '@/lib/api/client';
import { z } from 'zod';
import { schemas } from '@/lib/api/validation';

const profileSchema = z.object({
    name: schemas.name,
    displayName: schemas.displayName,
    email: schemas.email,
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileSectionProps {
    user: {
        id: string;
        name: string;
        email: string;
        displayName: string | null;
        createdAt: string;
    };
}

export function ProfileSection({ user }: ProfileSectionProps) {
    const { update } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<ProfileFormData>({
        name: user.name,
        displayName: user.displayName || '',
        email: user.email,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const validatedData = profileSchema.parse(formData);
            const apiClient = createApiClient({
                baseUrl: window.location.origin + '/api',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const response = await apiClient.put('/account/profile', validatedData);

            if (!response.success) {
                throw new Error(response.error?.message || 'Failed to update profile');
            }

            // Update the session with new data
            await update();
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while updating your profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-white">Profile</h3>
                <p className="mt-1 text-sm text-github-text-secondary">
                    Update your profile information
                </p>
            </div>

            <div className="bg-github-dark-secondary/50 rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-github-text-secondary mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 bg-github-dark-secondary border border-github-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-github-text-secondary mb-1">
                            Display Name
                        </label>
                        <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                            className="w-full px-3 py-2 bg-github-dark-secondary border border-github-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-github-text-secondary mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 bg-github-dark-secondary border border-github-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-github-accent focus:border-transparent"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    {success && (
                        <div className="text-green-500 text-sm">Profile updated successfully!</div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-github-accent text-white rounded-lg hover:bg-github-accent/90 focus:outline-none focus:ring-2 focus:ring-github-accent focus:ring-offset-2 focus:ring-offset-github-dark disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 