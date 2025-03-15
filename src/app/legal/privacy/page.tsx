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
                        <span className="font-bold">OctoSearch does not collect or store any user information.</span> Our service functions as an interface to the GitHub API, displaying GitHub data directly without storing it on our servers.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        Any information you see while using OctoSearch is fetched in real-time from GitHub's servers via their official API. We do not maintain databases of user information, search queries, or GitHub content.
                    </p>
                </div>

                <div className="pl-5 border-l-2 border-github-border mb-6 bg-github-dark-secondary/30 p-4 rounded-md">
                    <h3 className="text-xl font-semibold mb-3 text-github-text">GitHub API Usage</h3>
                    <p className="text-github-text leading-relaxed">
                        When you use OctoSearch, your search queries are passed directly to GitHub's API. Any information displayed is provided by GitHub according to their privacy policy and terms of service. We recommend reviewing GitHub's privacy policy to understand how they handle your data.
                    </p>
                </div>
            </section>

            {/* Section 2 */}
            <section className="mb-12">
                <h2 id="cookies-and-tracking" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    2. Cookies and Tracking
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        OctoSearch may use essential cookies to provide basic functionality, such as maintaining session state. We do not use tracking cookies, analytics services, or other mechanisms to monitor user behavior or collect data for marketing purposes.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        If you prefer to disable cookies, you can adjust your browser settings accordingly, but this may affect some features of our service.
                    </p>
                </div>
            </section>

            {/* Section 3 */}
            <section className="mb-12">
                <h2 id="third-party-services" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    3. Third-Party Services
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

            {/* Section 4 */}
            <section className="mb-12">
                <h2 id="data-security" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    4. Data Security
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed">
                        Since we don't collect or store user data, there is minimal risk of data breaches affecting user information on our end. However, we implement standard security practices to protect our service's integrity and ensure secure connections when passing requests to the GitHub API.
                    </p>
                </div>
            </section>

            {/* New Section - GDPR Compliance */}
            <section className="mb-12">
                <h2 id="gdpr-compliance" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    5. GDPR Compliance
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md mb-6">
                    <p className="text-github-text leading-relaxed mb-4">
                        For users in the European Economic Area (EEA), we comply with the General Data Protection Regulation (GDPR). Since OctoSearch does not collect or store personal data, many GDPR provisions are not applicable to our service. However, we recognize and respect your rights under the GDPR, including:
                    </p>
                    <ul className="list-none space-y-2 mb-4">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Right to Access:</strong> You can request confirmation of whether we process any of your personal data.</span>
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
                    </ul>
                    <p className="text-github-text leading-relaxed">
                        To exercise these rights, please contact us at <a href="mailto:privacy@octosearch.dev" className="text-github-link hover:text-github-link-hover underline underline-offset-2">privacy@octosearch.dev</a>.
                    </p>
                </div>
            </section>

            {/* New Section - CCPA Compliance */}
            <section className="mb-12">
                <h2 id="ccpa-compliance" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    6. CCPA Compliance
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
                    <p className="text-github-text leading-relaxed mb-4">
                        As OctoSearch does not collect or sell personal information, many provisions of the CCPA may not apply to our service.
                    </p>
                    <p className="text-github-text leading-relaxed">
                        To exercise your rights under the CCPA, please contact us at <a href="mailto:privacy@octosearch.dev" className="text-github-link hover:text-github-link-hover underline underline-offset-2">privacy@octosearch.dev</a>.
                    </p>
                </div>
            </section>

            {/* New Section - Governing Law */}
            <section className="mb-12">
                <h2 id="governing-law" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    7. Governing Law
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md mb-6">
                    <p className="text-github-text leading-relaxed">
                        This Privacy Policy and any disputes related to it or to your use of OctoSearch shall be governed by and construed in accordance with the laws of the Province of Alberta, Canada, without regard to its conflict of law provisions. Any legal action arising out of this Privacy Policy shall be brought exclusively in the courts located in Alberta, Canada, and you consent to the personal jurisdiction of such courts.
                    </p>
                </div>
            </section>

            {/* Changes to This Policy - now section 8 */}
            <section className="mb-12">
                <h2 id="changes-to-this-policy" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    8. Changes to This Policy
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

            {/* Contact Us - now section 9 */}
            <section className="mb-6">
                <h2 id="contact-us" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    9. Contact Us
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
