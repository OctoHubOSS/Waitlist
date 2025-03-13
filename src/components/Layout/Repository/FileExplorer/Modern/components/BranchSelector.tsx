import { FaChevronDown } from "react-icons/fa";

interface BranchSelectorProps {
    selectedBranch: string;
    branchMenuOpen: boolean;
    setBranchMenuOpen: (isOpen: boolean) => void;
    changeBranch: (branch: string) => void;
    branches: any[];
}

const BranchSelector = ({
    selectedBranch,
    branchMenuOpen,
    setBranchMenuOpen,
    changeBranch,
    branches
}: BranchSelectorProps) => {
    return (
        <div className="relative">
            <button
                onClick={() => setBranchMenuOpen(!branchMenuOpen)}
                className="flex items-center space-x-2 bg-github-dark hover:bg-github-dark-secondary border border-github-border text-white px-4 py-2 rounded-full transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>{selectedBranch}</span>
                <FaChevronDown className="w-3 h-3" />
            </button>

            {branchMenuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-github-dark rounded-lg border border-gray-700 shadow-xl z-10 w-56 py-1 overflow-hidden">
                    <div className="max-h-60 overflow-auto">
                        <div className="px-4 py-2 text-xs text-gray-500 uppercase border-b border-gray-700">Branches</div>
                        {branches.map(branch => (
                            <button
                                key={branch.name}
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700
                                ${selectedBranch === branch.name
                                        ? 'bg-github-link/15 text-github-link font-medium'
                                        : 'text-white'}`}
                                onClick={() => {
                                    changeBranch(branch.name);
                                    setBranchMenuOpen(false);
                                }}
                            >
                                {branch.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchSelector;