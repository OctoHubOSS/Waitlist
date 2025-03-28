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
        "Connect with talented developers on OctoHub based on skills, projects, and contributions. Build your network and collaborate with professionals who share your interests.",
      icon: <FaUser className="h-6 w-6 text-github-accent" />,
      link: "/explore?type=users",
      linkText: "Explore developers",
    },
    {
      id: "orgs",
      title: "Organizations",
      description:
        "Discover teams and organizations using OctoHub for their development needs. From tech companies to open-source communities, see how they leverage our platform.",
      icon: <FaBuilding className="h-6 w-6 text-github-accent" />,
      link: "/explore?type=orgs",
      linkText: "Find organizations",
    },
    {
      id: "repos",
      title: "Repositories",
      description:
        "Browse through our extensive collection of repositories to find code, tools, and frameworks. Use our advanced filters to narrow down by language, popularity, and activity.",
      icon: <GoRepo className="h-6 w-6 text-github-accent" />,
      link: "/explore?type=repos",
      linkText: "Search repositories",
    },
    {
      id: "languages",
      title: "Programming Languages",
      description:
        "Find projects by programming language to match your skills or explore new technologies through practical examples. OctoHub supports all major languages and frameworks.",
      icon: <FaCode className="h-6 w-6 text-github-accent" />,
      link: "/languages",
      linkText: "Browse languages",
    },
    {
      id: "trending",
      title: "Trending Projects",
      description:
        "Stay on top of what's hot in the developer community. Discover the most active and rapidly growing projects on OctoHub across different time periods.",
      icon: <FaChartArea className="h-6 w-6 text-github-accent" />,
      link: "/trending",
      linkText: "View trending",
    },
    {
      id: "collections",
      title: "Collections",
      description:
        "Explore our carefully curated collections of repositories organized by topics and use cases. From beginner resources to specialized developer tools, find exactly what you need.",
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
    <section className="w-full py-16 px-4">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="text-3xl md:text-4xl font-bold mb-4 text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="relative inline-block">
            Discover OctoHub's Features
            <span className="absolute -bottom-3 left-0 right-0 h-1 bg-gradient-to-r from-github-accent to-github-link rounded-full mx-auto" style={{ width: '70%' }}></span>
          </span>
        </motion.h2>
        
        <motion.p 
          className="text-gray-300 text-center max-w-3xl mx-auto mb-12 text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Everything you need to streamline your development workflow and collaborate effectively
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {discoverItems.map((item) => (
            <div key={item.id} className="h-full">
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
      </motion.div>
    </section>
  );
};

export default FeaturesList;
