import { Metadata } from "next";
import LegalLayout from "@/components/layout/LegalLayout";

export const metadata: Metadata = {
    title: "Privacy Policy | OctoHub",
    description: "Privacy policy for OctoHub waitlist platform",
};

export default function PrivacyPage() {
    const lastUpdated = new Date().toLocaleDateString();

    return (
        <LegalLayout
            title="Privacy Policy"
            description={`Last updated: ${lastUpdated}`}
        >
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p>
                    At OctoHub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our waitlist platform.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold mb-2">2.1 Personal Information</h3>
                <p>We collect the following personal information:</p>
                <ul className="list-disc pl-6">
                    <li>Name and display name</li>
                    <li>Email address</li>
                    <li>Profile image (optional)</li>
                    <li>Account credentials</li>
                    <li>IP address and device information</li>
                    <li>Browser and operating system details</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Usage Information</h3>
                <p>We collect information about your use of our service:</p>
                <ul className="list-disc pl-6">
                    <li>Feature requests and feedback</li>
                    <li>Comments and reactions</li>
                    <li>Survey responses</li>
                    <li>Notification interactions</li>
                    <li>Login history and session data</li>
                    <li>Audit logs of your activities</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <p>We use your information for the following purposes:</p>
                <ul className="list-disc pl-6">
                    <li>To provide and maintain our Service</li>
                    <li>To process your waitlist registration</li>
                    <li>To verify your identity and prevent fraud</li>
                    <li>To send you important notifications</li>
                    <li>To improve our Service and user experience</li>
                    <li>To comply with legal obligations</li>
                    <li>To maintain security and prevent abuse</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. Data Storage and Security</h2>
                <p>
                    We implement appropriate security measures to protect your personal information:
                </p>
                <ul className="list-disc pl-6">
                    <li>Passwords are hashed using bcrypt</li>
                    <li>Two-factor authentication support</li>
                    <li>Email verification required</li>
                    <li>Secure session management</li>
                    <li>Regular security audits</li>
                    <li>Encrypted data transmission</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
                <p>We may share your information with:</p>
                <ul className="list-disc pl-6">
                    <li>Service providers who assist in our operations</li>
                    <li>Law enforcement when required by law</li>
                    <li>Other users (limited to public profile information)</li>
                    <li>Analytics providers (in anonymized form)</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate data</li>
                    <li>Request deletion of your data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Export your data</li>
                    <li>Object to data processing</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
                <p>
                    We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc pl-6">
                    <li>Maintain your session</li>
                    <li>Remember your preferences</li>
                    <li>Analyze usage patterns</li>
                    <li>Improve security</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
                <p>
                    Our Service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Changes to Privacy Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
                <p>
                    For questions about this Privacy Policy, please contact us at:
                </p>
                <p className="mt-2">
                    Email: privacy@octohub.dev
                </p>
            </section>
        </LegalLayout>
    );
} 