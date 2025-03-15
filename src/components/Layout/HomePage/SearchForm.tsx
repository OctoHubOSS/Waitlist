import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaFilter, FaChevronDown } from "react-icons/fa";

export default function SearchForm() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("users"); // users, orgs, repos
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchType === "users") {
        router.push(`/user/${searchQuery.trim()}`);
      } else if (searchType === "orgs") {
        router.push(`/${searchQuery.trim()}`);
      } else {
        router.push(`/repo/${searchQuery.trim()}`);
      }
    }
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
  );
}
