import { Context } from './context';
import { GraphQLDateTime } from 'graphql-iso-date';
import { GraphQLJSON } from 'graphql-type-json';
import { UserInputError, AuthenticationError } from 'apollo-server-micro';

export const resolvers = {
    Query: {
        // User queries
        me: async (_parent: any, _args: any, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');
            return ctx.prisma.user.findUnique({ where: { id: ctx.user.id } });
        },
        user: async (_parent: any, { id }: { id: string }, ctx: Context) => {
            return ctx.prisma.user.findUnique({ where: { id } });
        },
        users: async (_parent: any, args: any, ctx: Context) => {
            return ctx.prisma.user.findMany({
                skip: args.skip,
                take: args.take,
                orderBy: args.orderBy,
                where: args.where,
            });
        },

        // Repository queries
        repository: async (_parent: any, { id }: { id: string }, ctx: Context) => {
            return ctx.prisma.repository.findUnique({ where: { id } });
        },
        repositories: async (_parent: any, args: any, ctx: Context) => {
            return ctx.prisma.repository.findMany({
                skip: args.skip,
                take: args.take,
                orderBy: args.orderBy,
                where: args.where,
            });
        },

        // Organization queries
        organization: async (_parent: any, { id }: { id: string }, ctx: Context) => {
            return ctx.prisma.organization.findUnique({ where: { id } });
        },
        organizations: async (_parent: any, args: any, ctx: Context) => {
            return ctx.prisma.organization.findMany({
                skip: args.skip,
                take: args.take,
                orderBy: args.orderBy,
                where: args.where,
            });
        },

        // Issue queries
        issue: async (_parent: any, { id }: { id: string }, ctx: Context) => {
            return ctx.prisma.issue.findUnique({ where: { id } });
        },
        issues: async (_parent: any, args: any, ctx: Context) => {
            return ctx.prisma.issue.findMany({
                skip: args.skip,
                take: args.take,
                orderBy: args.orderBy,
                where: args.where,
            });
        },

        // Pull request queries
        pullRequest: async (_parent: any, { id }: { id: string }, ctx: Context) => {
            return ctx.prisma.pullRequest.findUnique({ where: { id } });
        },
        pullRequests: async (_parent: any, args: any, ctx: Context) => {
            return ctx.prisma.pullRequest.findMany({
                skip: args.skip,
                take: args.take,
                orderBy: args.orderBy,
                where: args.where,
            });
        },
    },

    Mutation: {
        // User mutations
        updateUser: async (_parent: any, { id, data }: any, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');
            if (ctx.user.id !== id) throw new AuthenticationError('Not authorized');

            return ctx.prisma.user.update({
                where: { id },
                data,
            });
        },
        deleteUser: async (_parent: any, { id }: { id: string }, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');
            if (ctx.user.id !== id) throw new AuthenticationError('Not authorized');

            return ctx.prisma.user.delete({ where: { id } });
        },

        // Repository mutations
        createRepository: async (_parent: any, { data }: any, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');

            return ctx.prisma.repository.create({
                data: {
                    ...data,
                    owner: { connect: { id: ctx.user.id } },
                },
            });
        },
        updateRepository: async (_parent: any, { id, data }: any, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');

            const repo = await ctx.prisma.repository.findUnique({
                where: { id },
                select: { ownerId: true, organization: { select: { ownerId: true } } },
            });

            if (!repo) throw new UserInputError('Repository not found');
            if (repo.ownerId !== ctx.user.id && repo.organization?.ownerId !== ctx.user.id) {
                throw new AuthenticationError('Not authorized');
            }

            return ctx.prisma.repository.update({
                where: { id },
                data,
            });
        },
        deleteRepository: async (_parent: any, { id }: { id: string }, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');

            const repo = await ctx.prisma.repository.findUnique({
                where: { id },
                select: { ownerId: true, organization: { select: { ownerId: true } } },
            });

            if (!repo) throw new UserInputError('Repository not found');
            if (repo.ownerId !== ctx.user.id && repo.organization?.ownerId !== ctx.user.id) {
                throw new AuthenticationError('Not authorized');
            }

            return ctx.prisma.repository.delete({ where: { id } });
        },

        // Organization mutations
        createOrganization: async (_parent: any, { data }: any, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');

            return ctx.prisma.organization.create({
                data: {
                    ...data,
                    owner: { connect: { id: ctx.user.id } },
                },
            });
        },
        updateOrganization: async (_parent: any, { id, data }: any, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');

            const org = await ctx.prisma.organization.findUnique({
                where: { id },
                select: { ownerId: true },
            });

            if (!org) throw new UserInputError('Organization not found');
            if (org.ownerId !== ctx.user.id) throw new AuthenticationError('Not authorized');

            return ctx.prisma.organization.update({
                where: { id },
                data,
            });
        },
        deleteOrganization: async (_parent: any, { id }: { id: string }, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');

            const org = await ctx.prisma.organization.findUnique({
                where: { id },
                select: { ownerId: true },
            });

            if (!org) throw new UserInputError('Organization not found');
            if (org.ownerId !== ctx.user.id) throw new AuthenticationError('Not authorized');

            return ctx.prisma.organization.delete({ where: { id } });
        },

        // Issue mutations
        createIssue: async (_parent: any, { data }: any, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');

            return ctx.prisma.issue.create({
                data: {
                    ...data,
                    author: { connect: { id: ctx.user.id } },
                },
            });
        },
        updateIssue: async (_parent: any, { id, data }: any, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');

            const issue = await ctx.prisma.issue.findUnique({
                where: { id },
                select: { authorId: true },
            });

            if (!issue) throw new UserInputError('Issue not found');
            if (issue.authorId !== ctx.user.id) throw new AuthenticationError('Not authorized');

            return ctx.prisma.issue.update({
                where: { id },
                data,
            });
        },
        deleteIssue: async (_parent: any, { id }: { id: string }, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');

            const issue = await ctx.prisma.issue.findUnique({
                where: { id },
                select: { authorId: true },
            });

            if (!issue) throw new UserInputError('Issue not found');
            if (issue.authorId !== ctx.user.id) throw new AuthenticationError('Not authorized');

            return ctx.prisma.issue.delete({ where: { id } });
        },

        // Pull request mutations
        createPullRequest: async (_parent: any, { data }: any, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');

            return ctx.prisma.pullRequest.create({
                data: {
                    ...data,
                    author: { connect: { id: ctx.user.id } },
                },
            });
        },
        updatePullRequest: async (_parent: any, { id, data }: any, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');

            const pr = await ctx.prisma.pullRequest.findUnique({
                where: { id },
                select: { authorId: true },
            });

            if (!pr) throw new UserInputError('Pull request not found');
            if (pr.authorId !== ctx.user.id) throw new AuthenticationError('Not authorized');

            return ctx.prisma.pullRequest.update({
                where: { id },
                data,
            });
        },
        deletePullRequest: async (_parent: any, { id }: { id: string }, ctx: Context) => {
            if (!ctx.user) throw new AuthenticationError('Not authenticated');

            const pr = await ctx.prisma.pullRequest.findUnique({
                where: { id },
                select: { authorId: true },
            });

            if (!pr) throw new UserInputError('Pull request not found');
            if (pr.authorId !== ctx.user.id) throw new AuthenticationError('Not authorized');

            return ctx.prisma.pullRequest.delete({ where: { id } });
        },
    },

    // Field resolvers
    User: {
        repositories: (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.repository.findMany({ where: { ownerId: parent.id } });
        },
        organizations: (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.organization.findMany({ where: { ownerId: parent.id } });
        },
        stars: (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.star.findMany({ where: { userId: parent.id } });
        },
        issues: (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.issue.findMany({ where: { authorId: parent.id } });
        },
        pullRequests: (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.pullRequest.findMany({ where: { authorId: parent.id } });
        },
    },

    Repository: {
        owner: (parent: any, _args: any, ctx: Context) => {
            return parent.ownerId ? ctx.prisma.user.findUnique({ where: { id: parent.ownerId } }) : null;
        },
        organization: (parent: any, _args: any, ctx: Context) => {
            return parent.orgId ? ctx.prisma.organization.findUnique({ where: { id: parent.orgId } }) : null;
        },
        stars: (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.star.findMany({ where: { repositoryId: parent.id } });
        },
        issues: (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.issue.findMany({ where: { repositoryId: parent.id } });
        },
        pullRequests: (parent: any, _args: any, ctx: Context) => {
            return ctx.prisma.pullRequest.findMany({ where: { repositoryId: parent.id } });
        },
    },

    // Custom scalars
    DateTime: GraphQLDateTime,
    JSON: GraphQLJSON,
}; 