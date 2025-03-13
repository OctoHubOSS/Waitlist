import { motion } from "framer-motion";
import { GoRepo } from "react-icons/go";

interface RepositoryNotFoundProps {
    error?: string | Error | null;
}

export default function RepositoryNotFound({ error }: RepositoryNotFoundProps) {
    // Extract error message from different error types
    const errorMessage = error instanceof Error
        ? error.message
        : typeof error === 'string'
            ? error
            : "We couldn't find the repository you're looking for. Please check the username and repository name and try again.";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-6 flex flex-col items-center justify-center text-center py-16"
        >
            <GoRepo className="text-6xl text-github-text-secondary mb-4" />
            <h2 className="text-2xl font-bold text-github-text mb-2">Repository Not Found</h2>
            <p className="text-github-text-secondary max-w-md mb-4">
                {errorMessage}
            </p>
            {error && (
                <div className="mt-2">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-4 py-2 bg-github-dark-secondary hover:bg-github-border rounded-md text-sm transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            )}
        </motion.div>
    );
}