import { Metadata } from "next";
import AboutLayout from "@/components/Layout/About";

export const metadata: Metadata = {
    title: "About OctoSearch | Advanced Code Search",
    description: "OctoSearch is a powerful tool for developers to search code across repositories with semantic understanding and lightning-fast results."
};

export default function AboutPage() {
    return (
        <AboutLayout>
            <h2>Revolutionizing Code Search</h2>
            <p>
                OctoSearch was built by developers, for developers. We understand the frustration of
                searching through large codebases, trying to find that specific implementation or pattern.
                Our mission is to make code discovery not just faster, but smarter.
            </p>

            <h2>Our Approach</h2>
            <p>
                We've combined cutting-edge search technology with code-aware algorithms to create a tool that
                understands code semantically. OctoSearch doesn't just match text; it understands functions,
                patterns, and relationships between code elements.
            </p>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-8 rounded-lg my-8 border border-purple-100 dark:border-purple-800">
                <h3 className="mt-0 text-purple-800 dark:text-purple-300">Why OctoSearch?</h3>
                <ul className="mb-0">
                    <li><strong>Deeper understanding</strong> of code beyond simple text matching</li>
                    <li><strong>Cross-repository search</strong> to find patterns across your entire codebase</li>
                    <li><strong>Contextual results</strong> that prioritize relevant code based on your needs</li>
                    <li><strong>Developer-focused UI</strong> designed for the way programmers think</li>
                </ul>
            </div>

            <h2>The Team</h2>
            <p>
                OctoSearch is developed by a passionate team of engineers who've experienced firsthand the
                challenges of code search at scale. With backgrounds in search technology, compiler design,
                and developer tools, we're committed to building the best code search experience possible.
            </p>

            <h2>Open Source Commitment</h2>
            <p>
                We believe in the power of open source and give back to the community whenever possible.
                Parts of OctoSearch are open source, and we actively contribute to projects that make
                developer lives easier.
            </p>

            <h2>Get In Touch</h2>
            <p>
                Have questions, suggestions, or feedback? We'd love to hear from you!
                Reach out to us at <a href="mailto:support@octosearch.dev">support@octosearch.dev</a> or
                visit our <a href="https://github.com/octosearch/feedback">GitHub repository</a> to open an issue.
            </p>
        </AboutLayout>
    );
}
