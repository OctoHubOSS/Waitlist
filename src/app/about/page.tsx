import { Metadata } from "next";
import AboutLayout from "@/components/Layout/About";
import FeaturesList from "@/components/Features/FeaturesList";
import { FaSearch, FaLightbulb, FaCode, FaHeart } from "react-icons/fa";

export const metadata: Metadata = {
  title: "About OctoSearch | Advanced Code Search",
  description:
    "OctoSearch is a powerful tool for developers to search code across repositories with semantic understanding and lightning-fast results.",
};

export default function AboutPage() {
  const showFeatures = true;

  return (
    <AboutLayout>
      <article className="space-y-12 ">
        {/* Hero Section */}
        <section className="relative p-6 md:p-10 rounded-2xl bg-github-dark-secondary border border-github-border overflow-hidden glow-effect">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Revolutionizing Code Search
          </h1>
          <p className="text-lg leading-relaxed mb-8">
            OctoSearch was built by developers, for developers. Our mission is
            to make code discovery faster and smarter.
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-neon-purple to-neon-blue rounded-full" />
        </section>

        {/* Our Approach */}
        <section className="space-y-6">
          <h2 className="section-title">
            <FaLightbulb className="text-neon-cyan" /> Our Approach
          </h2>
          <p className="text-lg leading-relaxed">
            We use advanced search technology with code-aware algorithms that
            understand functions, patterns, and relationships between code
            elements.
          </p>
          <div className="card card-hover p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-300">
              Why OctoSearch?
            </h3>
            <ul className="space-y-4">
              {[
                {
                  icon: <FaSearch />,
                  title: "Deeper understanding",
                  desc: "Code semantics beyond simple text matching",
                  color: "neon-purple",
                },
                {
                  icon: <FaCode />,
                  title: "Cross-repository search",
                  desc: "Find patterns across your entire codebase",
                  color: "neon-blue",
                },
                {
                  icon: <FaSearch />,
                  title: "Contextual results",
                  desc: "Prioritized code based on relevance",
                  color: "neon-cyan",
                },
              ].map(({ icon, title, desc, color }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={`inline-flex items-center justify-center bg-${color}/20 p-2 rounded-lg text-${color}`}
                  >
                    {icon}
                  </span>
                  <div>
                    <strong className="text-white">{title}</strong>
                    <p>{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Features Section */}
        {showFeatures && (
          <section id="features" className="py-12 md:py-20">
            <div className="max-w-6xl mx-auto">
              <FeaturesList />
            </div>
          </section>
        )}

        {/* Open Source Commitment */}
        <section className="space-y-6">
          <h2 className="section-title">
            <FaHeart className="text-red-500" /> Open Source Commitment
          </h2>
          <p className="text-lg leading-relaxed">
            We contribute to open-source projects and share our innovations with
            the developer community.
          </p>
          <div className="card card-hover p-6">
            <h3 className="text-xl font-semibold mb-4">Our Contributions</h3>
            <div className="space-y-3">
              {[
                {
                  text: "Code search indexing algorithms",
                  color: "neon-purple",
                },
                { text: "Developer experience tooling", color: "neon-blue" },
                { text: "Documentation generators", color: "neon-cyan" },
              ].map(({ text, color }, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${color}`} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Get In Touch
          </h2>
          <p className="text-lg leading-relaxed">
            Have questions or feedback? Reach us at
            <a href="mailto:support@octosearch.dev" className="link">
              {" "}
              support@octosearch.dev{" "}
            </a>
            or visit our
            <a href="https://github.com/octosearch/feedback" className="link">
              {" "}
              GitHub repository
            </a>
            .
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <a href="mailto:support@octosearch.dev" className="btn btn-primary">
              Contact Us
            </a>
            <a href="https://github.com/octosearch/feedback" className="btn">
              GitHub Feedback
            </a>
          </div>
        </section>
      </article>
    </AboutLayout>
  );
}
