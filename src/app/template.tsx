'use client';

export default function Template({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <div className="flex flex-col min-h-screen">
                <main className="w-full flex-grow">
                    {children}
                </main>
            </div>
        </>
    );
} 