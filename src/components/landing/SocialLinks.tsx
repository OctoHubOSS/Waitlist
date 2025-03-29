'use client';

import { motion } from "framer-motion";
import { FaGithub, FaDiscord, FaTwitter } from 'react-icons/fa';

export default function SocialLinks() {
  return (
    <motion.div
      className="text-center space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    >
      <h3 className="text-xl font-semibold text-white">Stay Connected</h3>
      <div className="flex justify-center space-x-6">
        <motion.a
          href="https://github.com/OctoHubOSS"
          target="_blank"
          rel="noopener noreferrer"
          className="text-github-text-secondary hover:text-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaGithub className="w-8 h-8" />
        </motion.a>
        <motion.a
          href="https://twitter.com/HeyOctoHub"
          target="_blank"
          rel="noopener noreferrer"
          className="text-github-text-secondary hover:text-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaTwitter className="w-8 h-8" />
        </motion.a>
        <motion.a
          href="https://discord.gg/EvgtRgVEed"
          target="_blank"
          rel="noopener noreferrer"
          className="text-github-text-secondary hover:text-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaDiscord className="w-8 h-8" />
        </motion.a>
      </div>
    </motion.div>
  );
}
