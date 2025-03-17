import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';
import { z } from 'zod';

// Preference validation schemas
const themeSchema = z.enum(['system', 'light', 'dark']);
const emailDigestSchema = z.enum(['none', 'daily', 'weekly']);
const fontSizeSchema = z.enum(['small', 'medium', 'large']);
const visibilitySchema = z.enum(['public', 'private', 'organization-only']);
const repoVisibilitySchema = z.enum(['public', 'private']);

const preferencesSchema = z.object({
    theme: themeSchema.optional(),
    emailNotifications: z.object({
        security: z.boolean().optional(),
        updates: z.boolean().optional(),
        marketing: z.boolean().optional(),
        activityDigest: emailDigestSchema.optional(),
    }).optional(),
    pushNotifications: z.object({
        mentions: z.boolean().optional(),
        comments: z.boolean().optional(),
        issues: z.boolean().optional(),
        pullRequests: z.boolean().optional(),
        releases: z.boolean().optional(),
        security: z.boolean().optional(),
    }).optional(),
    accessibility: z.object({
        reduceMotion: z.boolean().optional(),
        highContrast: z.boolean().optional(),
        fontSize: fontSizeSchema.optional(),
    }).optional(),
    privacy: z.object({
        profileVisibility: visibilitySchema.optional(),
        showEmail: z.boolean().optional(),
        showActivity: z.boolean().optional(),
        showContributions: z.boolean().optional(),
    }).optional(),
    repository: z.object({
        defaultVisibility: repoVisibilitySchema.optional(),
        defaultLicense: z.string().optional(),
        defaultGitIgnore: z.string().optional(),
        enableIssues: z.boolean().optional(),
        enableProjects: z.boolean().optional(),
        enableWiki: z.boolean().optional(),
    }).optional(),
    editor: z.object({
        tabSize: z.number().min(1).max(8).optional(),
        insertSpaces: z.boolean().optional(),
        lineWrapping: z.boolean().optional(),
        lineNumbers: z.boolean().optional(),
        autoSave: z.boolean().optional(),
    }).optional(),
    security: z.object({
        twoFactorEnabled: z.boolean().optional(),
        sessionTimeout: z.number().min(1).max(168).optional(), // 1 hour to 1 week
        requireSigningCommits: z.boolean().optional(),
    }).optional(),
});

// PATCH /api/base/users/[id]/preferences/update
export async function PATCH(
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

        // Only allow users to update their own preferences
        if (user.id !== session.user.id) {
            return errors.forbidden('You can only update your own preferences');
        }

        // Parse and validate request body
        const body = await req.json();
        const validation = preferencesSchema.safeParse(body);

        if (!validation.success) {
            return errors.badRequest('Invalid preferences data', validation.error);
        }

        // Merge new preferences with existing ones
        const currentPreferences = (user.preferences as object) || {};
        const updatedPreferences = {
            ...currentPreferences,
            ...validation.data,
        };

        // Update user preferences
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                preferences: updatedPreferences,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                preferences: true,
            }
        });

        // Log the preferences update activity
        await prisma.userActivity.create({
            data: {
                userId: user.id,
                action: 'USER_PREFERENCES_UPDATE',
                metadata: {
                    changes: validation.data,
                },
            }
        });

        return successResponse(updatedUser.preferences, 'User preferences updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 