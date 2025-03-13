import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRepositoryBranches, useRepositoryFiles } from "@/utils/fetcher";
import { findReadmeFile, isImage, isMarkdown, getFileLanguage } from '../utils/fileType';
import { formatSize, formatRelativeDate } from '../utils/formatting';
import { FileItem, Branch } from "@/types/repos";

interface ModernExplorerContextType {
    // Repository info
    owner: string;
    repo: string;

    // Navigation state
    currentPath: string;
    navigateToPath: (path: string) => void;
    navigateUp: () => void;

    // Files and directories
    files: FileItem[];
    isLoading: boolean;
    error: string | null;

    // File viewing
    selectedFile: FileItem | null;
    fileContent: string | null;
    fileViewLoading: boolean;
    fileViewError: string | null;
    viewFile: (file: FileItem) => Promise<void>;
    backToDirectory: () => void;

    // Branch selection
    branches: Branch[];
    selectedBranch: string;
    branchesLoading: boolean;
    branchMenuOpen: boolean;
    setBranchMenuOpen: (isOpen: boolean) => void;
    changeBranch: (branch: string) => void;

    // File operations
    downloadFile: () => void;
    copyFileContents: () => Promise<boolean>;

    // Utility functions
    formatSize: (bytes: number) => string;
    formatRelativeDate: (dateString: string) => string;
    isImage: (filename: string) => boolean;
    isMarkdown: (filename: string) => boolean;
    getFileLanguage: (filename: string) => string;
}

const ModernExplorerContext = createContext<ModernExplorerContextType | undefined>(undefined);

interface ModernExplorerProviderProps {
    children: ReactNode;
    owner: string;
    repo: string;
    defaultBranch: string;
    initialContents?: FileItem[] | null;
    currentPath?: string;
}

export const ModernExplorerProvider = ({
    children,
    owner,
    repo,
    defaultBranch,
    initialContents = null,
    currentPath: initialPath = "",
}: ModernExplorerProviderProps) => {
    // State management
    const [currentPath, setCurrentPath] = useState(initialPath);
    const [files, setFiles] = useState<FileItem[]>(initialContents || []);
    const [isLoading, setIsLoading] = useState(!initialContents);
    const [error, setError] = useState<string | null>(null);

    // File viewing state
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileViewLoading, setFileViewLoading] = useState(false);
    const [fileViewError, setFileViewError] = useState<string | null>(null);
    const [userNavigatedFromFile, setUserNavigatedFromFile] = useState(false);

    // Branch selection state
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>(defaultBranch || 'main');
    const [branchMenuOpen, setBranchMenuOpen] = useState(false);

    // Using our SWR hooks
    const { data: branchesData, isLoading: isBranchesLoading } = useRepositoryBranches(owner, repo);
    const { data: fileData, isLoading: contentsLoading } = useRepositoryFiles(owner, repo, currentPath, selectedBranch);

    // Navigate to a directory
    const navigateToPath = (path: string) => {
        setCurrentPath(path);
        setSelectedFile(null);
        setFileContent(null);
        setUserNavigatedFromFile(false);
    };

    // Navigate up one directory
    const navigateUp = () => {
        const pathParts = currentPath.split("/");
        pathParts.pop();
        setCurrentPath(pathParts.join("/"));
        setSelectedFile(null);
        setFileContent(null);
        setUserNavigatedFromFile(false);
    };

    // Change branch
    const changeBranch = (branchName: string) => {
        setSelectedBranch(branchName);
        setSelectedFile(null);
        setFileContent(null);
        setCurrentPath("");
        setBranchMenuOpen(false);
        setUserNavigatedFromFile(false);
    };

    // View a file
    const viewFile = async (file: FileItem) => {
        if (file.type !== "file") return;

        setSelectedFile(file);
        setFileViewLoading(true);
        setFileViewError(null);
        setUserNavigatedFromFile(false);

        try {
            if (file.size > 1000000) { // 1MB
                setFileViewError("File is too large to display. Please download it instead.");
                setFileContent(null);
                return;
            }

            const response = await fetch(file.download_url ||
                `https://raw.githubusercontent.com/${owner}/${repo}/${selectedBranch}/${file.path}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch file content: ${response.status}`);
            }

            const content = await response.text();
            setFileContent(content);
        } catch (err) {
            setFileViewError((err as Error).message);
            setFileContent(null);
        } finally {
            setFileViewLoading(false);
        }
    };

    // Return to directory view
    const backToDirectory = () => {
        setSelectedFile(null);
        setFileContent(null);
        setUserNavigatedFromFile(true);
    };

    // Download file
    const downloadFile = () => {
        if (selectedFile && selectedFile.download_url) {
            // For images and binary files that already have a download URL
            window.open(selectedFile.download_url, '_blank');
        } else if (fileContent && selectedFile) {
            // For text files we can create a download from the content
            const element = document.createElement('a');
            const file = new Blob([fileContent], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = selectedFile.name;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    };

    // Copy file contents to clipboard
    const copyFileContents = async (): Promise<boolean> => {
        if (!fileContent) return false;

        try {
            await navigator.clipboard.writeText(fileContent);
            return true;
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            return false;
        }
    };

    // Update branches when data loads
    useEffect(() => {
        if (branchesData) {
            setBranches(branchesData);

            if (!defaultBranch || !branchesData.some((b: Branch) => b.name === selectedBranch)) {
                const mainBranch = branchesData.find((b: Branch) =>
                    ['main', 'master', 'develop', 'development'].includes(b.name.toLowerCase())
                );
                setSelectedBranch(mainBranch ? mainBranch.name : branchesData[0]?.name || 'main');
            }
        }
    }, [branchesData, defaultBranch, selectedBranch]);

    // Update files when data loads
    useEffect(() => {
        if (fileData?.contents) {
            setFiles(fileData.contents);
            setError(null);

            if (currentPath === "" && !selectedFile && !userNavigatedFromFile) {
                const readmeFile = findReadmeFile(fileData.contents);
                if (readmeFile) {
                    setTimeout(() => {
                        viewFile(readmeFile);
                    }, 100);
                }
            }
        } else if (fileData?.contentsError) {
            setError(fileData.contentsError);
            setFiles([]);
        }
    }, [fileData, currentPath, selectedFile, userNavigatedFromFile]);

    // Update loading state
    useEffect(() => {
        setIsLoading(contentsLoading);
    }, [contentsLoading]);

    // Click outside handler for branch menu
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (!target.closest('.branch-selector')) {
                setBranchMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const value = {
        owner,
        repo,
        currentPath,
        navigateToPath,
        navigateUp,
        files,
        isLoading,
        error,
        selectedFile,
        fileContent,
        fileViewLoading,
        fileViewError,
        viewFile,
        backToDirectory,
        branches,
        selectedBranch,
        branchesLoading: isBranchesLoading,
        branchMenuOpen,
        setBranchMenuOpen,
        changeBranch,
        downloadFile,
        copyFileContents,
        formatSize,
        formatRelativeDate,
        isImage,
        isMarkdown,
        getFileLanguage
    };

    return (
        <ModernExplorerContext.Provider value={value}>
            {children}
        </ModernExplorerContext.Provider>
    );
};

export const useModernExplorer = () => {
    const context = useContext(ModernExplorerContext);
    if (context === undefined) {
        throw new Error('useModernExplorer must be used within a ModernExplorerProvider');
    }
    return context;
};

export default useModernExplorer;