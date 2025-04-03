import { MessageSquare, ChevronRight } from 'lucide-react';

interface Activity {
    id: string;
    action: string;
    status: string;
    details: any;
    createdAt: string;
}

interface ActivityFeedProps {
    activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    return (
        <div className="lg:col-span-2 bg-github-dark-secondary rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                <button className="text-sm text-github-accent hover:text-white transition-colors flex items-center">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                </button>
            </div>
            <div className="space-y-3">
                {activities.length === 0 ? (
                    <div className="flex items-center space-x-3 p-3 bg-github-dark rounded-lg">
                        <div className="p-2 bg-github-accent/20 rounded-full">
                            <MessageSquare className="h-5 w-5 text-github-accent" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-white">No recent activity to display</p>
                            <p className="text-xs text-github-text-secondary">Your activity will appear here</p>
                        </div>
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-github-dark rounded-lg">
                            <div className="p-2 bg-github-accent/20 rounded-full">
                                <MessageSquare className="h-5 w-5 text-github-accent" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-white">{activity.action}</p>
                                <p className="text-xs text-github-text-secondary">
                                    {new Date(activity.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
} 