import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(
      skip: Int
      take: Int
      orderBy: UserOrderByInput
      where: UserWhereInput
    ): [User!]!
    
    # Repository queries
    repository(id: ID!): Repository
    repositories(
      skip: Int
      take: Int
      orderBy: RepositoryOrderByInput
      where: RepositoryWhereInput
    ): [Repository!]!
    
    # Organization queries
    organization(id: ID!): Organization
    organizations(
      skip: Int
      take: Int
      orderBy: OrganizationOrderByInput
      where: OrganizationWhereInput
    ): [Organization!]!
    
    # Issue queries
    issue(id: ID!): Issue
    issues(
      skip: Int
      take: Int
      orderBy: IssueOrderByInput
      where: IssueWhereInput
    ): [Issue!]!
    
    # Pull request queries
    pullRequest(id: ID!): PullRequest
    pullRequests(
      skip: Int
      take: Int
      orderBy: PullRequestOrderByInput
      where: PullRequestWhereInput
    ): [PullRequest!]!
  }

  type Mutation {
    # User mutations
    updateUser(id: ID!, data: UserUpdateInput!): User!
    deleteUser(id: ID!): User
    
    # Repository mutations
    createRepository(data: RepositoryCreateInput!): Repository!
    updateRepository(id: ID!, data: RepositoryUpdateInput!): Repository!
    deleteRepository(id: ID!): Repository
    
    # Organization mutations
    createOrganization(data: OrganizationCreateInput!): Organization!
    updateOrganization(id: ID!, data: OrganizationUpdateInput!): Organization!
    deleteOrganization(id: ID!): Organization
    
    # Issue mutations
    createIssue(data: IssueCreateInput!): Issue!
    updateIssue(id: ID!, data: IssueUpdateInput!): Issue!
    deleteIssue(id: ID!): Issue
    
    # Pull request mutations
    createPullRequest(data: PullRequestCreateInput!): PullRequest!
    updatePullRequest(id: ID!, data: PullRequestUpdateInput!): PullRequest!
    deletePullRequest(id: ID!): PullRequest
  }

  type User {
    id: ID!
    name: String
    displayName: String
    email: String
    emailVerified: DateTime
    image: String
    bio: String
    website: String
    location: String
    createdAt: DateTime!
    updatedAt: DateTime!
    deletedAt: DateTime
    lastLoginAt: DateTime
    lastActiveAt: DateTime
    status: UserStatus!
    statusMessage: String
    githubId: String
    githubUsername: String
    githubDisplayName: String
    preferences: JSON
    repositories: [Repository!]!
    organizations: [Organization!]!
    stars: [Star!]!
    issues: [Issue!]!
    pullRequests: [PullRequest!]!
  }

  type Repository {
    id: ID!
    name: String!
    description: String
    isPrivate: Boolean!
    defaultBranch: String!
    language: String
    forkCount: Int!
    starCount: Int!
    size: Int!
    watcherCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    lastPushedAt: DateTime
    deletedAt: DateTime
    source: RepoSource!
    owner: User
    organization: Organization
    stars: [Star!]!
    issues: [Issue!]!
    pullRequests: [PullRequest!]!
    releases: [Release!]!
    tags: [Tag!]!
  }

  type Organization {
    id: ID!
    name: String!
    displayName: String
    description: String
    avatarUrl: String
    website: String
    location: String
    email: String
    isPublic: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    owner: User!
    members: [OrgMembership!]!
    teams: [Team!]!
    repositories: [Repository!]!
  }

  type Issue {
    id: ID!
    title: String!
    body: String
    number: Int!
    state: IssueState!
    createdAt: DateTime!
    updatedAt: DateTime!
    closedAt: DateTime
    repository: Repository!
    author: User!
    assignees: [IssueAssignee!]!
    labels: [IssueLabel!]!
    comments: [IssueComment!]!
    milestone: Milestone
  }

  type PullRequest {
    id: ID!
    title: String!
    body: String
    number: Int!
    state: PullRequestState!
    isDraft: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    closedAt: DateTime
    mergedAt: DateTime
    headBranch: String!
    baseBranch: String!
    mergeable: Boolean
    merged: Boolean!
    repository: Repository!
    author: User!
    assignees: [PullRequestAssignee!]!
    reviewers: [PullRequestReviewer!]!
    labels: [PullRequestLabel!]!
    comments: [PullRequestComment!]!
    reviews: [PullRequestReview!]!
  }

  # Enums
  enum UserStatus {
    ONLINE
    IDLE
    DO_NOT_DISTURB
    BUSY
    AWAY
    OFFLINE
    INVISIBLE
  }

  enum RepoSource {
    OCTOFLOW
    GITHUB
    GITLAB
    BITBUCKET
  }

  enum IssueState {
    OPEN
    CLOSED
  }

  enum PullRequestState {
    OPEN
    CLOSED
    MERGED
  }

  # Scalars
  scalar DateTime
  scalar JSON

  # Input types
  input UserWhereInput {
    id: ID
    email: String
    githubUsername: String
    displayName: String
  }

  input UserOrderByInput {
    createdAt: SortOrder
    lastActiveAt: SortOrder
  }

  input RepositoryWhereInput {
    id: ID
    name: String
    isPrivate: Boolean
    language: String
    ownerId: ID
    organizationId: ID
  }

  input RepositoryOrderByInput {
    createdAt: SortOrder
    starCount: SortOrder
    lastPushedAt: SortOrder
  }

  input OrganizationWhereInput {
    id: ID
    name: String
    isPublic: Boolean
  }

  input OrganizationOrderByInput {
    createdAt: SortOrder
    name: SortOrder
  }

  input IssueWhereInput {
    id: ID
    repositoryId: ID
    state: IssueState
    authorId: ID
  }

  input IssueOrderByInput {
    createdAt: SortOrder
    updatedAt: SortOrder
  }

  input PullRequestWhereInput {
    id: ID
    repositoryId: ID
    state: PullRequestState
    authorId: ID
  }

  input PullRequestOrderByInput {
    createdAt: SortOrder
    updatedAt: SortOrder
  }

  enum SortOrder {
    asc
    desc
  }
`; 