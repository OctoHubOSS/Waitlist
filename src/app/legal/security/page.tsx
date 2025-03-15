import { Metadata } from "next";
import LegalLayout from "@/components/Layout/Legal";

export const metadata: Metadata = {
    title: "Security Policy - OctoSearch",
    description: "Learn about OctoSearch's security practices and data protection measures"
};

export default function SecurityPage() {
    return (
        <LegalLayout title="Security Policy" lastUpdated="March 14, 2025">
            {/* Introduction Section */}
            <section className="mb-12">
                <p className="text-github-text leading-relaxed mb-6 bg-github-dark-secondary/30 p-5 rounded-md">
                    At OctoSearch, we take the security of your data seriously. This Security Policy outlines the measures we implement to protect
                    user information and ensure the integrity of our service. We continuously evaluate and improve our security practices to
                    maintain the highest standards of data protection.
                </p>
            </section>

            {/* Section 1 */}
            <section className="mb-12">
                <h2 id="data-storage-security" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    1. Data Storage Security
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md mb-6">
                    <p className="text-github-text leading-relaxed mb-4">
                        OctoSearch implements the following measures to secure stored data:
                    </p>
                    <ul className="list-none space-y-2 mb-4">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Secure Database Configuration:</strong> Our database infrastructure is configured with industry best practices for security.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Encryption:</strong> Sensitive data is encrypted both in transit and at rest using modern encryption standards.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Access Controls:</strong> Database access is strictly controlled with role-based permissions and strong authentication.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Regular Backups:</strong> We maintain regular backups of all data with secure restoration procedures.</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Section 2 */}
            <section className="mb-12">
                <h2 id="authentication-security" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    2. Authentication Security
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        Our user authentication system implements the following security measures:
                    </p>
                    <ul className="list-none space-y-2">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>OAuth Integration:</strong> We use OAuth for GitHub authentication, eliminating the need to store passwords.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Session Management:</strong> User sessions are securely managed with proper expirations and renewal mechanisms.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Secure Token Handling:</strong> Authentication tokens are stored securely and handled according to best practices.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Account Protections:</strong> We implement measures to protect against brute force and automated attacks.</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Section 3 */}
            <section className="mb-12">
                <h2 id="application-security" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    3. Application Security
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md mb-6">
                    <p className="text-github-text leading-relaxed mb-4">
                        OctoSearch's application layer is protected by:
                    </p>
                    <ul className="list-none space-y-2">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Input Validation:</strong> All user inputs are validated and sanitized to prevent injection attacks.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>HTTPS Enforcement:</strong> All communication with our service is encrypted using HTTPS.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Security Headers:</strong> We implement modern security headers to prevent common web vulnerabilities.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Regular Updates:</strong> We regularly update our dependencies to patch potential security vulnerabilities.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Code Reviews:</strong> All code changes undergo security-focused code reviews before deployment.</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Section 4 */}
            <section className="mb-12">
                <h2 id="infrastructure-security" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    4. Infrastructure Security
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        Our infrastructure is secured by:
                    </p>
                    <ul className="list-none space-y-2">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Network Security:</strong> Network access is restricted and monitored, with firewalls and intrusion detection systems.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Monitoring:</strong> Continuous monitoring for unusual activity or potential security incidents.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Patching Policy:</strong> Regular patching of all servers and infrastructure components.</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Section 5 */}
            <section className="mb-12">
                <h2 id="data-deletion" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    5. Data Deletion and Retention
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        OctoSearch follows these data retention and deletion policies:
                    </p>
                    <ul className="list-none space-y-2">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>User Requests:</strong> Users can request deletion of their data, which will be processed within 30 days.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Account Deletion:</strong> When an account is deleted, all associated personal data is removed from our active databases.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Retention Period:</strong> We retain user data for as long as necessary to provide our services and comply with legal obligations.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Backup Retention:</strong> Backups are retained for a maximum of 90 days for disaster recovery purposes.</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Section 6 */}
            <section className="mb-12">
                <h2 id="incident-response" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    6. Security Incident Response
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        In the event of a security incident:
                    </p>
                    <ul className="list-none space-y-2">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Detection:</strong> We maintain systems to detect potential security incidents as quickly as possible.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Notification:</strong> We will notify affected users in accordance with applicable laws and regulations.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Investigation:</strong> We thoroughly investigate all security incidents to determine their scope and impact.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Remediation:</strong> We take prompt action to address vulnerabilities and prevent similar incidents.</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Section 7 */}
            <section className="mb-12">
                <h2 id="developer-practices" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    7. Developer Security Practices
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        Our development team follows these security practices:
                    </p>
                    <ul className="list-none space-y-2">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Secure Coding:</strong> Developers follow secure coding guidelines and best practices.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Security Training:</strong> Regular security awareness training for all developers.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Dependency Management:</strong> We use automated tools to monitor and update dependencies for security vulnerabilities.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Separation of Environments:</strong> Development, testing, and production environments are strictly separated.</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Section 8 */}
            <section className="mb-12">
                <h2 id="compliance" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    8. Compliance
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        OctoSearch is committed to complying with relevant data protection regulations:
                    </p>
                    <ul className="list-none space-y-2">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>GDPR Compliance:</strong> We follow principles of data minimization, purpose limitation, and user rights.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>CCPA Compliance:</strong> We respect California residents' rights regarding their personal information.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Regular Assessments:</strong> We conduct regular compliance assessments to ensure we meet our obligations.</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Section 9 */}
            <section className="mb-12">
                <h2 id="third-party-security" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    9. Third-Party Security
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        When working with third-party services:
                    </p>
                    <ul className="list-none space-y-2">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Vendor Assessment:</strong> We evaluate the security practices of third-party vendors before integration.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>GitHub Security:</strong> We rely on GitHub's robust security measures for API interactions.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Limited Data Sharing:</strong> We minimize the data shared with third parties to what is strictly necessary.</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Section 10 */}
            <section className="mb-12">
                <h2 id="security-updates" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    10. Security Updates
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed mb-4">
                        Our approach to security is proactive and evolving:
                    </p>
                    <ul className="list-none space-y-2">
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Policy Updates:</strong> We regularly review and update our security policies to address emerging threats.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Continuous Improvement:</strong> We continuously improve our security practices based on industry developments.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-github-accent mr-2">•</span>
                            <span><strong>Communication:</strong> Significant security updates will be communicated to users as appropriate.</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Contact Section */}
            <section className="mb-6">
                <h2 id="contact" className="text-2xl font-bold text-github-link mb-5 pb-2 border-b border-github-border">
                    11. Security Contact
                </h2>
                <div className="bg-github-dark-secondary/30 p-5 rounded-md">
                    <p className="text-github-text leading-relaxed">
                        If you discover a security vulnerability or have concerns about our security practices, please contact us immediately at{" "}
                        <a
                            href="mailto:security@octosearch.dev"
                            className="text-github-link hover:text-github-link-hover font-medium underline underline-offset-2 transition-colors"
                        >
                            security@octosearch.dev
                        </a>.
                    </p>
                </div>
            </section>
        </LegalLayout>
    );
}
