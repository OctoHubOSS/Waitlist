"use client";

import { Suspense, useEffect, useState } from "react";
import { FaStar, FaUsers, FaMapMarkerAlt, FaCalendarAlt, FaTwitter, FaLink } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { GoGraph } from "react-icons/go";
import { motion } from "framer-motion";
import RepositoryCard from "@/components/Cards/RepositoryCard";
import { useParams } from "next/navigation";
import { format } from "date-fns";

export interface Repository {
  name: string;
  description: string;
  url: string;
  id: string;
  stargazers_count: number;
  forks_count: number;
  language?: string;
  updated_at: string;
  size?: number;
}

export interface User {
  name: string;
  login: string;
  avatar_url: string;
  created_at: string;
  followers: number;
  following: number;
  bio: string;
  location?: string;
  twitter_username?: string;
  blog?: string;
  public_repos: number;
}

const REPO_COUNT = 3;

function RepositoriesLoading() {
  return (
    <div className="space-y-4">
      {[...Array(REPO_COUNT)].map((_, i) => (
        <div key={i} className="animate-pulse space-y-4 rounded-lg border border-github-border p-4 bg-github-dark-secondary">
          <div className="h-4 w-3/4 rounded bg-github-border" />
          <div className="h-4 w-1/2 rounded bg-github-border" />
          <div className="h-4 w-2/3 rounded bg-github-border" />
        </div>
      ))}
    </div>
  );
}

async function fetchUserData(username: string) {
  const [userRes, reposRes, starredRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`),
    fetch(`https://api.github.com/search/repositories?q=user:${username}&sort=stars&order=desc&per_page=${REPO_COUNT}`),
    fetch(`https://api.github.com/users/${username}/starred?per_page=${REPO_COUNT}`),
  ]);

  if (!userRes.ok) throw new Error("User not found");

  const user = await userRes.json() as User;
  const repositories = reposRes.ok ? (await reposRes.json()).items : [];
  const starredRepos = starredRes.ok ? await starredRes.json() : [];

  return { user, repositories, starredRepos };
}

function UserPage() {
  const params = useParams();
  const [data, setData] = useState<{ user: User; repositories: Repository[]; starredRepos: Repository[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const username = params?.user as string;

  useEffect(() => {
    setIsClient(true);

    if (!username) return;

    let isMounted = true;

    async function fetchData() {
      try {
        const data = await fetchUserData(username);
        if (isMounted) {
          setData(data);
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [username]);

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="p-6"><RepositoriesLoading /></div>;
  }

  const { user, repositories, starredRepos } = data;
  const totalRepos = user.public_repos;
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);

  const formatDate = (dateString: string) => {
    if (!isClient) return "";

    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "";
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full p-6">
      <div className="card mb-8 p-6 bg-github-dark rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <motion.div whileHover={{ scale: 1.1 }} className="relative flex h-24 w-24 shrink-0 overflow-hidden rounded-full">
            <img alt={user.name || user.login} className="h-full w-full object-cover" src={user.avatar_url} />
          </motion.div>
          <div className="space-y-3">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{user.name || user.login}</h1>
              <p className="text-github-text-secondary">@{user.login}</p>
            </div>
            {user.bio && <p className="text-sm max-w-3xl text-white">{user.bio}</p>}
            <div className="flex flex-wrap items-center gap-6">
              {user.location && (
                <div className="flex items-center space-x-2 text-github-text-secondary">
                  <FaMapMarkerAlt className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.twitter_username && (
                <div className="flex items-center space-x-2 text-github-text-secondary">
                  <FaTwitter className="h-4 w-4" />
                  <span>{user.twitter_username}</span>
                </div>
              )}
              {user.created_at && isClient && (
                <div className="flex items-center space-x-2 text-github-text-secondary">
                  <FaCalendarAlt className="h-4 w-4" />
                  <span>Joined on {formatDate(user.created_at)}</span>
                </div>
              )}
              {user.blog && (
                <div className="flex items-center space-x-2 text-github-text-secondary">
                  <FaLink className="h-4 w-4" />
                  <a href={user.blog} target="_blank" rel="noopener noreferrer">Blog</a>
                </div>
              )}
              <div className="flex items-center space-x-2 text-github-text-secondary">
                <FaUsers className="h-4 w-4" />
                <span>{user.followers} followers</span>
              </div>
              <div className="flex items-center space-x-2 text-github-text-secondary">
                <FiUser className="h-4 w-4" />
                <span>{user.following} following</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex space-x-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{totalRepos}</h2>
            <p className="text-github-text-secondary">Repositories</p>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{totalStars}</h2>
            <p className="text-github-text-secondary">Stars Received</p>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{totalForks}</h2>
            <p className="text-github-text-secondary">Forks</p>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="section-title flex items-center space-x-2 text-2xl font-bold text-white">
            <GoGraph />
            <span>Top Repositories</span>
          </h2>
          <Suspense fallback={<RepositoriesLoading />}>
            <div className="space-y-4">
              {repositories.map((repository) => (
                <RepositoryCard
                  key={repository.id}
                  repo={{
                    id: parseInt(repository.id),
                    name: repository.name,
                    description: repository.description || "",
                    language: repository.language || "JavaScript",
                    stars: repository.stargazers_count,
                    forks: repository.forks_count,
                    updatedAt: isClient ? formatDate(repository.updated_at) : "",
                    size: repository.size,
                    url: repository.url,
                  }}
                />
              ))}
            </div>
          </Suspense>
        </section>

        <div className="divider border-t border-github-border my-8" />

        <section>
          <h2 className="section-title flex items-center space-x-2 text-2xl font-bold text-white">
            <FaStar className="text-yellow-500" />
            <span>Recently Starred Repositories</span>
          </h2>
          <Suspense fallback={<RepositoriesLoading />}>
            <div className="space-y-4">
              {starredRepos.map((repository) => (
                <RepositoryCard
                  key={repository.id}
                  repo={{
                    id: parseInt(repository.id),
                    name: repository.name,
                    description: repository.description || "",
                    language: repository.language || "JavaScript",
                    stars: repository.stargazers_count,
                    forks: repository.forks_count,
                    updatedAt: isClient ? formatDate(repository.updated_at) : "",
                    size: repository.size,
                    url: repository.url,
                  }}
                />
              ))}
            </div>
          </Suspense>
        </section>
      </div>
    </motion.div>
  );
}

export default UserPage;
