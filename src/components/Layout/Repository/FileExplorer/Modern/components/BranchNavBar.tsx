import { FaChevronRight } from "react-icons/fa";
import { GoGitBranch, GoChevronDown } from "react-icons/go";
import { useModernFileExplorer } from "../hooks/useModernFileExplorer";

export default function ModernBranchNavBar() {
    const {
        breadcrumbs,
        selectedFile,
        backToDirectory,
        navigateToPath,
        branches,
        selectedBranch,
        branchesLoading,
        branchMenuOpen,
        setBranchMenuOpen,
        changeBranch
    } = useModernFileExplorer();

    return (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-github-dark to-github-dark-secondary border-b border-github-border">
            {/* Breadcrumb navigation */}
            <div className="flex items-center gap-2 text-sm overflow-x-auto">
                {selectedFile ? (
                    <div className="flex items-center">
                        <button
                            onClick={backToDirectory}
                            className="flex items-center text-github-link hover:text-github-link-hover"
                        >
                            <span>Root</span>
                        </button>
                        <FaChevronRight className="h-3 w-3 mx-2 text-github-text-secondary" />
                        <span className="text-github-text">{selectedFile.name}</span>
                    </div>
                ) : (
                    breadcrumbs.map((crumb, index) => (
                        <div key={crumb.path} className="flex items-center">
                            {index > 0 && <FaChevronRight className="h-3 w-3 mx-2 text-github-text-secondary" />}
                            <button
                                onClick={() => navigateToPath(crumb.path)}
                                className={`px-2 py-1 rounded-md ${index === breadcrumbs.length - 1
                                    ? "bg-github-dark-secondary text-github-text"
                                    : "hover:bg-github-dark-secondary text-github-text-secondary hover:text-github-text"
                                    }`}
                            >
                                {crumb.name}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Branch selector */}
            <div className="branch-selector relative">
                <button
                    className="flex items-center space-x-2 bg-github-dark rounded-full px-4 py-1 border border-github-border hover:bg-github-dark-secondary transition-colors"
                    onClick={() => setBranchMenuOpen(!branchMenuOpen)}
                    disabled={branchesLoading}
                >
                    <GoGitBranch className="h-4 w-4 text-github-text-secondary" />
                    <span className="text-github-text ml-2">{selectedBranch}</span>
                    <GoChevronDown className="h-4 w-4 text-github-text-secondary ml-2" />
                </button>

                {branchMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-github-dark rounded-lg shadow-lg z-10 border border-github-border overflow-hidden">
                        <div className="p-2 border-b border-github-border">
                            <input
                                type="text"
                                placeholder="Find a branch..."
                                className="w-full px-3 py-1.5 bg-github-dark-secondary border border-github-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-github-link"
                            />
                        </div>
                        <div className="py-1 max-h-72 overflow-y-auto">
                            {branchesLoading ? (
                                <div className="px-4 py-2 text-github-text-secondary">Loading branches...</div>
                            ) : branches.length > 0 ? (
                                branches.map(branch => (
                                    <button
                                        key={branch.name}
                                        className={`flex items-center w-full text-left px-4 py-2 ${selectedBranch === branch.name
                                            ? 'bg-github-dark-secondary text-github-link'
                                            : 'text-github-text hover:bg-github-dark-secondary'
                                            }`}
                                        onClick={() => changeBranch(branch.name)}
                                    >
                                        <GoGitBranch className="h-4 w-4 mr-2 text-github-text-secondary" />
                                        <span>{branch.name}</span>
                                        {branch.protected && (
                                            <span className="ml-auto text-xs bg-amber-900/30 text-amber-300 px-2 py-0.5 rounded-full">
                                                protected
                                            </span>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-github-text-secondary">No branches found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
