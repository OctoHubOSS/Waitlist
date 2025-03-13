import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaUnlock, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { GoRepo } from "react-icons/go";
import { RepoPage } from "@/types/repos";

interface RepositoryHeaderProps {
    repository: RepoPage;
    itemVariants: any;
}

export default function RepositoryHeader({ repository, itemVariants }: RepositoryHeaderProps) {
    const [showAllTopics, setShowAllTopics] = useState(false);
    const MAX_VISIBLE_TOPICS = 3;

    // Determine if we need to show the "View All" button
    const hasMoreTopics = repository.topics && repository.topics.length > MAX_VISIBLE_TOPICS;

    // Get visible topics based on current state
    const visibleTopics = repository.topics ?
        (showAllTopics ? repository.topics : repository.topics.slice(0, MAX_VISIBLE_TOPICS))
        : [];

    return (
        <div className="flex flex-col md:flex-row md:items-start gap-8">
            <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative flex h-32 w-32 shrink-0 overflow-hidden rounded-xl shadow-github border-2 border-github-border bg-github-dark-secondary -mt-5"
            >
                <img
                    alt={repository.owner.login}
                    className="h-full w-full object-cover transition-all duration-300 hover:brightness-110"
                    src={repository.owner.avatar_url}
                />
            </motion.div>

            {/* Repository Info */}
            <div className="space-y-4 flex-1">
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold text-github-text">{repository.name}</h1>
                            {repository.visibility && (
                                <span className="badge badge-secondary inline-flex items-center">
                                    {repository.visibility === "public" ? (
                                        <FaUnlock className="mr-1 h-3 w-3" />
                                    ) : (
                                        <FaLock className="mr-1 h-3 w-3" />
                                    )}
                                    {repository.visibility}
                                </span>
                            )}
                        </div>
                    </div>

                    <motion.a
                        href={repository.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center"
                    >
                        <GoRepo className="h-4 w-4 mr-2" />
                        View on GitHub
                    </motion.a>
                </motion.div>

                <motion.p variants={itemVariants} className="text-md max-w-3xl text-github-text">
                    {repository.description || "No description provided"}
                </motion.p>

                {/* Repository Topics with View All Button */}
                {repository.topics && repository.topics.length > 0 && (
                    <motion.div variants={itemVariants} className="mt-2">
                        <div className="flex flex-wrap gap-2 items-center">
                            {/* Visible topics */}
                            <AnimatePresence>
                                {visibleTopics.map((topic) => (
                                    <motion.span
                                        key={topic}
                                        className="badge badge-primary"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {topic}
                                    </motion.span>
                                ))}
                            </AnimatePresence>

                            {/* View All / View Less Button */}
                            {hasMoreTopics && (
                                <button
                                    onClick={() => setShowAllTopics(!showAllTopics)}
                                    className="flex items-center text-xs text-github-link hover:text-github-link-hover ml-1"
                                >
                                    {showAllTopics ? (
                                        <>
                                            <span>View Less</span>
                                            <FaChevronUp className="ml-1 h-3 w-3" />
                                        </>
                                    ) : (
                                        <>
                                            <span>+{repository.topics.length - MAX_VISIBLE_TOPICS} more</span>
                                            <FaChevronDown className="ml-1 h-3 w-3" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}