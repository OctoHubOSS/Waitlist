"use client";

import React from "react";
import { FaStar, FaCodeBranch, FaLock, FaDatabase } from "react-icons/fa";
import LanguageIcon from "@/components/Icons/Lang";
import { RepoArray } from "@/types/repos";
import { GoRepo } from "react-icons/go";

function RepositoryCard({ repo }: RepoArray) {
  // Format repo size to KB, MB or GB as appropriate
  const formatSize = (sizeInKB?: number) => {
    if (!sizeInKB) return null;
    
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else if (sizeInKB < 1024 * 1024) {
      return `${(sizeInKB / 1024).toFixed(1)} MB`;
    } else {
      return `${(sizeInKB / (1024 * 1024)).toFixed(1)} GB`;
    }
  };

  return (
    <a
      href={'/repo/' + repo.repo}
      rel="noopener noreferrer"
      className="card card-hover glow-effect flex flex-col p-4 md:p-5 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-github-accent/50 border border-github-border bg-github-dark-secondary rounded-lg"
    >
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex items-center text-github-text-secondary mb-1">
          {repo.visibility === "private" ? (
            <FaLock className="h-3.5 w-3.5 mr-1.5" />
          ) : (
            <GoRepo className="h-3.5 w-3.5 mr-1.5" />
          )}
          <span className="text-xs">
           {repo.owner ? `${repo.owner.login} /` : ""}
          <span className="font-semibold text-github-link ml-1">{repo.name}</span>
          </span>
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded border border-github-border">
            {repo.visibility || "public"}
          </span>
        </div>
        
        <h3 className="text-lg font-medium text-github-link">
          {repo.name}
        </h3>
      </div>

      <p className="text-github-text-secondary text-sm mb-3 flex-grow line-clamp-2">
        {repo.description || "No description provided"}
      </p>
      
      {repo.topics && repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {repo.topics.slice(0, 4).map((topic, index) => (
            <span 
              key={index} 
              className="text-xs px-2 py-0.5 bg-github-accent/10 text-github-accent rounded-full"
            >
              {topic}
            </span>
          ))}
          {repo.topics.length > 4 && (
            <span className="text-xs text-github-text-secondary">+{repo.topics.length - 4} more</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-github-text-secondary mt-auto pt-2 border-t border-github-border/40">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <LanguageIcon language={repo.language} size="sm" className="-mr-2" />
            <span className="text-xs whitespace-nowrap px-2 py-0.5">
              {repo.language}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <FaStar className="h-3.5 w-3.5 text-yellow-500" />
          <span>{repo.stars.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <FaCodeBranch className="h-3.5 w-3.5 text-blue-500" />
          <span>{repo.forks.toLocaleString()}</span>
        </div>
        
        {repo.size && (
          <div className="flex items-center gap-1.5">
            <FaDatabase className="h-3.5 w-3.5 text-purple-400" />
            <span>{formatSize(repo.size)}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:ml-auto">
          <span>Updated {repo.updatedAt}</span>
        </div>
      </div>
    </a>
  );
}

export default RepositoryCard;