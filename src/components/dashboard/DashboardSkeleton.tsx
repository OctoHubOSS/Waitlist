export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-github-dark">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Welcome Section Skeleton */}
                <div className="bg-github-dark-secondary rounded-xl p-6 animate-pulse">
                    <div className="h-8 w-64 bg-github-dark rounded-md mb-2"></div>
                    <div className="h-4 w-48 bg-github-dark rounded-md"></div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-github-dark-secondary rounded-xl p-4 animate-pulse">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-github-dark rounded-md"></div>
                                    <div className="h-6 w-16 bg-github-dark rounded-md"></div>
                                </div>
                                <div className="h-10 w-10 bg-github-dark rounded-full"></div>
                            </div>
                            <div className="mt-3">
                                <div className="h-1.5 bg-github-dark rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Recent Activity Feed Skeleton */}
                    <div className="lg:col-span-2 bg-github-dark-secondary rounded-xl p-4 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-6 w-32 bg-github-dark rounded-md"></div>
                            <div className="h-4 w-20 bg-github-dark rounded-md"></div>
                        </div>
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-3 p-3 bg-github-dark rounded-lg">
                                    <div className="h-10 w-10 bg-github-dark-secondary rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-3/4 bg-github-dark-secondary rounded-md"></div>
                                        <div className="h-3 w-1/2 bg-github-dark-secondary rounded-md"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions Skeleton */}
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-github-dark-secondary rounded-xl p-4 animate-pulse">
                                <div className="flex items-start space-x-3 mb-3">
                                    <div className="h-10 w-10 bg-github-dark rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 w-36 bg-github-dark rounded-md"></div>
                                        <div className="h-3 w-full bg-github-dark rounded-md"></div>
                                    </div>
                                </div>
                                <div className="h-10 w-full bg-github-dark rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}