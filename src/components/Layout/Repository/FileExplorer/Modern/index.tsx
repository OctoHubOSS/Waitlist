import { useState, useEffect, ReactNode } from "react";
import { FileItem, FileBrowserProps, Branch } from "@/types/repos";
import { useRepositoryBranches, useRepositoryFiles } from "@/utils/fetcher";
import { ModernFileExplorerProvider } from "./hooks/useModernFileExplorer";
import ModernBranchNavBar from "./components/BranchNavBar";
import ModernFileViewer from "./components/FileViewer";
import ModernDirectoryViewer from "./components/DirectoryViewer";
import { findReadmeFile } from "./utils/filetype";

export interface ModernFileBrowserProps extends FileBrowserProps {
    children?: ReactNode;
}

export default function ModernFileExplorer({
    owner,
    repo,
    defaultBranch,
    initialContents = null,
    currentPath: initialPath = "",
    children
}: ModernFileBrowserProps) {
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

    // Syntax highlighting theme with proper localStorage persistence
    const [syntaxTheme, setSyntaxTheme] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('syntax-theme');
            if (savedTheme) return savedTheme;
        }
        return 'atomOneDark'; // Default theme
    });

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

    // Generate breadcrumbs for the current path
    const breadcrumbs = [
        { name: repo, path: "" },
        ...currentPath
            .split("/")
            .filter(Boolean)
            .map((part, index, parts) => ({
                name: part,
                path: parts.slice(0, index + 1).join("/"),
            })),
    ];

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

    // Add effect to save theme preference
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('syntax-theme', syntaxTheme);
        }
    }, [syntaxTheme]);

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

    // Save theme selection to localStorage
    const handleSetSyntaxTheme = (theme: string) => {
        setSyntaxTheme(theme);
        if (typeof window !== 'undefined') {
            localStorage.setItem('syntax-theme', theme);
            console.log('Theme saved to localStorage:', theme);
        }
    };

    return (
        <ModernFileExplorerProvider
            value={{
                owner,
                repo,
                currentPath,
                navigateToPath,
                navigateUp,
                breadcrumbs,
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
                syntaxTheme,
                setSyntaxTheme: handleSetSyntaxTheme
            }}
        >
            <div className="modern-file-browser card">
                {children ? (
                    children
                ) : (
                    <>
                        <ModernBranchNavBar />
                        {selectedFile ? <ModernFileViewer /> : <ModernDirectoryViewer />}
                    </>
                )}
            </div>
        </ModernFileExplorerProvider>
    );
}

// Re-export components for external use
export { ModernBranchNavBar, ModernFileViewer, ModernDirectoryViewer };
export { useModernFileExplorer } from './hooks/useModernFileExplorer';
