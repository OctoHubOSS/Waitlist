"use client";

import React from "react";
import { motion } from "framer-motion";
import FeatureCard from "./FeatureCard";
import { FaUser, FaBuilding, FaCode, FaStar, FaChartArea } from "react-icons/fa";
import { GoRepo } from "react-icons/go";

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  linkText: string;
}

// Use a consistent export style
const FeaturesList = () => {
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

  return (
    <section className="w-full py-12">
      <motion.h2
        className="text-3xl font-bold mb-12 text-center text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <span className="relative">
          What You Can Discover
          <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full mx-auto w-24"></span>
        </span>
      </motion.h2>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {discoverItems.map((item) => (
          <div key={item.id} className="flex h-full">
            <FeatureCard
              id={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
              link={item.link}
              linkText={item.linkText}
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default FeaturesList;
