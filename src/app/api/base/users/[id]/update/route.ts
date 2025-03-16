import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@root/prisma/database';
import { validateBody } from '@/utils/validation';
import { errors, handleApiError, successResponse } from '@/utils/responses';
import { z } from 'zod';
import { UserStatus } from '@prisma/client';

const updateProfileSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    displayName: z.string().min(1).max(100).optional(),
    bio: z.string().max(1000).optional().nullable(),
    website: z.string().url().optional().nullable(),
    location: z.string().max(100).optional().nullable(),
    status: z.nativeEnum(UserStatus).optional(),
    statusMessage: z.string().max(100).optional().nullable(),
    preferences: z.record(z.any()).optional(),
});

// PATCH /api/base/users/[id]/update
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return errors.unauthorized();
        }

        // Only allow users to update their own profile
        if (session.user.id !== params.id) {
            return errors.forbidden('You can only update your own profile');
        }

        // Validate request body
        const validation = await validateBody(req, updateProfileSchema);
        if (!validation.success) {
            return errors.badRequest('Invalid profile data', validation.error);
        }

        // If displayName is being updated, check for conflicts
        if (validation.data.displayName) {
            const displayNameExists = await prisma.user.findFirst({
                where: {
                    displayName: validation.data.displayName,
                    id: { not: params.id },
                },
            });

            if (displayNameExists) {
                return errors.conflict('Display name is already taken');
            }
        }

        // Update user profile
        const user = await prisma.user.update({
            where: {
                id: params.id,
            },
            data: validation.data,
            select: {
                id: true,
                name: true,
                displayName: true,
                email: true,
                image: true,
                bio: true,
                website: true,
                location: true,
                createdAt: true,
                lastLoginAt: true,
                lastActiveAt: true,
                status: true,
                statusMessage: true,
                githubUsername: true,
                githubDisplayName: true,
                preferences: true,
                _count: {
                    select: {
                        repositories: true,
                        stars: true,
                        ownedOrgs: true,
                        orgMemberships: true,
                        teamMemberships: true,
                        contributedRepos: true,
                        authoredIssues: true,
                        pullRequests: true,
                    }
                }
            }
        });

        // Log the profile update activity
        await prisma.userActivity.create({
            data: {
                userId: params.id,
                action: 'PROFILE_UPDATE',
                metadata: {
                    updatedFields: Object.keys(validation.data)
                },
                ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || null,
                userAgent: req.headers.get('user-agent'),
            }
        });

        return successResponse({
            ...user,
            repoCount: user._count.repositories,
            starCount: user._count.stars,
            ownedOrgCount: user._count.ownedOrgs,
            orgCount: user._count.orgMemberships,
            teamCount: user._count.teamMemberships,
            contributionCount: user._count.contributedRepos,
            issueCount: user._count.authoredIssues,
            pullRequestCount: user._count.pullRequests,
            _count: undefined,
        }, 'Profile updated successfully');
    } catch (error) {
        return handleApiError(error);
    }
} 