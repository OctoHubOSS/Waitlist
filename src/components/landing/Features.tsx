'use client';

import { motion } from "framer-motion";
import { FaCode, FaRocket } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { IconType } from 'react-icons';

type FeatureType = {
  title: string;
  description: string;
  icon: IconType;
};

const features: FeatureType[] = [
  {
    title: "Modern Git Platform",
    description: "A fresh take on code hosting and collaboration, built for the modern developer",
    icon: FaCode,
  },
  {
    title: "Advanced Search",
    description: "Lightning-fast code search with advanced filtering and semantic understanding",
    icon: HiSparkles,
  },
  {
    title: "Developer First",
    description: "Built with developer experience at its core, focusing on what matters most",
    icon: FaRocket,
  },
];

export default function Features() {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
    >
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          className="flex flex-col items-center p-6 rounded-lg border border-github-border bg-github-dark-secondary/30 backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          custom={index}
        >
          <feature.icon className="w-8 h-8 text-github-accent mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
          <p className="text-github-text-secondary text-center">{feature.description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}