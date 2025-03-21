import "./globals.css";
import { Metadata } from "next";
import { generateMetadata } from "@/utils/metadata";
import Navigation from "@/components/Static/Navigation";
import Footer from "@/components/Static/Footer";
import { AuthProvider } from "@/components/Auth/AuthProvider";

export const metadata: Metadata = generateMetadata({});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <html lang="en" className="dark">
        <body className="min-h-screen bg-gradient-to-b from-github-dark to-github-dark-secondary">
          <Navigation />
          <div className="flex flex-col min-h-screen">
            <main className="w-full flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </body>
      </html>
    </AuthProvider>
  );
}
