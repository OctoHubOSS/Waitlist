import { Metadata } from "next";
import LegalLayout from "@/components/layout/LegalLayout";

export const metadata: Metadata = {
    title: "Terms of Service | OctoHub",
    description: "Terms of service for OctoHub waitlist platform",
};

export default function TermsPage() {
    const lastUpdated = new Date().toLocaleDateString();

    return (
        <LegalLayout
            title="Terms of Service"
            description={`Last updated: ${lastUpdated}`}
        >
            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p>
                    Welcome to OctoHub. By accessing or using our waitlist platform, you agree to be bound by these Terms of Service. These terms govern your use of our service, including all features, functionality, and content.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
                <ul className="list-disc pl-6">
                    <li>"Service" refers to the OctoHub waitlist platform</li>
                    <li>"User" refers to any individual or entity using our Service</li>
                    <li>"Subscriber" refers to users who have joined our waitlist</li>
                    <li>"Content" refers to all information, data, and materials available through the Service</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">3. Waitlist Participation</h2>
                <p>
                    By joining our waitlist, you agree to:
                </p>
                <ul className="list-disc pl-6">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account</li>
                    <li>Accept that waitlist position is not guaranteed</li>
                    <li>Comply with our verification process</li>
                    <li>Accept that we may modify waitlist status at our discretion</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">4. User Accounts</h2>
                <p>
                    When creating an account, you must:
                </p>
                <ul className="list-disc pl-6">
                    <li>Be at least 13 years old</li>
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Accept responsibility for all activities under your account</li>
                    <li>Notify us immediately of any security breaches</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">5. Feature Requests and Feedback</h2>
                <p>
                    Users may submit feature requests and feedback. By doing so, you:
                </p>
                <ul className="list-disc pl-6">
                    <li>Grant us a non-exclusive license to use your suggestions</li>
                    <li>Accept that we may implement similar features without compensation</li>
                    <li>Agree to maintain appropriate and professional communication</li>
                    <li>Accept that not all requests will be implemented</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">6. User Conduct</h2>
                <p>
                    Users must not:
                </p>
                <ul className="list-disc pl-6">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Impersonate others or provide false information</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with the proper functioning of the Service</li>
                    <li>Engage in any harmful or malicious activities</li>
                    <li>Share inappropriate or offensive content</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
                <p>
                    All content, features, and functionality of the Service are owned by OctoHub and are protected by international copyright, trademark, and other intellectual property laws.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
                <p>
                    We reserve the right to:
                </p>
                <ul className="list-disc pl-6">
                    <li>Terminate or suspend access to our Service</li>
                    <li>Remove or edit content</li>
                    <li>Modify or discontinue features</li>
                    <li>Block users who violate these terms</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                <p>
                    OctoHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
                <p>
                    These terms shall be governed by and construed in accordance with the laws of the Province of Alberta, Canada, without regard to its conflict of law provisions.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
                <p>
                    We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
                <p>
                    For questions about these Terms of Service, please contact us at:
                </p>
                <p className="mt-2">
                    Email: legal@octohub.dev
                </p>
            </section>
        </LegalLayout>
    );
} 