"use client";

import React from "react";
import { FaUser, FaUsers, FaCode, FaMapMarkerAlt, FaLink, FaBuilding, FaStar } from "react-icons/fa";
import { GoOrganization, GoRepo } from "react-icons/go";
import { UserArray } from "@/types/users";

function UserCard({ user }: UserArray) {
    return (
        <a
            href={`/user/${user.login}`}
            rel="noopener noreferrer"
            className="card card-hover card-user glow-effect overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-github-accent/50 border border-github-border bg-github-dark-secondary rounded-lg p-4 md:p-5"
        >
            <div className="card-header flex gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden border border-github-border flex-shrink-0">
                    <img
                        src={user.avatarUrl || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"}
                        alt={`${user.login}'s avatar`}
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="flex flex-col gap-0.5 overflow-hidden">
                    <h3 className="text-lg font-medium text-github-link truncate">
                        {user.name || user.login}
                    </h3>

                    <div className="flex items-center text-github-text-secondary">
                        <p className="bio-text">
                            {user.bio || "No bio provided"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="card-body">
                <div className="flex flex-wrap -gap-2 mb-3">
                    {user.blog && (
                        <div className="flex items-center gap-1.5">
                            <FaLink className="h-3.5 w-3.5 text-github-accent" />
                            <span className="truncate max-w-[120px] text-xs">{user.blog.replace(/^https?:\/\//, '')}</span>
                        </div>
                    )}
                    {user.company && (
                        <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 text-purple-400">
                            <FaBuilding className="h-3 w-3" />
                            <span className="text-white/50">
                                {user.company}
                            </span>
                        </span>
                    )}
                </div>

                {/* User's top repositories */}
                {user.topRepositories && user.topRepositories.length > 0 && (
                    <div className="mb-3 p-2 bg-github-dark/40 rounded-md">
                        <h4 className="text-xs font-medium mb-2 text-github-text-secondary">Top repositories</h4>
                        <div className="space-y-1">
                            {user.topRepositories.map(repo => (
                                <div key={repo.id} className="flex items-center justify-between">
                                    <span className="text-xs flex items-center">
                                        <GoRepo className="h-3 w-3 mr-1 text-github-text-secondary" />
                                        <span className="text-github-link truncate">{repo.name}</span>
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

            <div className="card-footer flex flex-wrap items-center justify-between">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-github-text-secondary">
                    <div className="flex items-center gap-1.5">
                        <FaUsers className="h-3.5 w-3.5 text-blue-400" />
                        <span>
                            {user.stats?.followersFormatted || user.followers?.toLocaleString() || 0}
                            <span className="hidden sm:inline"> followers</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <FaUsers className="h-3.5 w-3.5 text-green-400" />
                        <span>
                            {user.stats?.followingFormatted || user.following?.toLocaleString() || 0}
                            <span className="hidden sm:inline"> following</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <FaCode className="h-3.5 w-3.5 text-yellow-400" />
                        <span>
                            {user.stats?.reposFormatted || user.publicRepos?.toLocaleString() || 0}
                            <span className="hidden sm:inline"> repos</span>
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    {/* Type Badge moved to footer right side */}
                    <div className="flex items-center">
                        {user.type === "Organization" ? (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border border-github-border bg-github-dark text-github-text-secondary">
                                <GoOrganization className="h-3 w-3" />
                                <span className="hidden sm:inline">Organization</span>
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border border-github-border bg-github-dark text-github-text-secondary">
                                <FaUser className="h-3 w-3" />
                                <span className="hidden sm:inline">User</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </a>
    );
}

export default UserCard;