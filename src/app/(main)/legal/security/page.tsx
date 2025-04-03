import { Metadata } from "next";
import LegalLayout from "@/components/layout/LegalLayout";

export const metadata: Metadata = {
    title: "Security | OctoHub",
    description: "Security measures and practices at OctoHub",
};

export default function SecurityPage() {
    const lastUpdated = new Date().toLocaleDateString();

    return (
        <LegalLayout
            title="Security"
            description={`Last updated: ${lastUpdated}`}
        >
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Overview</h2>
                <p>
                    At OctoHub, we prioritize the security of our platform and your data. This page outlines our security measures, practices, and commitment to protecting your information.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Authentication & Access Control</h2>
                <h3 className="text-xl font-semibold mb-2">2.1 Password Security</h3>
                <ul className="list-disc pl-6">
                    <li>Passwords are hashed using bcrypt with a strong salt</li>
                    <li>Minimum password length of 8 characters</li>
                    <li>Requires uppercase, lowercase, and numbers</li>
                    <li>Password reset tokens expire after 24 hours</li>
                    <li>Failed login attempts are monitored and logged</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Two-Factor Authentication</h3>
                <ul className="list-disc pl-6">
                    <li>Optional 2FA using email verification</li>
                    <li>6-digit verification codes</li>
                    <li>Codes expire after 10 minutes</li>
                    <li>Backup codes provided for account recovery</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">2.3 Session Management</h3>
                <ul className="list-disc pl-6">
                    <li>Secure session tokens</li>
                    <li>Session timeout after 30 days of inactivity</li>
                    <li>Concurrent session monitoring</li>
                    <li>IP-based session validation</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Data Protection</h2>
                <h3 className="text-xl font-semibold mb-2">3.1 Data Encryption</h3>
                <ul className="list-disc pl-6">
                    <li>All data transmitted over HTTPS/TLS</li>
                    <li>Database encryption at rest</li>
                    <li>Secure key management</li>
                    <li>Regular encryption key rotation</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">3.2 Data Storage</h3>
                <ul className="list-disc pl-6">
                    <li>Secure MySQL database</li>
                    <li>Regular backups with encryption</li>
                    <li>Data retention policies</li>
                    <li>Secure file storage for user uploads</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Security Monitoring</h2>
                <h3 className="text-xl font-semibold mb-2">4.1 Audit Logging</h3>
                <ul className="list-disc pl-6">
                    <li>Comprehensive activity logging</li>
                    <li>IP address tracking</li>
                    <li>User agent monitoring</li>
                    <li>Failed authentication attempts</li>
                    <li>Account status changes</li>
                    <li>Security-related actions</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Security Alerts</h3>
                <ul className="list-disc pl-6">
                    <li>Real-time security monitoring</li>
                    <li>Automated threat detection</li>
                    <li>Security incident response team</li>
                    <li>Regular security assessments</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Application Security</h2>
                <h3 className="text-xl font-semibold mb-2">5.1 Input Validation</h3>
                <ul className="list-disc pl-6">
                    <li>Strict input validation using Zod</li>
                    <li>SQL injection prevention</li>
                    <li>XSS protection</li>
                    <li>CSRF protection</li>
                    <li>Rate limiting on all endpoints</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">5.2 API Security</h3>
                <ul className="list-disc pl-6">
                    <li>JWT-based authentication</li>
                    <li>API rate limiting</li>
                    <li>Request validation</li>
                    <li>Error handling without sensitive data</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Infrastructure Security</h2>
                <ul className="list-disc pl-6">
                    <li>Secure cloud infrastructure</li>
                    <li>Regular security patches</li>
                    <li>Firewall protection</li>
                    <li>DDoS protection</li>
                    <li>Regular security audits</li>
                    <li>Disaster recovery plan</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Compliance</h2>
                <p>
                    We comply with applicable data protection laws and regulations, including:
                </p>
                <ul className="list-disc pl-6">
                    <li>Alberta Personal Information Protection Act (PIPA)</li>
                    <li>Canadian Personal Information Protection and Electronic Documents Act (PIPEDA)</li>
                    <li>General Data Protection Regulation (GDPR) for EU users</li>
                    <li>Regular compliance audits</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Security Updates</h2>
                <p>
                    We regularly update our security measures and practices to address new threats and vulnerabilities. Users will be notified of any significant security changes that may affect their use of the service.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Reporting Security Issues</h2>
                <p>
                    If you discover a security vulnerability, please report it to us immediately at:
                </p>
                <p className="mt-2">
                    Email: security@octohub.dev
                </p>
                <p className="mt-2">
                    We take all security reports seriously and will respond promptly to address any vulnerabilities.
                </p>
            </section>
        </LegalLayout>
    );
} 