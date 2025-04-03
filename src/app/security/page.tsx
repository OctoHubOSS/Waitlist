import LegalLayout from "@/components/layout/LegalLayout";

export default function SecurityPage() {
    return (
        <LegalLayout
            title="Security"
            description="We take security seriously. This page outlines the measures we take to protect your data and ensure a safe experience."
        >
            <section>
                <h2>1. Data Protection</h2>
                <p>
                    We implement a variety of security measures to protect your data from unauthorized access, use, or disclosure. These measures include:
                </p>
                <ul>
                    <li>
                        **Encryption:** We use industry-standard encryption protocols to protect sensitive data during transmission and storage.
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
                <h2>2. Authentication and Authorization</h2>
                <p>
                    We use secure authentication and authorization mechanisms to protect user accounts and prevent unauthorized access. These mechanisms include:
                </p>
                <ul>
                    <li>
                        **Strong Passwords:** We require users to create strong passwords that meet certain complexity requirements.
                    </li>
                    <li>
                        **Multi-Factor Authentication (MFA):** We offer multi-factor authentication to provide an extra layer of security for user accounts.
                    </li>
                    <li>
                        **Session Management:** We use secure session management techniques to protect user sessions from hijacking.
                    </li>
                </ul>
            </section>

            <section>
                <h2>3. Infrastructure Security</h2>
                <p>
                    We use a secure infrastructure to host our service and protect against cyber threats. Our infrastructure includes:
                </p>
                <ul>
                    <li>
                        **Firewalls:** We use firewalls to protect our network from unauthorized access.
                    </li>
                    <li>
                        **Intrusion Detection Systems (IDS):** We use intrusion detection systems to monitor our network for malicious activity.
                    </li>
                    <li>
                        **Regular Security Updates:** We regularly update our systems with the latest security patches.
                    </li>
                </ul>
            </section>

            <section>
                <h2>4. Data Privacy</h2>
                <p>
                    We are committed to protecting your privacy. We adhere to strict data privacy principles and comply with all applicable data protection laws.
                </p>
            </section>

            <section>
                <h2>5. Incident Response</h2>
                <p>
                    We have a comprehensive incident response plan in place to handle security incidents. Our incident response plan includes:
                </p>
                <ul>
                    <li>
                        **Incident Detection:** We use monitoring tools to detect security incidents.
                    </li>
                    <li>
                        **Incident Analysis:** We analyze security incidents to determine the root cause and impact.
                    </li>
                    <li>
                        **Incident Containment:** We take steps to contain security incidents and prevent further damage.
                    </li>
                    <li>
                        **Incident Recovery:** We take steps to recover from security incidents and restore normal operations.
                    </li>
                </ul>
            </section>

            <section>
                <h2>6. Reporting Security Vulnerabilities</h2>
                <p>
                    If you discover a security vulnerability in our service, please report it to us at [security@octohub.dev]. We appreciate your help in keeping our service secure.
                </p>
            </section>
        </LegalLayout>
    );
}
