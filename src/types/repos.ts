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

export interface FileBrowserProps {
  owner: string;
  repo: string;
  defaultBranch?: string;
  initialContents?: FileItem[] | null;
  currentPath?: string;
}

export interface FileItem {
  name: string;
  path: string;
  type: "file" | "dir";
  size: number;
  sha: string;
  url?: string;
  download_url?: string;
  content?: string;
}
export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface FileExplorerContextType {
  // Repository info
  owner: string;
  repo: string;

  // Navigation state
  currentPath: string;
  navigateToPath: (path: string) => void;
  navigateUp: () => void;
  breadcrumbs: { name: string; path: string }[];

  // File data
  files: FileItem[];
  isLoading: boolean;
  error: string | null;

  // File viewing
  selectedFile: FileItem | null;
  fileContent: string | null;
  fileViewLoading: boolean;
  fileViewError: string | null;
  viewFile: (file: FileItem) => void;
  backToDirectory: () => void;

  // Branch handling
  branches: Branch[];
  selectedBranch: string;
  branchesLoading: boolean;
  branchMenuOpen: boolean;
  setBranchMenuOpen: (isOpen: boolean) => void;
  changeBranch: (branchName: string) => void;

  // Utility functions
  formatBytes: (bytes: number) => string;
  getFileLanguage: (filename: string) => string;
  isMarkdown: (filename: string) => boolean;
  isImage: (filename: string) => boolean;
}
