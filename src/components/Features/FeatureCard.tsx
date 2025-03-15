import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

interface FeatureCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

// Make sure the export is clear and straightforward
const FeatureCard = ({ id, icon, title, description, link, linkText }: FeatureCardProps) => {
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
    <motion.div
      key={id}
      className="bg-github-dark-secondary border border-github-border rounded-lg p-6 hover:border-github-accent/50 transition-all shadow-md"
      variants={itemVariants}
      whileHover="hover"
    >
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          className="bg-github-accent/20 p-3 rounded-full"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {icon}
        </motion.div>
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <p className="text-github-text-secondary">{description}</p>
      <Link href={link} className="inline-flex items-center mt-4 text-github-accent hover:text-github-accent-hover font-medium">
        <motion.span
          initial={{ x: 0 }}
          whileHover={{ x: 4 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {linkText}
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
  );
};

export default FeatureCard;
