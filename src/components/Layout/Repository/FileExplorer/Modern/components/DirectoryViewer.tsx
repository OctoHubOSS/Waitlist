import { useModernFileExplorer } from "../hooks/useModernFileExplorer";
import { GoFileDirectory, GoFileCode } from "react-icons/go";
import { FaMarkdown } from "react-icons/fa";

export default function ModernDirectoryViewer() {
    const {
        currentPath,
        files,
        isLoading,
        error,
        navigateUp,
        navigateToPath,
        viewFile,
        formatBytes,
        isMarkdown
    } = useModernFileExplorer();

    if (isLoading) {
        return (
            <div className="animate-pulse p-4 space-y-3">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 bg-github-border/20 rounded-md w-full" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="m-4 bg-red-900/20 border border-red-900/30 rounded-md p-4 text-red-400">
                {error}
            </div>
        );
    }

    return (
        <div className="modern-directory-viewer">
            <div className="grid gap-2 p-4">
                {currentPath && (
                    <button
                        onClick={navigateUp}
                        className="flex items-center p-3 rounded-md hover:bg-github-dark-secondary transition-colors"
                    >
                        <GoFileDirectory className="h-5 w-5 text-blue-400 mr-3" />
                        <div className="flex-1">
                            <span className="text-github-link">..</span>
                            <p className="text-xs text-github-text-secondary mt-1">Parent directory</p>
                        </div>
                    </button>
                )}

                {/* Sort directories first, then files */}
                {[...files]
                    .sort((a, b) => {
                        if (a.type === "dir" && b.type !== "dir") return -1;
                        if (a.type !== "dir" && b.type === "dir") return 1;
                        return a.name.localeCompare(b.name);
                    })
                    .map((file) => (
                        <button
                            key={file.path}
                            className="flex items-center p-3 rounded-md hover:bg-github-dark-secondary transition-colors"
                            onClick={() => file.type === "dir" ? navigateToPath(file.path) : viewFile(file)}
                        >
                            {file.type === "dir" ? (
                                <GoFileDirectory className="h-5 w-5 text-blue-400 mr-3" />
                            ) : isMarkdown(file.name) ? (
                                <FaMarkdown className="h-5 w-5 text-green-400 mr-3" />
                            ) : (
                                <GoFileCode className="h-5 w-5 text-github-text-secondary mr-3" />
                            )}
                            <div className="flex-1 text-left">
                                <span className={file.type === "dir" ? "text-github-link" : "text-github-text"}>
                                    {file.name}
                                </span>
                                {file.type === "file" && (
                                    <p className="text-xs text-github-text-secondary mt-1">
                                        {formatBytes(file.size)}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}

                {files.length === 0 && (
                    <div className="text-center p-8 text-github-text-secondary">
                        This directory is empty
                    </div>
                )}
            </div>
        </div>
    );
}
