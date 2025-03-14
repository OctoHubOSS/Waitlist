import Link from "next/link";

export default function NotFoundLayout({ children }: { children: React.ReactNode }) {


    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[80vh]">
            <div className="text-center max-w-lg">
                <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Lost in Code Space
                </h1>

                <div className="mb-8 space-y-4">
                    <p className="text-xl">
                        This resource doesn't exist or is private.
                    </p>
                    {children || (
                        <p className="text-gray-500">
                            The path you're looking for might have been moved, deleted,
                            or perhaps never existed in the first place.
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/"
                        className="px-5 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-md font-medium transition-colors">
                        Return to Home
                    </Link>

                    <Link href="/search"
                        className="px-5 py-3 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md font-medium transition-colors">
                        Search
                    </Link>
                </div>
            </div>

            <div className="mt-12 text-sm text-gray-500">
                <p>Tip: Try checking the URL for typos.</p>
            </div>
        </div>
    );
}
