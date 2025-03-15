import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="card card-hover card-fixed p-6 transition-all">
      <div className="h-12 w-12 text-neon-cyan mb-4">{icon}</div>

      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>

      <p className="text-github-text">{description}</p>
    </div>
  );
}
