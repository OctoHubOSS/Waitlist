export interface RepoArray {
  repo: Repository
}

export interface Repository {
  id: number;
  name: string;
  url: string;
  repo: string;
  description: string;
  language: string;
  updatedAt: string;
  stars: number;
  forks: number;
  owner: {
    login: string;
    avatar_url: string;
    url: string;
  };
  createdAt: string;
  pushedAt: string;
  openIssues: number;
  topics: string[];
  license: string | null;
  visibility: string;
  size: number;
}

export interface RawData {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    description: string;
    language: string;
    updated_at: string;
    created_at: string;
    pushed_at: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    topics: string[];
    license: {
      key: string;
      name: string;
      spdx_id: string;
      url: string;
    } | null;
    visibility: string;
    size: number;
    owner: {
      login: string;
      avatar_url: string;
      html_url: string;
    };
}

export interface RepoPage {
  name: string;
  description: string;
  html_url: string;
  id: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language?: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  archived: boolean;
  license: {
    name: string;
  } | null;
  size: number;
  allow_forking: boolean;
  is_template: boolean;
  default_branch: string;
  topics?: string[];
  visibility?: string;
}