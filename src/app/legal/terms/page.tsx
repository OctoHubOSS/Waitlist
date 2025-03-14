import { Metadata } from "next";
import LegalLayout from "@/components/Layout/Legal";

export const metadata: Metadata = {
    title: "Terms of Service - OctoSearch",
    description: "OctoSearch Terms of Service and User Agreement"
};

export default function TermsPage() {
    return (
        <LegalLayout title="Terms of Service" lastUpdated="March 14, 2025">
            {/* Section 1 */}
            <section className="mb-12">
                <h2 id="acceptance-of-terms" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    1. Acceptance of Terms
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed">
                        By accessing or using the OctoSearch service, you agree to be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use the service.
                    </p>
                </div>
            </section>

            {/* Section 2 */}
            <section className="mb-12">
                <h2 id="description-of-service" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    2. Description of Service
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        OctoSearch provides a code search interface that uses the GitHub API to enable users to search through repositories.
                        The service is provided "as is" and may change without notice.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        OctoSearch does not store or process any GitHub data on its servers. All data displayed is retrieved in real-time from
                        GitHub's API and is subject to GitHub's rate limiting, availability, and terms of service.
                    </p>
                </div>
            </section>

            {/* Section 3 */}
            <section className="mb-12">
                <h2 id="github-api-usage" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    3. GitHub API Usage
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        OctoSearch uses the GitHub API to provide its functionality. By using our service, you acknowledge that:
                    </p>
                    <ul className="list-none space-y-2 mb-4">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span>Your use of GitHub data through our service is subject to GitHub's Terms of Service</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span>GitHub may impose rate limits that could temporarily affect our service's functionality</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span>We cannot guarantee the accuracy or availability of data provided by GitHub's API</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Section 4 */}
            <section className="mb-12">
                <h2 id="user-conduct" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    4. User Conduct
                </h2>
                <p className="mb-4 text-github-text leading-relaxed">
                    You agree not to use OctoSearch to:
                </p>
                <ul className="list-none mb-6 bg-github-dark-secondary/30 rounded-md p-5 space-y-2">
                    <li className="flex items-start">
                        <span className="text-github-accent mr-2">•</span>
                        <span>Violate any laws or regulations</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-github-accent mr-2">•</span>
                        <span>Circumvent any rate limits or authentication mechanisms of the GitHub API</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-github-accent mr-2">•</span>
                        <span>Scrape, collect, or extract data in violation of GitHub's terms</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-github-accent mr-2">•</span>
                        <span>Attempt to gain unauthorized access to any part of the service</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-github-accent mr-2">•</span>
                        <span>Interfere with the proper functioning of the service</span>
                    </li>
                </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-12">
                <h2 id="intellectual-property" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    5. Intellectual Property
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        OctoSearch's interface, design, and functionality are owned by OctoSearch
                        and are protected by intellectual property laws.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        The data displayed through our service is sourced from GitHub and remains subject to GitHub's terms and
                        the respective license terms of the repositories you access.
                    </p>
                </div>
            </section>

            {/* Section 6 */}
            <section className="mb-12">
                <h2 id="service-limitations" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    6. Service Limitations
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed">
                        Since OctoSearch relies on the GitHub API, our service may be subject to limitations imposed by GitHub,
                        including rate limits, API changes, or service outages. We are not responsible for interruptions in service
                        due to GitHub API limitations or changes.
                    </p>
                </div>
            </section>

            {/* Section 7 */}
            <section className="mb-12">
                <h2 id="disclaimer" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    7. Disclaimer
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed">
                        <span className="font-semibold">OctoSearch is provided on an "as is" and "as available" basis.</span> We make no warranties,
                        expressed or implied, regarding the reliability, availability, or accuracy of the service or the data retrieved from GitHub's API.
                    </p>
                </div>
            </section>

            {/* Section 8 */}
            <section className="mb-6">
                <h2 id="changes-to-terms" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    8. Changes to Terms
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed">
                        We reserve the right to modify these terms at any time. Your continued use of OctoSearch
                        following any changes indicates your acceptance of the modified terms.
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
}
