import { useFileExplorer } from "../hooks/useFileExplorer";
import { GoFileDirectory, GoFile } from "react-icons/go";

export default function DirectoryViewer() {
    const {
        currentPath,
        files,
        isLoading,
        error,
        navigateUp,
        navigateToPath,
        viewFile,
        formatBytes
    } = useFileExplorer();

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-github-border rounded w-full" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-900/30 rounded p-4 text-red-400">
                {error}
            </div>
        );
    }

    return (
        <div>
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
    );
}