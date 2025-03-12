import { motion } from "framer-motion";
import { FaLock, FaUnlock, FaBalanceScale, FaDatabase } from "react-icons/fa";
import { RepoPage } from "@/types/repos";
import LanguageIcon from "@/components/Icons/Lang";

interface RepositoryDetailsGridProps {
    repository: RepoPage;
    itemVariants: any;
}

// Helper function to format repository size
const formatRepoSize = (sizeInKb: number): string => {
    if (sizeInKb < 1024) {
        return `${sizeInKb} KB`;
    } else if (sizeInKb < 1024 * 1024) {
        return `${(sizeInKb / 1024).toFixed(2)} MB`;
    } else {
        return `${(sizeInKb / (1024 * 1024)).toFixed(2)} GB`;
    }
};

export default function RepositoryDetailsGrid({ repository, itemVariants }: RepositoryDetailsGridProps) {
    return (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="card card-hover">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-github-dark">
                        {repository.language ? (
                            <span className="flex items-center">
                                <LanguageIcon language={repository.language} size="sm" className="mr-2" />
                                <span className="text-sm font-medium text-github-text">{repository.language}</span>
                            </span>
                        ) : (
                            <span className="text-sm text-github-text-secondary">No language specified</span>
                        )}
                    </div>
                </div>
                <h3 className="text-lg font-bold text-github-text">Main Language</h3>
                <p className="text-sm text-github-text-secondary mt-1">Primary programming language</p>
            </div>

            <div className="card card-hover">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-github-dark">
                        {repository.archived ? (
                            <FaLock className="h-4 w-4 text-amber-400" />
                        ) : (
                            <FaUnlock className="h-4 w-4 text-github-accent" />
                        )}
                    </div>
                </div>
                <h3 className="text-lg font-bold text-github-text">{repository.archived ? "Archived" : "Active"}</h3>
                <p className="text-sm text-github-text-secondary mt-1">Repository status</p>
            </div>

            <div className="card card-hover">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-github-dark">
                        <FaDatabase className="h-4 w-4 text-teal-500" />
                    </div>
                </div>
                <h3 className="text-lg font-bold text-github-text">{formatRepoSize(repository.size)}</h3>
                <p className="text-sm text-github-text-secondary mt-1">Repository size</p>
            </div>

            <div className="card card-hover">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-github-dark">
                        {repository.license ? (
                            <FaBalanceScale className="h-4 w-4 text-github-link" />
                        ) : (
                            <span className="text-xs text-github-text-secondary">None</span>
                        )}
                    </div>
                </div>
                <h3 className="text-lg font-bold text-github-text">{repository.license ? repository.license.name : "No License"}</h3>
                <p className="text-sm text-github-text-secondary mt-1">License information</p>
            </div>
        </motion.div>
    );
}