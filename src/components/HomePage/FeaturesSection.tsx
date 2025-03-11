import Link from "next/link";
import { motion } from "framer-motion";
import { FaUser, FaBuilding, FaCode, FaStar, FaChartArea, FaArrowRight } from "react-icons/fa";
import { GoRepo } from "react-icons/go";
import { ReactNode } from "react";

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  link: string;
  linkText: string;
}

export default function FeaturesSection() {
  const discoverItems: FeatureItem[] = [
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

  return (
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
  );
}
