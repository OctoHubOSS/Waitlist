import { motion } from 'framer-motion';

interface QuickActionCardProps {
    title: string;
    description: string;
    buttonText: string;
    onClick: () => void;
}

function QuickActionCard({ title, description, buttonText, onClick }: QuickActionCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-github-dark-secondary rounded-xl p-4"
        >
            <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
            <p className="text-sm text-github-text-secondary mb-4">
                {description}
            </p>
            <button
                onClick={onClick}
                className="w-full px-4 py-2 bg-github-accent text-white text-sm rounded-lg hover:bg-github-accent/90 transition-colors"
            >
                {buttonText}
            </button>
        </motion.div>
    );
}

interface QuickActionsProps {
    onFeatureRequest: () => void;
    onJoinDiscord: () => void;
}

export function QuickActions({ onFeatureRequest, onJoinDiscord }: QuickActionsProps) {
    return (
        <div className="space-y-4">
            <QuickActionCard
                title="Submit Feature Request"
                description="Have an idea for improving OctoHub? Share it with us!"
                buttonText="New Feature Request"
                onClick={onFeatureRequest}
            />

            <QuickActionCard
                title="Join the Community"
                description="Connect with other users and share your experiences"
                buttonText="Join Discord"
                onClick={onJoinDiscord}
            />
        </div>
    );
} 