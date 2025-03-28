import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface FeatureCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkText: string;
}

const FeatureCard = ({
  id,
  icon,
  title,
  description,
  link,
  linkText,
}: FeatureCardProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    },
    hover: { 
      y: -10,
      boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="flex flex-col h-full rounded-xl overflow-hidden bg-gradient-to-br from-github-dark to-github-dark-secondary border border-github-border hover:border-github-accent-hover/50 transition-all duration-300"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex items-center mb-4">
          <div className="p-3 rounded-lg bg-github-accent/20 mr-4">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        
        <p className="text-gray-300 mb-6 flex-grow">{description}</p>
        
        <Link 
          href={link}
          className="mt-auto inline-flex items-center text-github-accent hover:text-github-accent-hover font-medium group"
        >
          <span>{linkText}</span>
          <svg
            className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </Link>
      </div>
      
      {/* Accent border at the bottom with gradient based on ID */}
      <div 
        className="h-1 w-full bg-gradient-to-r from-github-accent to-github-link"
        style={{
          // Slightly different gradient angle based on ID for variety
          transform: `rotate(${(parseInt(id.charCodeAt(0).toString()) % 5) * 2}deg)`,
        }}
      ></div>
    </motion.div>
  );
};

export default FeatureCard;
