import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';

// Default user preferences
const defaultPreferences = {
    theme: 'system', // system, light, dark
    emailNotifications: {
        security: true,
        updates: true,
        marketing: false,
        activityDigest: 'daily', // none, daily, weekly
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
        fontSize: 'medium', // small, medium, large
    },
    privacy: {
        profileVisibility: 'public', // public, private, organization-only
        showEmail: false,
        showActivity: true,
        showContributions: true,
    },
    repository: {
        defaultVisibility: 'public', // public, private
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
        sessionTimeout: 24, // hours
        requireSigningCommits: false,
    }
};

// GET /api/base/users/[id]/preferences
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Check if user exists
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

        // Only allow users to view their own preferences
        if (user.id !== session.user.id) {
            return errors.forbidden('You can only view your own preferences');
        }

        // Merge default preferences with user's saved preferences
        const preferences = {
            ...defaultPreferences,
            ...(user.preferences as object || {}),
        };

        return successResponse(preferences, 'User preferences retrieved successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 