import { NextRequest } from 'next/server';
import prisma from '@root/prisma/database';
import { errors, handleApiError, successResponse } from '@/lib/api/responses';
import { ApiClient } from '@/lib/api/client';
import { withOptionalAuth } from '@/lib/api/middlewares/auth';

// Create API client instance
const api = new ApiClient(prisma);

// GET /api/base/users/[id]
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        return api.handler(withOptionalAuth(async (context) => {
            // Define base select object for public data
            const baseSelect = {
                id: true,
                name: true,
                displayName: true,
                image: true,
                bio: true,
                website: true,
                location: true,
                createdAt: true,
                status: true,
                statusMessage: true,
                githubUsername: true,
                githubDisplayName: true,
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
            };

            // Add private fields for authenticated users
            const select = context.data.auth.authenticated ? {
                ...baseSelect,
                email: true,
                lastLoginAt: true,
                lastActiveAt: true,
            } : baseSelect;

            const user = await prisma.user.findUnique({
                where: {
                    id: params.id,
                    deletedAt: null,
                },
                select
            });

            if (!user) {
                return errors.notFound('User not found');
            }

            // Get user's recent activity (limited for anonymous users)
            const activityLimit = context.data.auth.authenticated ? 10 : 5;
            const recentActivity = await prisma.userActivity.findMany({
                where: {
                    userId: params.id,
                    // Only public activity for anonymous users
                    ...(context.data.auth.authenticated ? {} : {
                        isPublic: true
                    })
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: activityLimit,
                select: {
                    id: true,
                    action: true,
                    metadata: true,
                    createdAt: true,
                }
            });

            // Get user's organizations (limited for anonymous users)
            const orgsLimit = context.data.auth.authenticated ? 5 : 3;
            const organizations = await prisma.orgMembership.findMany({
                where: {
                    userId: params.id,
                    // Only public organizations for anonymous users
                    ...(context.data.auth.authenticated ? {} : {
                        organization: {
                            isPublic: true
                        }
                    })
                },
                select: {
                    role: true,
                    organization: {
                        select: {
                            id: true,
                            name: true,
                            displayName: true,
                            avatarUrl: true,
                            isPublic: true,
                        }
                    }
                },
                take: orgsLimit,
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
                recentActivity,
                organizations: organizations.map(org => ({
                    ...org.organization,
                    role: org.role
                }))
            }, 'User profile retrieved successfully');
        }))(api.createContext(req, params));
    } catch (error) {
        return handleApiError(error);
    }
} 