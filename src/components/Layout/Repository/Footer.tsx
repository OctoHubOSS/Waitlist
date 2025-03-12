import { motion } from "framer-motion";
import { FaCodeBranch, FaLock } from "react-icons/fa";
import { GoRepo } from "react-icons/go";
import { format } from "date-fns";
import { RepoPage } from "@/types/repos";

interface RepositoryFooterProps {
    repository: RepoPage;
    itemVariants: any;
}

export default function RepositoryFooter({ repository, itemVariants }: RepositoryFooterProps) {
    return (
        <motion.div variants={itemVariants} className="mt-8 card">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-github-text-secondary text-sm">Last updated</span>
                    <h4 className="text-xl font-semibold text-github-text">
                        {format(new Date(repository.updated_at), "MMMM dd, yyyy")}
                    </h4>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2 text-github-text-secondary">
                        {repository.allow_forking ? (
                            <FaCodeBranch className="h-4 w-4 text-github-accent" />
                        ) : (
                            <FaLock className="h-4 w-4 text-red-500" />
                        )}
                        <span>{repository.allow_forking ? "Forking Allowed" : "Forking Disabled"}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-github-text-secondary">
                        {repository.is_template ? (
                            <GoRepo className="h-4 w-4 text-neon-purple" />
                        ) : (
                            <span className="text-github-text-secondary">•</span>
                        )}
                        <span>{repository.is_template ? "Template Repository" : "Standard Repository"}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}