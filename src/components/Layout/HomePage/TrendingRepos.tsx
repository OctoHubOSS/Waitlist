import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import RepositoryCard from "@/components/Cards/RepositoryCard";
import { useTrendingRepositories } from "@/utils/fetcher";
import { Repository } from "@/types/repos";

export default function TrendingRepositories() {
  // Replace useEffect/useState fetch with SWR hook
  const { data: trendingRepos, error, isLoading } = useTrendingRepositories();

  // Use only up to 6 repositories for display
  const displayRepos = Array.isArray(trendingRepos) ? trendingRepos.slice(0, 6) : [];

  // Framer Motion variants remain the same
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <section className="w-full mb-12 md:mb-16">
      <motion.div
        className="flex items-center justify-between mb-6 md:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h2 className="text-xl md:text-2xl font-semibold">Trending Repositories</h2>
        <Link href="/trending" className="flex items-center text-github-accent hover:text-github-accent-hover text-sm md:text-base font-medium">
          <motion.span
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            View all trending
          </motion.span>
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <FaArrowRight className="ml-2 h-4 w-4" />
          </motion.div>
        </Link>
      </motion.div>

      {isLoading ? (
        <motion.div
          className="flex justify-center items-center min-h-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-12 h-12 border-4 border-github-accent/30 border-t-github-accent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-github-text-secondary">Failed to load trending repositories</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {displayRepos.length > 0 ? (
            displayRepos.map((repo: Repository, index: number) => (
              <motion.div
                key={repo.id}
                variants={itemVariants}
                custom={index}
                whileHover="hover"
              >
                <RepositoryCard repo={repo} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-github-text-secondary">No trending repositories found</p>
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}