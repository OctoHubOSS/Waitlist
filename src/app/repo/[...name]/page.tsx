import { Suspense } from "react";
import RepositoryPageClient from "@/components/Layout/Repository/PageClient";
import RepositoryCardSkeleton from "@/components/Layout/Repository/Skeleton";
export { generateMetadata } from "@/components/Layout/Repository/Meta";

export default function Page({ params }: { params: { name: string[] } }) {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
                    <RepositoryCardSkeleton />
                </div>
            }
        >
            <RepositoryPageClient params={params} />
        </Suspense>
    );
}