import prisma from '@root/prisma/database';
import { ApiClient } from '@/lib/api/client';
import { apiSchemas, validateQuery } from '@/lib/api/validation';
import { errors } from '@/lib/api/responses';
import { cache } from '@/lib/api/cache';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

const api = new ApiClient(prisma);

type Suggestion = {
    type: 'repository' | 'user' | 'organization' | 'language' | 'topic' | 'trending';
    text: string;
    displayText?: string;
    description?: string;
    image?: string | null;
    score?: number;
    count?: number;
};

/**
 * Search suggestions endpoint that provides autocomplete results
 * GET /api/search/suggestions?q=query&types=repository,user&limit=5
 */
export const GET = api.handler(async ({ req }) => {
    // Validate query parameters
    const validation = validateQuery(req, apiSchemas.suggestions());
    if (!validation.success) {
        return errors.badRequest('Invalid suggestion parameters', validation.error);
    }

    // Extract validated data with defaults
    const { q = '', types = ['repository', 'user', 'organization', 'language', 'topic', 'trending'], limit = 5 } = validation.data;

    if (q.length < 2) {
        return NextResponse.json({ success: true, data: [] });
    }

    // Check cache first
    const cacheKey = `suggestions:${q}:${types.join(',')}:${limit}`;
    const cached = await cache.get<Suggestion[]>(cacheKey);
    if (cached) {
        return NextResponse.json({ success: true, data: cached });
    }

    const suggestions: Suggestion[] = [];
    const typePromises: Promise<void>[] = [];

    // Repository suggestions
    if (types.includes('repository')) {
        typePromises.push(
            prisma.repository.findMany({
                where: {
                    OR: [
                        { name: { contains: q } },
                        { description: { contains: q } }
                    ],
                    deletedAt: null,
                    isPrivate: false
                },
                take: limit,
                orderBy: [
                    { starCount: 'desc' },
                    { name: 'asc' }
                ],
                select: {
                    name: true,
                    description: true,
                    owner: {
                        select: {
                            name: true,
                            image: true
                        }
                    },
                    organization: {
                        select: {
                            name: true,
                            avatarUrl: true
                        }
                    }
                }
            }).then(repos => {
                suggestions.push(...repos.map(repo => ({
                    type: 'repository' as const,
                    text: repo.name,
                    displayText: `${repo.organization?.name || repo.owner?.name}/${repo.name}`,
                    description: repo.description || undefined,
                    image: repo.organization?.avatarUrl || repo.owner?.image
                })));
            })
        );
    }

    // User suggestions
    if (types.includes('user')) {
        typePromises.push(
            prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: q } },
                        { displayName: { contains: q } }
                    ],
                    deletedAt: null
                },
                take: limit,
                orderBy: [
                    { name: 'asc' }
                ],
                select: {
                    name: true,
                    displayName: true,
                    image: true,
                    bio: true
                }
            }).then(users => {
                suggestions.push(...users.map(user => ({
                    type: 'user' as const,
                    text: user.name!,
                    displayText: user.displayName || user.name!,
                    description: user.bio || undefined,
                    image: user.image
                })));
            })
        );
    }

    // Organization suggestions
    if (types.includes('organization')) {
        typePromises.push(
            prisma.organization.findMany({
                where: {
                    OR: [
                        { name: { contains: q } },
                        { displayName: { contains: q } }
                    ]
                },
                take: limit,
                orderBy: [
                    { name: 'asc' }
                ],
                select: {
                    name: true,
                    displayName: true,
                    avatarUrl: true,
                    description: true
                }
            }).then(orgs => {
                suggestions.push(...orgs.map(org => ({
                    type: 'organization' as const,
                    text: org.name,
                    displayText: org.displayName || org.name,
                    description: org.description || undefined,
                    image: org.avatarUrl
                })));
            })
        );
    }

    // Language suggestions
    if (types.includes('language')) {
        typePromises.push(
            prisma.repository.groupBy({
                by: ['language'],
                where: {
                    language: { contains: q },
                    deletedAt: null
                },
                _count: {
                    language: true
                },
                orderBy: {
                    _count: {
                        language: 'desc'
                    }
                },
                take: limit,
                having: {
                    language: {
                        not: null
                    }
                }
            }).then(languages => {
                suggestions.push(...languages
                    .filter(l => l.language) // Filter out null languages
                    .map(lang => ({
                        type: 'language' as const,
                        text: lang.language!,
                        count: lang._count.language
                    })));
            })
        );
    }

    // Topic suggestions
    if (types.includes('topic')) {
        typePromises.push(
            prisma.topic.findMany({
                where: {
                    name: { contains: q }
                },
                take: limit,
                include: {
                    _count: {
                        select: {
                            repositories: true
                        }
                    }
                }
            }).then(topics => {
                suggestions.push(...topics.map(topic => ({
                    type: 'topic' as const,
                    text: topic.name,
                    count: topic._count.repositories
                })));
            })
        );
    }

    // Trending search suggestions
    if (types.includes('trending')) {
        typePromises.push(
            prisma.searchTrending.findMany({
                where: {
                    term: { contains: q }
                },
                orderBy: [
                    { dailyCount: 'desc' }
                ],
                take: limit
            }).then(trending => {
                suggestions.push(...trending.map(term => ({
                    type: 'trending' as const,
                    text: term.term,
                    count: term.dailyCount,
                    score: term.count
                })));
            })
        );
    }

    // Wait for all suggestion types to complete
    await Promise.all(typePromises);

    // Sort suggestions by relevance/score and limit total results
    const sortedSuggestions = suggestions
        .sort((a, b) => (b.score || b.count || 0) - (a.score || a.count || 0))
        .slice(0, limit * 2); // Return more suggestions than the per-type limit

    // Cache results for 5 minutes
    await cache.set(cacheKey, sortedSuggestions, 300);

    return NextResponse.json({ success: true, data: sortedSuggestions });
}); 