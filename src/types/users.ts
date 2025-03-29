export interface BaseUser {
  id: number;
  login: string;
  avatarUrl: string;
  type: "User" | "Organization";
  name?: string;
  bio?: string | null;
  company?: string | null;
  location?: string | null;
  blog?: string | null;
  email?: string | null;
  followers?: number;
  following?: number;
  publicRepos?: number;
  public_repos?: number;
  createdAt?: string;
  updatedAt?: string;
  twitter_username?: string | null;
}

export interface User extends BaseUser {
  stats?: {
    followersFormatted: string;
    followingFormatted: string;
    reposFormatted: string;
  };
  topRepositories?: {
    id: number;
    name: string;
    stars: number;
  }[];
}

export interface Developer extends BaseUser {
  url: string;
  followers_url: string;
  following_url: string;
  repos_url: string;
  is_site_admin: boolean;
  score: number;
  follower_count: number;
}

export interface GitHubUser extends BaseUser {
  node_id: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  site_admin: boolean;
  score: number;
  user_view_type?: string;
  contributedRepos: string[];
  authoredIssues: string[];
  issueAssignments: string[];
  issueComments: string[];
  milestones: string[];
  orgMemberships: string[];
  ownedOrgs: string[];
  packages: string[];
  pullRequests: string[];
  prAssignments: string[];
  prComments: string[];
  prReviews: string[];
  prReviewComments: string[];
  prReviewers: string[];
  reactions: string[];
  authoredReleases: string[];
  linkedRepos: string[];
  repositories: string[];
  repoViews: string[];
  searchClicks: string[];
  searches: string[];
  sessions: string[];
  stars: string[];
  authoredTags: string[];
  teamMemberships: string[];
  trending: string[];
  activities: string[];
  presence: string[];
  wikiPages: string[];
  wikiRevisions: string[];
}

export interface UserArray {
  user: User;
}
