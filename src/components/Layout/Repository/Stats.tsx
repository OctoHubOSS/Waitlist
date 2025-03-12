import { motion } from "framer-motion";
import { FaStar, FaCodeBranch, FaEye, FaExclamationTriangle } from "react-icons/fa";
import { GoGitBranch } from "react-icons/go";
import { RepoPage } from "@/types/repos";

interface RepositoryStatsProps {
    repository: RepoPage;
    itemVariants: any;
}

export default function RepositoryStats({ repository, itemVariants }: RepositoryStatsProps) {
    return (
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-6">
            <div className="card card-hover p-3 text-center">
                <div className="flex items-center justify-center text-yellow-400 mb-1">
                    <FaStar className="h-5 w-5" />
                </div>
                <p className="text-lg font-bold text-github-text">{repository.stargazers_count.toLocaleString()}</p>
                <p className="text-xs text-github-text-secondary">Stars</p>
            </div>

            <div className="card card-hover p-3 text-center">
                <div className="flex items-center justify-center text-github-link mb-1">
                    <FaCodeBranch className="h-5 w-5" />
                </div>
                <p className="text-lg font-bold text-github-text">{repository.forks_count.toLocaleString()}</p>
                <p className="text-xs text-github-text-secondary">Forks</p>
            </div>

            <div className="card card-hover p-3 text-center">
                <div className="flex items-center justify-center text-neon-purple mb-1">
                    <FaEye className="h-5 w-5" />
                </div>
                <p className="text-lg font-bold text-github-text">{repository.watchers_count.toLocaleString()}</p>
                <p className="text-xs text-github-text-secondary">Watchers</p>
            </div>

            <div className="card card-hover p-3 text-center">
                <div className="flex items-center justify-center text-red-500 mb-1">
                    <FaExclamationTriangle className="h-5 w-5" />
                </div>
                <p className="text-lg font-bold text-github-text">{repository.open_issues_count.toLocaleString()}</p>
                <p className="text-xs text-github-text-secondary">Issues</p>
            </div>

            <div className="card card-hover p-3 text-center">
                <div className="flex items-center justify-center text-github-accent mb-1">
                    <GoGitBranch className="h-5 w-5" />
                </div>
                <p className="text-lg font-bold text-github-text">{repository.default_branch}</p>
                <p className="text-xs text-github-text-secondary">Default Branch</p>
            </div>
        </motion.div>
    );
}