import { useState, useEffect } from "react";
import { FaChevronRight, FaCode, FaFileAlt, FaArrowLeft, FaDownload } from "react-icons/fa";
import { GoFileDirectory, GoFile, GoFileCode } from "react-icons/go";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import 'github-markdown-css/github-markdown-dark.css';

interface FileBrowserProps {
    owner: string;
    repo: string;
    initialPath?: string;
    defaultBranch?: string;
}

interface FileItem {
    name: string;
    path: string;
    type: "file" | "dir" | string;
    size: number;
    sha: string;
    url: string;
    download_url?: string;
    content?: string;
}

export default function FileBrowser({ owner, repo, initialPath = "", defaultBranch }: FileBrowserProps) {
    const [currentPath, setCurrentPath] = useState(initialPath);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // File viewing state
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileViewLoading, setFileViewLoading] = useState(false);
    const [fileViewError, setFileViewError] = useState<string | null>(null);

    // Helper function to find README file in a list of files
    const findReadmeFile = (fileList: FileItem[]): FileItem | null => {
        const readmePatterns = [
            /^readme\.md$/i,
            /^readme\.mdx$/i,
            /^readme\.markdown$/i,
            /^readme$/i
        ];

        for (const pattern of readmePatterns) {
            const readmeFile = fileList.find(file =>
                file.type === "file" && pattern.test(file.name)
            );
            if (readmeFile) return readmeFile;
        }

        return null;
    };

    // Format file size to human-readable format
    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    // Navigate to a directory
    const navigateToPath = (path: string) => {
        setCurrentPath(path);
        // Reset file view when navigating
        setSelectedFile(null);
        setFileContent(null);
    };

    // Navigate up one directory
    const navigateUp = () => {
        const pathParts = currentPath.split("/");
        pathParts.pop();
        setCurrentPath(pathParts.join("/"));
        // Reset file view when navigating
        setSelectedFile(null);
        setFileContent(null);
    };

    // View a file
    const viewFile = async (file: FileItem) => {
        if (file.type !== "file") return;

        setSelectedFile(file);
        setFileViewLoading(true);
        setFileViewError(null);

        try {
            // If file size is too large, don't fetch the content
            if (file.size > 1000000) { // 1MB
                setFileViewError("File is too large to display. Please download it instead.");
                setFileContent(null);
                return;
            }

            // Fetch the file content
            const response = await fetch(file.download_url || `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch || 'main'}/${file.path}`);

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
    };

    // Determine file language for syntax highlighting
    const getFileLanguage = (filename: string): string => {
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const languageMap: Record<string, string> = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'rb': 'ruby',
            'java': 'java',
            'php': 'php',
            'go': 'go',
            'c': 'c',
            'cpp': 'cpp',
            'cs': 'csharp',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'yaml': 'yaml',
            'yml': 'yaml',
            'md': 'markdown',
            'mdx': 'markdown',
            'sh': 'bash',
            'bash': 'bash',
        };

        return languageMap[ext] || 'plaintext';
    };

    // Check if file is a markdown file
    const isMarkdown = (filename: string): boolean => {
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        return ['md', 'mdx', 'markdown'].includes(ext);
    };

    // Check if file is an image
    const isImage = (filename: string): boolean => {
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
    };

    // Fetch files for the current path
    useEffect(() => {
        const fetchFiles = async () => {
            setIsLoading(true);
            setError(null);

            try {
                let url = `/api/repo?owner=${owner}&repo=${repo}&contents=true&path=${currentPath}`;
                if (defaultBranch) {
                    url += `&ref=${defaultBranch}`;
                }

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Failed to fetch files: ${response.status}`);
                }

                const data = await response.json();

                if (data.contents) {
                    setFiles(data.contents);

                    // Auto-display README.md if we're in the root directory and no file is selected
                    if (currentPath === "" && !selectedFile) {
                        const readmeFile = findReadmeFile(data.contents);
                        if (readmeFile) {
                            // Small delay to allow directory view to render first
                            setTimeout(() => {
                                viewFile(readmeFile);
                            }, 100);
                        }
                    }
                } else if (data.contentsError) {
                    throw new Error(data.contentsError);
                } else {
                    setFiles([]);
                }
            } catch (err) {
                setError((err as Error).message);
                setFiles([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFiles();
    }, [owner, repo, currentPath, defaultBranch]);

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

    return (
        <div className="card">
            {/* Breadcrumb navigation */}
            <div className="flex items-center gap-1 text-sm mb-4 overflow-x-auto pb-2">
                {selectedFile ? (
                    <>
                        <button
                            onClick={backToDirectory}
                            className="flex items-center text-github-link hover:text-github-link-hover"
                        >
                            <FaArrowLeft className="h-3 w-3 mr-2" />
                            Back to files
                        </button>
                        <FaChevronRight className="h-3 w-3 mx-1 text-github-text-secondary" />
                        <span className="text-github-text-secondary">{selectedFile.name}</span>
                    </>
                ) : (
                    breadcrumbs.map((crumb, index) => (
                        <div key={crumb.path} className="flex items-center">
                            {index > 0 && <FaChevronRight className="h-3 w-3 mx-1 text-github-text-secondary" />}
                            <button
                                onClick={() => navigateToPath(crumb.path)}
                                className="hover:text-github-link text-github-text-secondary hover:underline px-1"
                            >
                                {crumb.name}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {selectedFile ? (
                // File View Mode
                <div>
                    <div className="bg-github-dark rounded-t-md p-4 border border-github-border flex justify-between items-center">
                        <div className="flex items-center">
                            {isImage(selectedFile.name) ? (
                                <FaFileAlt className="h-5 w-5 text-purple-400 mr-2" />
                            ) : isMarkdown(selectedFile.name) ? (
                                <GoFileCode className="h-5 w-5 text-blue-400 mr-2" />
                            ) : (
                                <FaCode className="h-5 w-5 text-yellow-400 mr-2" />
                            )}
                            <span className="text-github-text font-medium">{selectedFile.name}</span>
                            <span className="ml-3 text-xs text-github-text-secondary">
                                {formatBytes(selectedFile.size)}
                            </span>
                        </div>

                        {selectedFile.download_url && (
                            <a
                                href={selectedFile.download_url}
                                download={selectedFile.name}
                                className="flex items-center text-xs text-github-text-secondary hover:text-github-link"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FaDownload className="h-3 w-3 mr-1" />
                                Download
                            </a>
                        )}
                    </div>

                    <div className="border border-t-0 border-github-border rounded-b-md overflow-hidden">
                        {fileViewLoading ? (
                            <div className="animate-pulse p-6 bg-github-dark-secondary">
                                <div className="h-4 bg-github-border rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-github-border rounded w-1/2 mb-3"></div>
                                <div className="h-4 bg-github-border rounded w-5/6 mb-3"></div>
                                <div className="h-4 bg-github-border rounded w-2/3"></div>
                            </div>
                        ) : fileViewError ? (
                            <div className="bg-red-900/20 p-6 text-red-400">
                                {fileViewError}
                            </div>
                        ) : fileContent ? (
                            isImage(selectedFile.name) ? (
                                <div className="p-4 bg-github-dark flex justify-center">
                                    <img
                                        src={selectedFile.download_url}
                                        alt={selectedFile.name}
                                        className="max-w-full max-h-[600px] object-contain"
                                    />
                                </div>
                            ) : isMarkdown(selectedFile.name) ? (
                                <div className="p-6 bg-github-dark-secondary markdown-body">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}
                                        components={{
                                            code({ node, inline, className, children, ...props }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        language={match[1]}
                                                        style={atomOneDark}
                                                        PreTag="div"
                                                        showLineNumbers
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
                                            a(props) {
                                                return (
                                                    <a
                                                        href={props.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-github-link hover:underline"
                                                    >
                                                        {props.children}
                                                    </a>
                                                );
                                            }
                                        }}
                                    >
                                        {fileContent}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <SyntaxHighlighter
                                        language={getFileLanguage(selectedFile.name)}
                                        style={atomOneDark}
                                        customStyle={{ margin: 0, padding: '1.5rem', background: '#0d1117', borderRadius: 0 }}
                                        showLineNumbers
                                    >
                                        {fileContent}
                                    </SyntaxHighlighter>
                                </div>
                            )
                        ) : (
                            <div className="p-6 text-github-text-secondary">
                                No content available
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // Directory View Mode
                isLoading ? (
                    <div className="animate-pulse space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-10 bg-github-border rounded w-full" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-900/20 border border-red-900/30 rounded p-4 text-red-400">
                        {error}
                    </div>
                ) : (
                    <div>
                        {/* Directory listing */}
                        <div className="border rounded-md border-github-border overflow-hidden">
                            <table className="min-w-full divide-y divide-github-border">
                                <thead className="bg-github-dark">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-github-text-secondary uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-github-text-secondary uppercase tracking-wider hidden md:table-cell">
                                            Size
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-github-border">
                                    {currentPath && (
                                        <tr className="hover:bg-github-dark/50 cursor-pointer" onClick={navigateUp}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-github-text flex items-center">
                                                <GoFileDirectory className="h-5 w-5 text-github-text-secondary mr-2" />
                                                <span>..</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-github-text-secondary hidden md:table-cell">
                                                -
                                            </td>
                                        </tr>
                                    )}
                                    {/* Sort directories first, then files */}
                                    {[...files]
                                        .sort((a, b) => {
                                            if (a.type === "dir" && b.type !== "dir") return -1;
                                            if (a.type !== "dir" && b.type === "dir") return 1;
                                            return a.name.localeCompare(b.name);
                                        })
                                        .map((file) => (
                                            <tr
                                                key={file.path}
                                                className="hover:bg-github-dark/50 cursor-pointer"
                                                onClick={() => file.type === "dir" ? navigateToPath(file.path) : viewFile(file)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-github-text flex items-center">
                                                    {file.type === "dir" ? (
                                                        <GoFileDirectory className="h-5 w-5 text-blue-400 mr-2" />
                                                    ) : (
                                                        <GoFile className="h-5 w-5 text-github-text-secondary mr-2" />
                                                    )}
                                                    <span className={file.type === "dir" ? "text-github-link" : ""}>
                                                        {file.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-github-text-secondary hidden md:table-cell">
                                                    {file.type === "file" ? formatBytes(file.size) : "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    {files.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="px-6 py-4 text-center text-github-text-secondary">
                                                This directory is empty
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}