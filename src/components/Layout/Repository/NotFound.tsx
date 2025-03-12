import { motion } from "framer-motion";
import { GoRepo } from "react-icons/go";

export default function RepositoryNotFound() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-6 flex flex-col items-center justify-center text-center py-16"
        >
            <GoRepo className="text-6xl text-github-text-secondary mb-4" />
            <h2 className="text-2xl font-bold text-github-text mb-2">Repository Not Found</h2>
            <p className="text-github-text-secondary max-w-md">
                We couldn't find the repository you're looking for. Please check the username and repository name and try again.
            </p>
        </motion.div>
    );
}