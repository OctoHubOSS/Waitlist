import { Metadata } from "next";
import LegalLayout from "@/components/Layout/Legal";

export const metadata: Metadata = {
    title: "Terms of Service - OctoHub",
    description: "OctoHub Terms of Service and User Agreement"
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
                    <p className="text-github-text leading-relaxed mb-4">
                        By accessing or using the OctoHub service, you agree to be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use the service.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        These Terms of Service constitute a legally binding agreement between you and OctoHub regarding your use of our service.
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
                        OctoHub provides a code hosting and collaboration platform that enables users to manage repositories.
                        The service includes features for saving preferences, tracking history, and managing repositories.
                        The service is provided "as is" and may change without notice.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        OctoHub stores certain data on its servers to provide personalized features, including user profiles, repositories,
                        and activity information. This data is subject to our Privacy Policy.
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
                        OctoHub may use the GitHub API to provide some functionality. By using our service, you acknowledge that:
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
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span>We may store GitHub data and user interactions within our service for functionality purposes</span>
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
                    <li className="flex items-start">
                        <span className="text-github-accent mr-2">•</span>
                        <span>Use the service in any manner that could disable, overburden, damage, or impair the site</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-github-accent mr-2">•</span>
                        <span>Use any robot, spider, or other automatic device to access the service</span>
                    </li>
                    <li className="flex items-start">
                        <span className="text-github-accent mr-2">•</span>
                        <span>Submit content that is offensive, harmful, or violates the rights of others</span>
                    </li>
                </ul>
                <p className="text-github-text leading-relaxed bg-github-dark-secondary/30 p-5 rounded-md">
                    We reserve the right to terminate your access to OctoSearch for violations of these conduct guidelines, at our sole discretion.
                </p>
            </section>

            {/* Section 5 */}
            <section className="mb-12">
                <h2 id="intellectual-property" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    5. Intellectual Property
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        OctoSearch's interface, design, and functionality are owned by OctoSearch
                        and are protected by intellectual property laws. All rights, title, and interest in and to the service (excluding content provided by GitHub)
                        are and will remain the exclusive property of OctoSearch and its licensors.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        The data displayed through our service is sourced from GitHub and remains subject to GitHub's terms and
                        the respective license terms of the repositories you access. We make no claim to ownership of any GitHub content
                        accessed through our service.
                    </p>
                </div>
            </section>

            {/* Section 6 - User Data */}
            <section className="mb-12">
                <h2 id="user-data" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    6. User Data
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        By using OctoSearch, you acknowledge that certain information about you and your activities will be collected and stored
                        by our service. This includes account information, search history, saved repositories, user preferences, and other interactions.
                    </p>
                    <p className="text-github-text leading-relaxed mb-4">
                        You retain ownership of any content you directly submit to OctoSearch (such as notes or tags on repositories). However,
                        by submitting such content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, and display that
                        content in connection with providing our service.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        For more information about how we handle your data, please see our <a href="/legal/privacy" className="text-github-link hover:text-github-link-hover underline underline-offset-2">Privacy Policy</a>.
                    </p>
                </div>
            </section>

            {/* Section 7 (previously 6) */}
            <section className="mb-12">
                <h2 id="service-limitations" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    7. Service Limitations
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        Since OctoSearch relies on the GitHub API, our service may be subject to limitations imposed by GitHub,
                        including rate limits, API changes, or service outages. We are not responsible for interruptions in service
                        due to GitHub API limitations or changes.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        We reserve the right to modify, suspend, or discontinue the service (or any part or content thereof)
                        at any time without notice and without liability to you.
                    </p>
                </div>
            </section>

            {/* Section 8 (previously 7) */}
            <section className="mb-12">
                <h2 id="disclaimer" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    8. Disclaimer
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        <span className="font-semibold">OctoSearch is provided on an "as is" and "as available" basis.</span> We make no warranties,
                        expressed or implied, regarding the reliability, availability, or accuracy of the service or the data retrieved from GitHub's API.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        To the fullest extent permitted by applicable law, we disclaim all warranties, express or implied, including, but not limited to,
                        implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                    </p>
                </div>
            </section>

            {/* Section 9 (previously 8) */}
            <section className="mb-12">
                <h2 id="limitation-of-liability" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    9. Limitation of Liability
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        To the fullest extent permitted by applicable law, in no event shall OctoSearch, its affiliates, directors, employees, agents,
                        or licensors be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including without
                        limitation damages for loss of profits, goodwill, use, data, or other intangible losses, that result from your use of, or
                        inability to use, the service.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        In no event will our aggregate liability for any and all claims related to the service exceed fifty dollars ($50) or the
                        amount you paid us, if any, during the three (3) month period immediately preceding the event giving rise to the liability.
                    </p>
                </div>
            </section>

            {/* Section 10 (previously 9) */}
            <section className="mb-12">
                <h2 id="indemnification" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    10. Indemnification
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed">
                        You agree to indemnify, defend, and hold harmless OctoSearch, its affiliates, officers, directors, employees, consultants,
                        agents, and representatives from and against any and all claims, liabilities, damages, losses, costs, expenses, or fees
                        (including reasonable attorneys' fees) that arise from or relate to: (a) your use or misuse of our service; (b) your violation
                        of these Terms of Service; or (c) your violation of any rights of a third party.
                    </p>
                </div>
            </section>

            {/* Section 11 (previously 10) */}
            <section className="mb-12">
                <h2 id="governing-law" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    11. Governing Law
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed
                        in accordance with the laws of the Province of Alberta, Canada, without regard to its conflict of law provisions.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        Any disputes arising under or related to these Terms of Service shall be subject to the exclusive jurisdiction of the
                        courts located within Alberta, Canada.
                    </p>
                </div>
            </section>

            {/* Section 12 (previously 11) */}
            <section className="mb-12">
                <h2 id="changes-to-terms" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    12. Changes to Terms
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        We reserve the right to modify these terms at any time. Your continued use of OctoSearch
                        following any changes indicates your acceptance of the modified terms.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        It is your responsibility to review these Terms of Service periodically for changes. We will provide notice of
                        material changes to the Terms by updating the "Last Updated" date at the top of this page.
                    </p>
                </div>
            </section>

            {/* Section 13 (previously 12) */}
            <section className="mb-6">
                <h2 id="contact-information" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    13. Contact Information
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed">
                        If you have any questions about these Terms of Service, please contact us at{" "}
                        <a
                            href="mailto:legal@octohub.dev"
                            className="text-github-link hover:text-github-link-hover font-medium underline underline-offset-2 transition-colors"
                        >
                            legal@octohub.dev
                        </a>.
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
}
