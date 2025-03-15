import { motion } from "framer-motion";
import SearchForm from "./SearchForm";

interface HeroSectionProps {
  title: string;
  description: string;
}

export default function HeroSection({ title, description }: HeroSectionProps) {
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

  return (
    <motion.section
      className="text-center w-full mb-24"
      initial="hidden"
      animate="visible"
      variants={heroVariants}
    >
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan">
        {title}
      </h1>
      <motion.p
        className="text-lg md:text-xl text-github-text-secondary mb-8 md:mb-10 max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        {description}
      </motion.p>

      <SearchForm />
    </motion.section>
  );
}
