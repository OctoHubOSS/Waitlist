export default function RepositoryCardSkeleton() {
    return (
        <div className="animate-pulse space-y-6 rounded-xl border border-github-border p-8 bg-github-dark-secondary">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="h-24 w-24 rounded-full bg-github-border" />
                <div className="space-y-4 w-full">
                    <div className="h-8 w-3/4 rounded bg-github-border" />
                    <div className="h-4 w-1/3 rounded bg-github-border" />
                    <div className="h-4 w-full rounded bg-github-border" />
                    <div className="flex flex-wrap gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-4 w-20 rounded bg-github-border" />
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-between">
                <div className="h-16 w-32 rounded bg-github-border" />
                <div className="h-16 w-32 rounded bg-github-border" />
            </div>
        </div>
    );
}