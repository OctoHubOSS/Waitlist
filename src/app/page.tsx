"use client";

import { HeroSection, FeaturesSection, TrendingSection } from "@/components/Layout/HomePage";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full">
      <HeroSection 
        title="Discover the GitHub Universe" 
        description="Find developers, organizations, and repositories with OctoSearch's powerful discovery platform."
      />
      <FeaturesSection />
      <TrendingSection />
    </div>
  );
}
