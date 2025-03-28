import { Metadata } from "next";
import AboutLayout from "@/components/Layout/About";
import FeaturesList from "@/components/Features/FeaturesList";
import { FaSearch, FaLightbulb, FaCode, FaHeart } from "react-icons/fa";

export const metadata: Metadata = {
  title: "About OctoHub | Advanced Code Platform",
  description:
    "OctoHub is a powerful platform for developers to collaborate, manage repositories, and enhance their development workflows.",
};

export default function AboutPage() {
  const showFeatures = true;

  return (
    <AboutLayout>
      <article className="space-y-12 ">
        {/* Hero Section */}
        <section className="relative p-6 md:p-10 rounded-2xl bg-github-dark-secondary border border-github-border overflow-hidden glow-effect">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Revolutionizing Development Workflows
          </h1>
          <p className="text-lg leading-relaxed mb-8">
            OctoHub was built by developers, for developers. Our mission is
            to make software development more collaborative and efficient.
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-github-accent to-github-link rounded-full" />
        </section>

        {/* Our Approach */}
        <section className="space-y-6">
          <h2 className="section-title">
            <FaLightbulb className="text-neon-cyan" /> Our Approach
          </h2>
          <p className="text-lg leading-relaxed">
            We use advanced technology with code-aware algorithms that
            understand repositories, collaborations, and relationships between code
            elements.
          </p>
          <div className="card card-hover p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-300">
              Why OctoHub?
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
                  title: "Cross-repository collaboration",
                  desc: "Manage workflows across your entire codebase",
                  color: "neon-blue",
                },
                {
                  icon: <FaSearch />,
                  title: "Contextual insights",
                  desc: "Prioritized development based on relevance",
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
                  text: "Repository management tools",
                  color: "neon-purple",
                },
                { text: "Developer experience tooling", color: "neon-blue" },
                { text: "Collaboration platforms", color: "neon-cyan" },
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
            <a href="mailto:support@octohub.dev" className="link">
              {" "}
              support@octohub.dev{" "}
            </a>
            or visit our
            <a href="https://github.com/octohuboss/website" className="link">
              {" "}
              GitHub repository
            </a>
            .
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <a href="mailto:hey@octohub.dev" className="btn btn-primary">
              Contact Us
            </a>
            <a href="https://github.com/octohuboss/website" className="btn">
              GitHub Feedback
            </a>
          </div>
        </section>
      </article>
    </AboutLayout>
  );
}
