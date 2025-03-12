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
  follower_count: number; // Added this field
}
  
export interface GitHubUser {
    login: string;
    id: number;
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