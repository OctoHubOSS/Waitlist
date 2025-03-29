'use client';

import { motion } from "framer-motion";
import { useState } from 'react';

type FaqItemType = {
  question: string;
  answer: string;
};

const faqs: FaqItemType[] = [
  {
    question: "What is OctoHub?",
    answer: "OctoHub is a modern Git platform designed to revolutionize how developers collaborate. We're building a next-generation code hosting and collaboration platform that focuses on developer experience, powerful features, and seamless integration with modern development workflows."
  },
  {
    question: "How is OctoHub different from other Git platforms?",
    answer: "OctoHub brings a fresh perspective to code hosting with modern features, improved performance, and a focus on developer experience. We're building on what works while introducing innovative features that make development more efficient and enjoyable. Our platform is designed from the ground up for modern development workflows."
  },
  {
    question: "What features will OctoHub offer?",
    answer: "OctoHub will include advanced code search, modern collaboration tools, integrated CI/CD, and powerful repository management. We're focusing on features that matter most to developers, with a particular emphasis on performance, security, and ease of use."
  },
  {
    question: "Can I import my existing repositories?",
    answer: "Yes! We're developing comprehensive import tools to make it easy to move your repositories from any Git platform to OctoHub. This includes preserving your repository history, issues, pull requests, and other metadata."
  },
  {
    question: "What happens when I join the waitlist?",
    answer: "By joining our waitlist, you'll be among the first to know when we launch. You'll receive exclusive early access opportunities, special launch offers, and regular updates about our progress. We'll never spam you - you'll only receive important updates about our launch."
  },
  {
    question: "Is OctoHub free to use?",
    answer: "We'll offer both free and paid tiers. The free tier will include generous limits for individual developers and small teams, while paid tiers will provide additional features and higher limits for larger organizations."
  }
];

export default function FAQ() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold text-white text-center">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={faq.question}
            className="border border-github-border rounded-lg bg-github-dark-secondary/30 backdrop-blur-sm overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-github-dark-secondary/50 transition-colors"
              onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
            >
              <span className="text-lg font-medium text-white">{faq.question}</span>
              <span className={`transform transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {openFaqIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-4"
              >
                <p className="text-github-text-secondary">{faq.answer}</p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
