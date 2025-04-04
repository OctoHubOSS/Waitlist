import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={`min-h-screen flex flex-col ${inter.className}`}>
            <Navbar />
            <main className="flex-grow my-20">{children}</main>
            <Footer />
            <Toaster position="bottom-right" />
        </div>
    );
} 