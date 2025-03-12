export interface User {
  id: number;
  login: string;
  name?: string;
  avatarUrl: string;
  bio?: string | null;
  type: "User" | "Organization";
  company?: string | null;
  location?: string | null;
  blog?: string | null;
  email?: string | null;
  followers?: number;
  following?: number;
  publicRepos?: number;
  createdAt?: string;
  updatedAt?: string;
  // Enhanced stats with formatted values
  stats?: {
    followersFormatted: string;
    followingFormatted: string;
    reposFormatted: string;
  };
  // Top repositories
  topRepositories?: Array<{
    id: number;
    name: string;
    stars: number;
  }>;
}

export interface UserArray {
  user: User;
}

export interface Developer {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  url: string;
  type: string;
  followers_url: string;
  following_url: string;
  repos_url: string;
  is_site_admin: boolean;
  score: number;
  follower_count: number;
}

export interface GitHubUser {
  id: number;
  login: string;
  node_id: string;
  avatar_url: string;
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
  type: string;
  site_admin: boolean;
  score: number;
  user_view_type?: string;
}