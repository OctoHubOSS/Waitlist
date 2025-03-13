import { useState, useEffect, ReactNode } from "react";
import { FileItem, FileBrowserProps, Branch } from "@/types/repos";
import { useRepositoryBranches, useRepositoryFiles } from "@/utils/fetcher";
import { FileExplorerProvider } from "./hooks/useFileExplorer";
import BranchNavBar from "./components/BranchNavBar";
import FileViewer from "./components/FileViewer";
import DirectoryViewer from "./components/DirectoryViewer";
import { findReadmeFile } from "./utils/filetype";

export interface ExtendedFileBrowserProps extends FileBrowserProps {
    children?: ReactNode;
}

export default function FileBrowser({
    owner,
    repo,
    defaultBranch,
    initialContents = null,
    currentPath: initialPath = "",
    children
}: ExtendedFileBrowserProps) {
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

    return (
        <FileExplorerProvider
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
                changeBranch
            }}
        >
            <div className="card">
                <BranchNavBar />
                {children ? (
                    // Render custom children if provided
                    children
                ) : (
                    // Otherwise render default components
                    selectedFile ? <FileViewer /> : <DirectoryViewer />
                )}
            </div>
        </FileExplorerProvider>
    );
}

// Re-export components for external use
export { BranchNavBar, FileViewer, DirectoryViewer };
export { useFileExplorer } from './hooks/useFileExplorer';