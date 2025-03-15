import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight, FaCog } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import RepositoryCard from "@/components/Cards/RepositoryCard";
import { useTrendingRepositories } from "@/utils/fetcher";
import { Repository } from "@/types/repos";

type TimePeriod = "daily" | "weekly" | "monthly";

export default function TrendingRepositories() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("daily");
  const [language, setLanguage] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [stars, setStars] = useState<number>(0);
  const [forks, setForks] = useState<number>(0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Replace useEffect/useState fetch with SWR hook including time period
  const { data: trendingRepos, error, isLoading } = useTrendingRepositories(timePeriod, language, page, stars, forks);

  // Use only up to 6 repositories for display
  const displayRepos = Array.isArray(trendingRepos?.data) ? trendingRepos.data.slice(0, 6) : [];

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

  // Handle time period change
  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
  };

  // Handle language change
  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle stars change
  const handleStarsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStars(Number(event.target.value));
  };

  // Handle forks change
  const handleForksChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForks(Number(event.target.value));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsRef]);

  return (
    <section className="w-full mb-12 md:mb-16">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h2 className="text-xl md:text-2xl font-semibold mb-4 sm:mb-0">Trending Repositories</h2>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center text-github-accent hover:text-github-accent-hover text-sm md:text-base font-medium"
          >
            <FaCog className="mr-2 h-4 w-4" />
            Settings
          </button>

          {showSettings && (
            <div ref={settingsRef} className="absolute right-0 top-full mt-2 w-64 bg-github-dark border border-github-border rounded-md shadow-lg z-10">
              <div className="p-4">
                <label className="block mb-2">
                  <span className="text-sm">Time Period:</span>
                  <select
                    value={timePeriod}
                    onChange={(e) => handleTimePeriodChange(e.target.value as TimePeriod)}
                    className="mt-1 block w-full px-3 py-2 text-sm rounded-md bg-github-dark-secondary text-github-text-primary"
                  >
                    <option value="daily">Today</option>
                    <option value="weekly">This week</option>
                    <option value="monthly">This month</option>
                  </select>
                </label>
                <label className="block mb-2">
                  <span className="text-sm">Language:</span>
                  <select
                    value={language}
                    onChange={handleLanguageChange}
                    className="mt-1 block w-full px-3 py-2 text-sm rounded-md bg-github-dark-secondary text-github-text-primary"
                  >
                    <option value="">All</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="typescript">TypeScript</option>
                    <option value="ruby">Ruby</option>
                    <option value="go">Go</option>
                    <option value="csharp">C#</option>
                    <option value="php">PHP</option>
                    <option value="cpp">C++</option>
                  </select>
                </label>
                <label className="block mb-2">
                  <span className="text-sm">Stars:</span>
                  <input
                    type="number"
                    value={stars}
                    onChange={handleStarsChange}
                    className="mt-1 block w-full px-3 py-2 text-sm rounded-md bg-github-dark-secondary text-github-text-primary"
                    min="0"
                  />
                </label>
                <label className="block mb-2">
                  <span className="text-sm">Forks:</span>
                  <input
                    type="number"
                    value={forks}
                    onChange={handleForksChange}
                    className="mt-1 block w-full px-3 py-2 text-sm rounded-md bg-github-dark-secondary text-github-text-primary"
                    min="0"
                  />
                </label>
                <label className="block mb-2">
                  <span className="text-sm">Page:</span>
                  <input
                    type="number"
                    value={page}
                    onChange={(e) => handlePageChange(Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 text-sm rounded-md bg-github-dark-secondary text-github-text-primary"
                    min="1"
                  />
                </label>
                <button
                  onClick={() => setShowSettings(false)}
                  className="mt-4 w-full px-4 py-2 bg-github-accent text-white rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <Link href={`/trending?since=${timePeriod}`} className="flex items-center text-github-accent hover:text-github-accent-hover text-sm md:text-base font-medium ml-4">
            <motion.span
              initial={{ x: 0 }}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              View more
            </motion.span>
            <motion.div
              initial={{ x: 0 }}
              whileHover={{ x: 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <FaArrowRight className="ml-2 h-4 w-4" />
            </motion.div>
          </Link>
        </div>
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