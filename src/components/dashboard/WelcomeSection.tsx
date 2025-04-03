interface WelcomeSectionProps {
    userName: string;
}

export function WelcomeSection({ userName }: WelcomeSectionProps) {
    return (
        <div className="bg-github-dark-secondary rounded-xl p-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
                Welcome back, {userName || 'there'}!
            </h1>
            <p className="mt-2 text-sm text-github-text-secondary">
                Here's what's happening with your account
            </p>
        </div>
    );
} 