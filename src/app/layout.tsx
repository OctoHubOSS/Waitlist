import type {Metadata} from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "OctoSearch - GitHub Discovery Tool",
  description: "Discover GitHub profiles, organizations, and repositories easily",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-gradient-to-b from-github-dark to-github-dark-secondary overflow-x-hidden">
        <div className="flex flex-col min-h-screen">
          <div className="px-4 md:px-6 lg:px-8">
            <Navigation />
          </div>
          <main className="py-8 w-full flex-grow px-4 md:px-6 lg:px-8">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
