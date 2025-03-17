import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';
import { z } from 'zod';

// Define preference types
type PreferenceCategory = 'theme' | 'emailNotifications' | 'pushNotifications' | 'accessibility' | 'privacy' | 'repository' | 'editor' | 'security';

interface UserPreferences {
    theme: string;
    emailNotifications: {
        security: boolean;
        updates: boolean;
        marketing: boolean;
        activityDigest: string;
    };
    pushNotifications: {
        mentions: boolean;
        comments: boolean;
        issues: boolean;
        pullRequests: boolean;
        releases: boolean;
        security: boolean;
    };
    accessibility: {
        reduceMotion: boolean;
        highContrast: boolean;
        fontSize: string;
    };
    privacy: {
        profileVisibility: string;
        showEmail: boolean;
        showActivity: boolean;
        showContributions: boolean;
    };
    repository: {
        defaultVisibility: string;
        defaultLicense: string;
        defaultGitIgnore: string;
        enableIssues: boolean;
        enableProjects: boolean;
        enableWiki: boolean;
    };
    editor: {
        tabSize: number;
        insertSpaces: boolean;
        lineWrapping: boolean;
        lineNumbers: boolean;
        autoSave: boolean;
    };
    security: {
        twoFactorEnabled: boolean;
        sessionTimeout: number;
        requireSigningCommits: boolean;
    };
}

// Default user preferences
const defaultPreferences: UserPreferences = {
    theme: 'system',
    emailNotifications: {
        security: true,
        updates: true,
        marketing: false,
        activityDigest: 'daily',
    },
    pushNotifications: {
        mentions: true,
        comments: true,
        issues: true,
        pullRequests: true,
        releases: true,
        security: true,
    },
    accessibility: {
        reduceMotion: false,
        highContrast: false,
        fontSize: 'medium',
    },
    privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showActivity: true,
        showContributions: true,
    },
    repository: {
        defaultVisibility: 'public',
        defaultLicense: 'MIT',
        defaultGitIgnore: 'Node',
        enableIssues: true,
        enableProjects: true,
        enableWiki: true,
    },
    editor: {
        tabSize: 4,
        insertSpaces: true,
        lineWrapping: false,
        lineNumbers: true,
        autoSave: true,
    },
    security: {
        twoFactorEnabled: false,
        sessionTimeout: 24,
        requireSigningCommits: false,
    }
};

// Schema for reset options
const resetSchema = z.object({
    categories: z.array(
        z.enum([
            'all',
            'theme',
            'emailNotifications',
            'pushNotifications',
            'accessibility',
            'privacy',
            'repository',
            'editor',
            'security'
        ])
    ).optional(),
    confirm: z.literal(true)
});

// POST /api/base/users/[id]/preferences/reset
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if user exists and get current preferences
        const user = await prisma.user.findUnique({
            where: {
                id: params.id,
                deletedAt: null,
            },
            select: {
                id: true,
                preferences: true,
            }
        });

        if (!user) {
            return errors.notFound('User not found');
        }

        // Only allow users to reset their own preferences
        if (user.id !== session.user.id) {
            return errors.forbidden('You can only reset your own preferences');
        }

        // Parse and validate request body
        const body = await req.json();
        const validation = resetSchema.safeParse(body);

        if (!validation.success) {
            return errors.badRequest('Invalid reset options', validation.error);
        }

        const { categories = ['all'] } = validation.data;
        const currentPreferences = user.preferences ?
            (JSON.parse(JSON.stringify(user.preferences)) as UserPreferences) :
            { ...defaultPreferences };
        let updatedPreferences = { ...currentPreferences };

        // Reset all preferences if 'all' is included
        if (categories.includes('all')) {
            updatedPreferences = { ...defaultPreferences };
        } else {
            // Reset only specified categories
            categories.forEach(category => {
                if (category !== 'all' && category in defaultPreferences) {
                    updatedPreferences[category as keyof UserPreferences] = defaultPreferences[category as keyof UserPreferences];
                }
            });
        }

        // Update user preferences
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                preferences: updatedPreferences as any,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                preferences: true,
            }
        });

        // Log the preferences reset activity
        await prisma.userActivity.create({
            data: {
                userId: user.id,
                action: 'USER_PREFERENCES_RESET',
                metadata: {
                    categories,
                },
            }
        });

        return successResponse(updatedUser.preferences, 'User preferences reset successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 