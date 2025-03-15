import { Metadata } from "next";
import LegalLayout from "@/components/Layout/Legal";

export const metadata: Metadata = {
    title: "Privacy Policy - OctoSearch",
    description: "Learn how OctoSearch handles your data"
};

export default function PrivacyPage() {
    return (
        <LegalLayout title="Privacy Policy" lastUpdated="March 14, 2025">
            {/* Section 1 */}
            <section className="mb-12">
                <h2 id="information-handling" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    1. Information Handling
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md mb-6">
                    <p className="text-github-text leading-relaxed mb-4">
                        <span className="font-bold">OctoSearch collects and stores certain user information to provide personalized services.</span> Our service connects with the GitHub API and stores data to enhance your search experience and provide additional functionality.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        We maintain databases that include user information, search queries, user preferences, and relevant GitHub content to provide a more efficient and personalized experience.
                    </p>
                </div>

                <div className="pl-5 border-l-2 border-github-border mb-6 bg-github-dark-secondary/30 p-4 rounded-md">
                    <h3 className="text-xl font-semibold mb-3 text-github-text">GitHub API Usage</h3>
                    <p className="text-github-text leading-relaxed">
                        When you use OctoSearch, your search queries are processed through our service and may be stored for functionality purposes. We integrate with GitHub's API to retrieve and store relevant information according to their privacy policy and terms of service. We recommend reviewing GitHub's privacy policy to understand how they handle your data as well.
                    </p>
                </div>
            </section>

            {/* New Section - Data We Collect */}
            <section className="mb-12">
                <h2 id="data-we-collect" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    2. Data We Collect
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md mb-6">
                    <p className="text-github-text leading-relaxed mb-4">
                        OctoSearch may collect and store the following types of information:
                    </p>
                    <ul className="list-none space-y-2 mb-4">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Account Information:</strong> When you sign in, we store basic profile information such as name, email, and profile image.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Search Queries:</strong> We store your search queries to improve functionality and provide search history features.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Repository Data:</strong> We store information about repositories you interact with, including metadata from GitHub.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>User Preferences:</strong> We store your favorites, notes, tags, and other customization settings.</span>
                        </li>
                    </ul>
                    <p className="text-github-text leading-relaxed">
                        This information is used to provide our service functionality and improve your user experience with OctoSearch.
                    </p>
                </div>
            </section>

            {/* Section 3 (previously 2) */}
            <section className="mb-12">
                <h2 id="cookies-and-tracking" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    3. Cookies and Tracking
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        OctoSearch uses cookies to provide functionality, maintain sessions, and store user preferences. These cookies may include both session cookies and persistent cookies to enhance your experience.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        If you prefer to disable cookies, you can adjust your browser settings accordingly, but this may affect some features of our service.
                    </p>
                </div>
            </section>

            {/* Section 4 (previously 3) */}
            <section className="mb-12">
                <h2 id="third-party-services" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    4. Third-Party Services
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        Our service relies on the GitHub API to provide functionality. Your interactions with GitHub through our service are subject to:
                    </p>
                    <ul className="list-none space-y-2 mb-4">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" className="text-github-link hover:text-github-link-hover underline underline-offset-2">GitHub's Privacy Statement</a></span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><a href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service" className="text-github-link hover:text-github-link-hover underline underline-offset-2">GitHub's Terms of Service</a></span>
                        </li>
                    </ul>
                    <p className="text-github-text leading-relaxed">
                        We recommend reviewing these documents to understand how GitHub handles your data when you use their API through our service.
                    </p>
                </div>
            </section>

            {/* Section 5 (previously 4) */}
            <section className="mb-12">
                <h2 id="data-security" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    5. Data Security
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        We implement industry-standard security measures to protect the data we store. This includes secure database configurations, encryption of sensitive information, and regular security audits.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        For more details on our security practices, please see our <a href="/legal/security" className="text-github-link hover:text-github-link-hover underline underline-offset-2">Security Policy</a>.
                    </p>
                </div>
            </section>

            {/* Section 6 (previously 5) */}
            <section className="mb-12">
                <h2 id="gdpr-compliance" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    6. GDPR Compliance
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md mb-6">
                    <p className="text-github-text leading-relaxed mb-4">
                        For users in the European Economic Area (EEA), we comply with the General Data Protection Regulation (GDPR). Under the GDPR, you have the following rights regarding your personal data:
                    </p>
                    <ul className="list-none space-y-2 mb-4">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Right to Rectification:</strong> You can request correction of inaccurate personal data.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Right to Erasure:</strong> You can request the deletion of your personal data.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Right to Restriction of Processing:</strong> You can request that we restrict the processing of your personal data.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Right to Data Portability:</strong> You can request a copy of your data in a structured, commonly used, and machine-readable format.</span>
                        </li>
                    </ul>
                    <p className="text-github-text leading-relaxed">
                        To exercise these rights, please contact us at <a href="mailto:privacy@octosearch.dev" className="text-github-link hover:text-github-link-hover underline underline-offset-2">privacy@octosearch.dev</a>.
                    </p>
                </div>
            </section>

            {/* Section 7 (previously 6) */}
            <section className="mb-12">
                <h2 id="ccpa-compliance" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    7. CCPA Compliance
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md mb-6">
                    <p className="text-github-text leading-relaxed mb-4">
                        For California residents, we comply with the California Consumer Privacy Act (CCPA). Under the CCPA, you have the following rights:
                    </p>
                    <ul className="list-none space-y-2 mb-4">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Right to Know:</strong> You can request information about the personal information we collect about you and how we use it.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Right to Delete:</strong> You can request deletion of personal information we have collected from you.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA rights.</span>
                        </li>
                    </ul>
                    <p className="text-github-text leading-relaxed">
                        To exercise your rights under the CCPA, please contact us at <a href="mailto:privacy@octosearch.dev" className="text-github-link hover:text-github-link-hover underline underline-offset-2">privacy@octosearch.dev</a>.
                    </p>
                </div>
            </section>

            {/* Section 8 (previously 7) */}
            <section className="mb-12">
                <h2 id="governing-law" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    8. Governing Law
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md mb-6">
                    <p className="text-github-text leading-relaxed">
                        This Privacy Policy and any disputes related to it or to your use of OctoSearch shall be governed by and construed in accordance with the laws of the Province of Alberta, Canada, without regard to its conflict of law provisions. Any legal action arising out of this Privacy Policy shall be brought exclusively in the courts located in Alberta, Canada, and you consent to the personal jurisdiction of such courts.
                    </p>
                </div>
            </section>

            {/* Section 9 (previously 8) */}
            <section className="mb-12">
                <h2 id="changes-to-this-policy" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    9. Changes to This Policy
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
                    </p>
                </div>
            </section>

            {/* Section 10 (previously 9) */}
            <section className="mb-6">
                <h2 id="contact-us" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    10. Contact Us
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed">
                        If you have any questions about this Privacy Policy or our data handling practices, please contact us at{" "}
                        <a
                            href="mailto:privacy@octosearch.dev"
                            className="text-github-link hover:text-github-link-hover font-medium underline underline-offset-2 transition-colors"
                        >
                            privacy@octosearch.dev
                        </a>.
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
}
