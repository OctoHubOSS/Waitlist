import { FaChevronRight, FaArrowLeft } from "react-icons/fa";
import { GoGitBranch, GoChevronDown } from "react-icons/go";
import { useFileExplorer } from "../hooks/useFileExplorer";

export default function BranchNavBar() {
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
    } = useFileExplorer();

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
            {/* Breadcrumb navigation */}
            <div className="flex items-center gap-1 text-sm overflow-x-auto pb-2 md:pb-0 order-2 md:order-1">
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

            {/* Branch selector */}
            <div className="branch-selector relative mb-4 md:mb-0 order-1 md:order-2">
                <button
                    className="flex items-center space-x-2 bg-github-dark rounded-md px-3 py-2 border border-github-border hover:bg-github-dark-secondary transition-colors"
                    onClick={() => setBranchMenuOpen(!branchMenuOpen)}
                    disabled={branchesLoading}
                >
                    <GoGitBranch className="h-4 w-4 text-github-text-secondary" />
                    <span className="text-github-text ml-2">{selectedBranch}</span>
                    <GoChevronDown className="h-4 w-4 text-github-text-secondary ml-2" />
                </button>

                {branchMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-github-dark rounded-md shadow-lg z-10 border border-github-border">
                        <div className="py-1 max-h-60 overflow-y-auto">
                            {branchesLoading ? (
                                <div className="px-4 py-2 text-github-text-secondary">Loading branches...</div>
                            ) : branches.length > 0 ? (
                                branches.map(branch => (
                                    <button
                                        key={branch.name}
                                        className={`block w-full text-left px-4 py-2 ${selectedBranch === branch.name
                                            ? 'bg-github-dark-secondary text-github-link'
                                            : 'text-github-text hover:bg-github-dark-secondary'}`}
                                        onClick={() => changeBranch(branch.name)}
                                    >
                                        {branch.name}
                                        {branch.protected && (
                                            <span className="ml-2 text-xs bg-amber-900/30 text-amber-300 px-1 py-0.5 rounded">
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