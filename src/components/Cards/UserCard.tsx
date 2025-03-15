"use client";

import React from "react";
import {
  FaUser,
  FaUsers,
  FaCode,
  FaLink,
  FaBuilding,
  FaStar,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { GoOrganization, GoRepo } from "react-icons/go";
import { UserArray } from "@/types/users";

function UserCard({ user }: UserArray) {
  return (
    <a
      href={`/user/${user.login}`}
      rel="noopener noreferrer"
      className="card card-hover card-user glow-effect overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-github-link/50 border border-github-border bg-github-dark-secondary rounded-lg p-4 md:p-5"
    >
      <div className="card-header flex items-start gap-4">
        <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-github-border hover:border-github-link transition-colors duration-300 flex-shrink-0 shadow-md">
          <img
            src={
              user.avatarUrl ||
              "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
            }
            alt={`${user.login}'s avatar`}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-1 overflow-hidden">
          <h3 className="text-lg font-semibold text-white group-hover:text-github-link truncate">
            {user.name || user.login}
          </h3>
          <p className="text-sm text-github-text-secondary truncate">
            @{user.login}
          </p>

          <div className="mt-1">
            <p className="bio-text text-sm text-github-text-secondary line-clamp-2">
              {user.bio || "No bio provided"}
            </p>
          </div>
        </div>
      </div>

      <div className="card-body mt-2">
        <div className="flex flex-wrap gap-2 mb-3">
          {user.blog && (
            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-github-dark/60 text-github-link hover:bg-github-dark/80 transition-colors">
              <FaLink className="h-3 w-3" />
              <span className="truncate max-w-[120px]">
                {user.blog.replace(/^https?:\/\//, "")}
              </span>
            </div>
          )}
          {user.company && (
            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-github-dark/60 text-github-text-secondary hover:bg-github-dark/80 transition-colors">
              <FaBuilding className="h-3 w-3 text-neon-purple" />
              <span>{user.company}</span>
            </div>
          )}
        </div>

        {/* User's top repositories */}
        {user.topRepositories && user.topRepositories.length > 0 && (
          <div className="mb-4 p-3 bg-github-dark/60 rounded-lg border border-github-border/30 hover:border-github-border/50 transition-colors">
            <h4 className="text-xs font-medium mb-2 text-github-text flex items-center gap-2">
              <GoRepo className="h-3.5 w-3.5 text-neon-blue" />
              Top repositories
            </h4>
            <div className="space-y-2">
              {user.topRepositories.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-github-dark/80 transition-all"
                >
                  <span className="text-xs flex items-center max-w-[65%]">
                    <GoRepo className="h-3 w-3 mr-1.5 text-github-text-secondary" />
                    <span className="text-github-link hover:text-github-link-hover truncate transition-colors">
                      {repo.name}
                    </span>
                  </span>
                  <span className="text-xs flex items-center text-github-text-secondary">
                    <FaStar className="h-3 w-3 mr-1 text-yellow-500" />
                    {repo.stars}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card-footer flex flex-wrap items-center justify-between mt-auto pt-3 border-t border-github-border/30">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-github-text-secondary">
          <div className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
            <FaUsers className="h-3.5 w-3.5 text-blue-400" />
            <span>
              {user.stats?.followersFormatted ||
                user.followers?.toLocaleString() ||
                0}
              <span className="hidden sm:inline"> followers</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 hover:text-green-400 transition-colors">
            <FaUsers className="h-3.5 w-3.5 text-green-400" />
            <span>
              {user.stats?.followingFormatted ||
                user.following?.toLocaleString() ||
                0}
              <span className="hidden sm:inline"> following</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 hover:text-yellow-400 transition-colors">
            <FaCode className="h-3.5 w-3.5 text-yellow-400" />
            <span>
              {user.stats?.reposFormatted ||
                user.publicRepos?.toLocaleString() ||
                0}
              <span className="hidden sm:inline"> repos</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          {user.type === "Organization" ? (
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-github-border bg-github-dark text-github-text-secondary hover:border-neon-purple/50 hover:text-neon-purple transition-colors">
              <GoOrganization className="h-3 w-3" />
              <span className="hidden sm:inline">Organization</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-github-border bg-github-dark text-github-text-secondary hover:border-neon-blue/50 hover:text-neon-blue transition-colors">
              <FaUser className="h-3 w-3" />
              <span className="hidden sm:inline">User</span>
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export default UserCard;
