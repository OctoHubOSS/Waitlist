export interface BaseRepository {
  id: number;
  name: string;
  description: string;
  language?: string;
  updated_at: string;
  created_at: string;
  pushed_at: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics?: string[];
  license?: {
    name: string;
    key?: string;
    spdx_id?: string | null;
    url?: string | null;
  } | null;
  visibility?: string;
  size: number;
  owner: {
    login: string;
    avatar_url: string;
    url?: string;
    html_url?: string;
  };
  fork?: boolean;
  is_template?: boolean;
  default_branch?: string;
}

export interface Repository extends BaseRepository {
  url: string;
  repo: string;
  updatedAt: string;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string;
  createdAt: string;
  stargazers_count: number;
  created_at: string;
  pushed_at: string;
  updated_at: string;
}

export interface RawData extends BaseRepository {
  full_name: string;
  html_url: string;
}

export interface RepoPage extends BaseRepository {
  html_url: string;
  id: number;
  watchers_count: number;
  archived: boolean;
  allow_forking: boolean;
}

export interface RepoArray {
  repo: Repository;
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

export interface FileBrowserProps {
  owner: string;
  repo: string;
  defaultBranch?: string;
  initialContents?: FileItem[] | null;
  currentPath?: string;
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface BaseFileExplorer {
  owner: string;
  repo: string;
  currentPath: string;
  files: FileItem[];
  isLoading: boolean;
  error: string | null;
  selectedFile: FileItem | null;
  fileContent: string | null;
  fileViewLoading: boolean;
  fileViewError: string | null;
  branches: Branch[];
  selectedBranch: string;
  branchesLoading: boolean;
  branchMenuOpen: boolean;
}

export interface FileExplorerContextType extends BaseFileExplorer {
  navigateToPath: (path: string) => void;
  navigateUp: () => void;
  breadcrumbs: { name: string; path: string }[];
  viewFile: (file: FileItem) => void;
  backToDirectory: () => void;
  setBranchMenuOpen: (isOpen: boolean) => void;
  changeBranch: (branchName: string) => void;
  formatBytes: (bytes: number) => string;
  getFileLanguage: (filename: string) => string;
  isMarkdown: (filename: string) => boolean;
  isImage: (filename: string) => boolean;
  syntaxTheme: string;
  setSyntaxTheme: (theme: string) => void;
}

export interface ModernExplorerResult extends BaseFileExplorer {
  navigateToPath: (path: string) => void;
  navigateUp: () => void;
  viewFile: (file: FileItem) => void;
  backToDirectory: () => void;
  setBranchMenuOpen: (open: boolean) => void;
  changeBranch: (branchName: string) => void;
  getFileLanguage: (filename: string) => string;
  isMarkdown: (filename: string) => boolean;
  isImage: (filename: string) => boolean;
}