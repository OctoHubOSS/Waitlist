import LegalLayout from "@/components/layout/LegalLayout";

export default function PrivacyPolicyPage() {
    return (
        <LegalLayout
            title="Privacy Policy"
            description="Your privacy is important to us. This policy explains how we collect, use, and protect your personal information."
        >
            <section>
                <h2>1. Information We Collect</h2>
                <p>
                    We collect the following types of information:
                </p>
                <ul>
                    <li>
                        **Email Address:** When you sign up for the OctoHub Waitlist, we collect your email address to send you updates and early access invitations.
                    </li>
                    <li>
                        **Name (Optional):** You may choose to provide your name when signing up, which we use to personalize your experience.
                    </li>
                    <li>
                        **Usage Data:** We collect data about how you interact with our service, such as IP addresses, browser type, and access times. This data helps us improve our service and protect against abuse.
                    </li>
                </ul>
            </section>

            <section>
                <h2>2. How We Use Your Information</h2>
                <p>
                    We use your information for the following purposes:
                </p>
                <ul>
                    <li>
                        **To Send Updates:** We use your email address to send you updates about the OctoHub platform, including development progress, launch dates, and early access invitations.
                    </li>
                    <li>
                        **To Personalize Your Experience:** If you provide your name, we use it to personalize our communications with you.
                    </li>
                    <li>
                        **To Improve Our Service:** We use usage data to analyze how users interact with our service, identify areas for improvement, and protect against abuse.
                    </li>
                </ul>
            </section>

            <section>
                <h2>3. Data Security</h2>
                <p>
                    We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. These measures include:
                </p>
                <ul>
                    <li>
                        **Encryption:** We use encryption to protect sensitive data during transmission and storage.
                    </li>
                    <li>
                        **Access Controls:** We restrict access to personal information to authorized personnel only.
                    </li>
                    <li>
                        **Regular Security Audits:** We conduct regular security audits to identify and address potential vulnerabilities.
                    </li>
                </ul>
            </section>

            <section>
                <h2>4. Data Retention</h2>
                <p>
                    We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. If you unsubscribe from the OctoHub Waitlist, we will delete your email address from our mailing list.
                </p>
            </section>

            <section>
                <h2>5. Sharing Your Information</h2>
                <p>
                    We do not share your personal information with third parties except as necessary to provide our service or as required by law. For example, we may share your information with:
                </p>
                <ul>
                    <li>
                        **Service Providers:** We may share your information with third-party service providers who assist us in providing our service, such as email delivery providers.
                    </li>
                    <li>
                        **Legal Authorities:** We may disclose your information to legal authorities if required by law or legal process.
                    </li>
                </ul>
            </section>

            <section>
                <h2>6. Your Rights</h2>
                <p>
                    You have the following rights with respect to your personal information:
                </p>
                <ul>
                    <li>
                        **Access:** You have the right to access the personal information we hold about you.
                    </li>
                    <li>
                        **Correction:** You have the right to correct any inaccurate or incomplete personal information we hold about you.
                    </li>
                    <li>
                        **Deletion:** You have the right to request that we delete your personal information.
                    </li>
                    <li>
                        **Objection:** You have the right to object to our processing of your personal information.
                    </li>
                </ul>
                <p>
                    To exercise these rights, please contact us at [support@octohub.dev].
                </p>
            </section>

            <section>
                <h2>7. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on our website. You are advised to review this Privacy Policy periodically for any changes.
                </p>
            </section>

            <section>
                <h2>8. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at [support@octohub.dev].
                </p>
            </section>
        </LegalLayout>
    );
}
