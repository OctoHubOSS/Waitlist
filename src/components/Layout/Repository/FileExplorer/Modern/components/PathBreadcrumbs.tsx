import { FaFolder } from "react-icons/fa";

interface PathBreadcrumbsProps {
    currentPath: string;
    navigateToPath: (path: string) => void;
    navigateUp: () => void;
    selectedFile: any | null;
}

const PathBreadcrumbs = ({
    currentPath,
    navigateToPath,
    navigateUp,
    selectedFile
}: PathBreadcrumbsProps) => {
    return (
        <div className="flex flex-wrap items-center gap-1">
            <FaFolder className="text-github-link mr-2" />
            <button
                onClick={() => navigateToPath("")}
                className="text-github-link hover:underline text-sm font-medium"
            >
                Root
            </button>

            {/* Path breadcrumbs */}
            {currentPath && currentPath.split('/').filter(Boolean).map((part, index, parts) => (
                <div key={index} className="flex items-center">
                    <span className="mx-1 text-gray-500">/</span>
                    <button
                        onClick={() => navigateToPath(parts.slice(0, index + 1).join('/'))}
                        className="text-github-link hover:underline text-sm font-medium whitespace-nowrap"
                    >
                        {part}
                    </button>
                </div>
            ))}

            {/* Show selected file in breadcrumbs */}
            {selectedFile && (
                <div className="flex items-center">
                    <span className="mx-1 text-gray-500">/</span>
                    <span className="text-github-text text-sm font-medium whitespace-nowrap">
                        {selectedFile.name}
                    </span>
                </div>
            )}

            {/* Up to parent button */}
            {currentPath && !selectedFile && (
                <button
                    onClick={navigateUp}
                    className="ml-2 text-github-text-secondary hover:text-github-link text-xs border border-gray-700 rounded-full px-2 py-0.5 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Up
                </button>
            )}
        </div>
    );
};

export default PathBreadcrumbs;