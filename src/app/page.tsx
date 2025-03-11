"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaBuilding,
  FaCode,
  FaStar,
  FaChartArea,
  FaSearch,
  FaArrowRight,
  FaChevronDown,
  FaFilter,
} from "react-icons/fa";
import { GoRepo } from "react-icons/go";
import RepositoryCard from "@/components/Cards/RepositoryCard";

interface Repository {
  id: number;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  updatedAt: string;
  url: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("users"); // users, orgs, repos
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const [trendingRepos, setTrendingRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchType === "users") {
        router.push(`/${searchQuery.trim()}`);
      } else if (searchType === "orgs") {
        router.push(`/${searchQuery.trim()}`);
      } else {
        router.push(`/repo/${searchQuery.trim()}`);
      }
    }
  };

  useEffect(() => {
    async function fetchTrendingRepos() {
      try {
        const response = await fetch("/api/trending");
        const data: Repository[] = await response.json();
        setTrendingRepos(data);
      } catch (error) {
        console.error("Error fetching trending repositories:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrendingRepos();
  }, []);

  const discoverItems = [
    {
      id: "users",
      title: "Developers",
      description:
        "Find talented developers on GitHub based on location, programming languages, and contributions. Connect with the minds behind your favorite projects.",
      icon: <FaUser className="h-6 w-6 text-github-accent" />,
      link: "/explore?type=users",
      linkText: "Explore developers",
    },
    {
      id: "orgs",
      title: "Organizations",
      description:
        "Discover organizations pushing the boundaries of open source. From tech giants to emerging startups, explore their contributions to the developer community.",
      icon: <FaBuilding className="h-6 w-6 text-github-accent" />,
      link: "/explore?type=orgs",
      linkText: "Find organizations",
    },
    {
      id: "repos",
      title: "Repositories",
      description:
        "Search through millions of repositories to find code examples, tools, and frameworks that match your needs. Filter by language, stars, and activity.",
      icon: <GoRepo className="h-6 w-6 text-github-accent" />,
      link: "/explore?type=repos",
      linkText: "Search repositories",
    },
    {
      id: "languages",
      title: "Programming Languages",
      description:
        "Explore repositories by programming language to find projects that match your tech stack or discover new languages to learn through real-world examples.",
      icon: <FaCode className="h-6 w-6 text-github-accent" />,
      link: "/languages",
      linkText: "Browse languages",
    },
    {
      id: "trending",
      title: "Trending Projects",
      description:
        "Stay updated with the hottest projects on GitHub. See what developers are starring, forking, and contributing to across different timeframes.",
      icon: <FaChartArea className="h-6 w-6 text-github-accent" />,
      link: "/trending",
      linkText: "View trending",
    },
    {
      id: "collections",
      title: "Collections",
      description:
        "Discover curated collections of repositories organized by topics, use cases, and technologies. Find everything from beginner-friendly projects to advanced developer tools.",
      icon: <FaStar className="h-6 w-6 text-github-accent" />,
      link: "/collections",
      linkText: "Explore collections",
    },
  ];

  // Framer Motion variants
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

  const heroVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const searchFormVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3,
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const filterDropdownVariants = {
    hidden: { opacity: 0, y: -10, height: 0 },
    visible: {
      opacity: 1,
      y: 0,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      height: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <motion.section
        className="text-center w-full mb-12 md:mb-16"
        initial="hidden"
        animate="visible"
        variants={heroVariants}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan">
          Discover the GitHub Universe
        </h1>
        <motion.p
          className="text-lg md:text-xl text-github-text-secondary mb-8 md:mb-10 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Find developers, organizations, and repositories with OctoSearch's powerful discovery platform.
        </motion.p>

        {/* Search Form */}
        <motion.form
          onSubmit={handleSearch}
          className="relative mt-6 w-full max-w-3xl mx-auto"
          variants={searchFormVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center bg-github-dark-secondary border border-github-border rounded-lg shadow-lg overflow-hidden transition-all hover:border-github-accent/50 focus-within:border-github-accent">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search for ${searchType}...`}
              className="flex-1 bg-transparent text-github-text px-4 py-3 focus:outline-none text-base placeholder-gray-500"
            />
            <motion.button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-github-dark-secondary text-github-text-secondary hover:text-github-accent transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaFilter className="h-5 w-5" />
            </motion.button>
            <motion.button
              type="submit"
              className="bg-github-accent hover:bg-github-accent-hover text-white px-6 py-3 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSearch className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Filters Dropdown */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="absolute left-0 right-0 mt-2 bg-github-dark-secondary border border-github-border rounded-lg shadow-md overflow-hidden z-10 flex items-center"
                variants={filterDropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="flex-1 bg-github-dark-secondary text-github-text px-4 py-3 focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="users">Users</option>
                  <option value="orgs">Organizations</option>
                  <option value="repos">Repositories</option>
                </select>
                <FaChevronDown className="h-5 w-5 text-github-text-secondary mr-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>
      </motion.section>

      {/* Features Section */}
      <section className="w-full mb-12 md:mb-16">
        <motion.h2
          className="text-xl md:text-2xl font-semibold mb-6 md:mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          What You Can Discover
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {discoverItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="bg-github-dark-secondary border border-github-border rounded-lg p-6 hover:border-github-accent/50 transition-all shadow-md"
              variants={itemVariants}
              whileHover="hover"
              custom={index}
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  className="bg-github-accent/20 p-3 rounded-full"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-lg font-medium">{item.title}</h3>
              </div>
              <p className="text-github-text-secondary">{item.description}</p>
              <Link href={item.link} className="inline-flex items-center mt-4 text-github-accent hover:text-github-accent-hover font-medium">
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {item.linkText}
                </motion.span>
                <motion.div
                  initial={{ x: 0, opacity: 1 }}
                  whileHover={{ x: 8, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <FaArrowRight className="ml-2 h-4 w-4" />
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Trending Section */}
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

        {loading ? (
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
        ) : (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {trendingRepos.map((repo, index) => (
              <motion.div
                key={repo.id}
                variants={itemVariants}
                custom={index}
                whileHover="hover"
              >
                <RepositoryCard repo={repo} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
