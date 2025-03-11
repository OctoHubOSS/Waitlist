"use client";

import React from "react";
import { FaStar, FaCodeBranch } from "react-icons/fa";

interface RepositoryProps {
  repo: {
    id: number;
    name: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
    updatedAt: string;
    url: string;
  };
}

function RepositoryCard({ repo }: RepositoryProps) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover glow-effect flex flex-col p-4 md:p-5 overflow-hidden transition-all duration-300 hover:shadow-lg border border-github-border bg-github-dark-secondary rounded-lg"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
        <h3 className="text-lg font-medium text-github-link truncate">
          {repo.name}
        </h3>
        <span className="badge badge-primary text-xs whitespace-nowrap px-2 py-1 rounded-full bg-github-accent/20 text-github-accent">
          {repo.language}
        </span>
      </div>

      <p className="text-github-text-secondary text-sm mb-4 flex-grow line-clamp-2">
        {repo.description}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-xs text-github-text-secondary">
        <div className="flex items-center gap-1.5">
          <FaStar className="h-4 w-4 text-yellow-500" />
          <span>{repo.stars.toLocaleString()} stars</span>
        </div>

        <div className="flex items-center gap-1.5">
          <FaCodeBranch className="h-4 w-4 text-blue-500" />
          <span>{repo.forks.toLocaleString()} forks</span>
        </div>

        <div className="flex items-center gap-1.5 sm:ml-auto">
          <span className="text-github-text-secondary">Updated {repo.updatedAt}</span>
        </div>
      </div>
    </a>
  );
}

export default RepositoryCard;
