"use client";

import { Suspense, useEffect, useState } from "react";
import { FaStar, FaCodeBranch, FaEye, FaExclamationTriangle, FaLock, FaUnlock, FaBalanceScale, FaDatabase } from "react-icons/fa";
import { GoRepo, GoGitBranch } from "react-icons/go";
import { RepoPage } from "@/types/repos";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { use } from "react";
import LanguageIcon from "@/components/Icons/Lang";

const RepositoryCardSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6 rounded-xl border border-github-border p-8 bg-github-dark-secondary">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="h-24 w-24 rounded-full bg-github-border" />
        <div className="space-y-4 w-full">
          <div className="h-8 w-3/4 rounded bg-github-border" />
          <div className="h-4 w-1/3 rounded bg-github-border" />
          <div className="h-4 w-full rounded bg-github-border" />
          <div className="flex flex-wrap gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-20 rounded bg-github-border" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="h-16 w-32 rounded bg-github-border" />
        <div className="h-16 w-32 rounded bg-github-border" />
      </div>
    </div>
  );
};

const RepositoryNotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-6 flex flex-col items-center justify-center text-center py-16"
    >
      <GoRepo className="text-6xl text-github-text-secondary mb-4" />
      <h2 className="text-2xl font-bold text-github-text mb-2">Repository Not Found</h2>
      <p className="text-github-text-secondary max-w-md">
        We couldn't find the repository you're looking for. Please check the username and repository name and try again.
      </p>
    </motion.div>
  );
};

// Updated to use our API route instead of GitHub API directly
async function fetchRepositoryData(owner: string, repo: string): Promise<RepoPage> {
  const response = await fetch(`/api/repo?owner=${owner}&repo=${repo}`);

  if (!response.ok) {
    throw new Error(`Repository not found: ${response.status}`);
  }

  return await response.json();
}

// Helper function to format repository size
const formatRepoSize = (sizeInKb: number): string => {
  if (sizeInKb < 1024) {
    return `${sizeInKb} KB`;
  } else if (sizeInKb < 1024 * 1024) {
    return `${(sizeInKb / 1024).toFixed(2)} MB`;
  } else {
    return `${(sizeInKb / (1024 * 1024)).toFixed(2)} GB`;
  }
};

function RepositoryPage({ params }: { params: Promise<{ name: string[] }> }) {
  const unwrappedParams = use(params);
  const [repository, setRepository] = useState<RepoPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setIsLoading(true);
        if (Array.isArray(unwrappedParams.name) && unwrappedParams.name.length >= 2) {
          const [owner, repo] = unwrappedParams.name;
          const data = await fetchRepositoryData(owner, repo);
          if (isMounted) {
            setRepository(data);
            setError(null);
          }
        } else {
          throw new Error("Invalid repository name format");
        }
      } catch (err) {
        if (isMounted) {
          setError((err as Error).message);
          setRepository(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [unwrappedParams.name]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <RepositoryCardSkeleton />
      </div>
    );
  }

  if (error || !repository) {
    return <RepositoryNotFound />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="overflow-hidden"
      >
        <motion.div
          variants={itemVariants}
          className="card glow-effect border border-github-border"
        >

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative flex h-32 w-32 shrink-0 overflow-hidden rounded-xl shadow-github border-2 border-github-border bg-github-dark-secondary -mt-5"
              >
                <img
                  alt={repository.owner.login}
                  className="h-full w-full object-cover transition-all duration-300 hover:brightness-110"
                  src={repository.owner.avatar_url}
                />
              </motion.div>

              {/* Repository Info */}
              <div className="space-y-4 flex-1">
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl md:text-4xl font-bold text-github-text">{repository.name}</h1>
                      {repository.visibility && (
                        <span className="badge badge-secondary inline-flex items-center">
                          {repository.visibility === "public" ? (
                            <FaUnlock className="mr-1 h-3 w-3" />
                          ) : (
                            <FaLock className="mr-1 h-3 w-3" />
                          )}
                          {repository.visibility}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <img
                        src={repository.owner.avatar_url}
                        alt={repository.owner.login}
                        className="w-5 h-5 rounded-full"
                      />
                      <p className="text-github-text-secondary font-medium">{repository.owner.login}</p>
                    </div>
                  </div>

                  <motion.a
                    href={repository.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center"
                  >
                    <GoRepo className="h-4 w-4 mr-2" />
                    View on GitHub
                  </motion.a>
                </motion.div>

                <motion.p variants={itemVariants} className="text-md max-w-3xl text-github-text">
                  {repository.description || "No description provided"}
                </motion.p>

                {/* Repository Topics */}
                {repository.topics && repository.topics.length > 0 && (
                  <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mt-2">
                    {repository.topics.map((topic) => (
                      <span key={topic} className="badge badge-primary">
                        {topic}
                      </span>
                    ))}
                  </motion.div>
                )}

                {/* Repository Stats */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-6">
                  <div className="card card-hover p-3 text-center">
                    <div className="flex items-center justify-center text-yellow-400 mb-1">
                      <FaStar className="h-5 w-5" />
                    </div>
                    <p className="text-lg font-bold text-github-text">{repository.stargazers_count.toLocaleString()}</p>
                    <p className="text-xs text-github-text-secondary">Stars</p>
                  </div>

                  <div className="card card-hover p-3 text-center">
                    <div className="flex items-center justify-center text-github-link mb-1">
                      <FaCodeBranch className="h-5 w-5" />
                    </div>
                    <p className="text-lg font-bold text-github-text">{repository.forks_count.toLocaleString()}</p>
                    <p className="text-xs text-github-text-secondary">Forks</p>
                  </div>

                  <div className="card card-hover p-3 text-center">
                    <div className="flex items-center justify-center text-neon-purple mb-1">
                      <FaEye className="h-5 w-5" />
                    </div>
                    <p className="text-lg font-bold text-github-text">{repository.watchers_count.toLocaleString()}</p>
                    <p className="text-xs text-github-text-secondary">Watchers</p>
                  </div>

                  <div className="card card-hover p-3 text-center">
                    <div className="flex items-center justify-center text-red-500 mb-1">
                      <FaExclamationTriangle className="h-5 w-5" />
                    </div>
                    <p className="text-lg font-bold text-github-text">{repository.open_issues_count.toLocaleString()}</p>
                    <p className="text-xs text-github-text-secondary">Issues</p>
                  </div>

                  <div className="card card-hover p-3 text-center">
                    <div className="flex items-center justify-center text-github-accent mb-1">
                      <GoGitBranch className="h-5 w-5" />
                    </div>
                    <p className="text-lg font-bold text-github-text">{repository.default_branch}</p>
                    <p className="text-xs text-github-text-secondary">Default Branch</p>
                  </div>
                </motion.div>
              </div>
            </div>

            <div className="divider" />

            {/* Additional Repository Info */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
              <div className="card card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-github-dark">
                    {repository.language ? (
                      <span className="flex items-center">
                        <LanguageIcon language={repository.language} size="sm" className="mr-2" />
                        <span className="text-sm font-medium text-github-text">{repository.language}</span>
                      </span>
                    ) : (
                      <span className="text-sm text-github-text-secondary">No language specified</span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-github-text">Main Language</h3>
                <p className="text-sm text-github-text-secondary mt-1">Primary programming language</p>
              </div>

              <div className="card card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-github-dark">
                    {repository.archived ? (
                      <FaLock className="h-4 w-4 text-amber-400" />
                    ) : (
                      <FaUnlock className="h-4 w-4 text-github-accent" />
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-github-text">{repository.archived ? "Archived" : "Active"}</h3>
                <p className="text-sm text-github-text-secondary mt-1">Repository status</p>
              </div>

              <div className="card card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-github-dark">
                    <FaDatabase className="h-4 w-4 text-teal-500" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-github-text">{formatRepoSize(repository.size)}</h3>
                <p className="text-sm text-github-text-secondary mt-1">Repository size</p>
              </div>

              <div className="card card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-github-dark">
                    {repository.license ? (
                      <FaBalanceScale className="h-4 w-4 text-github-link" />
                    ) : (
                      <span className="text-xs text-github-text-secondary">None</span>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-github-text">{repository.license ? repository.license.name : "No License"}</h3>
                <p className="text-sm text-github-text-secondary mt-1">License information</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-github-text-secondary text-sm">Last updated</span>
                  <h4 className="text-xl font-semibold text-github-text">
                    {format(new Date(repository.updated_at), "MMMM dd, yyyy")}
                  </h4>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 text-github-text-secondary">
                    {repository.allow_forking ? (
                      <FaCodeBranch className="h-4 w-4 text-github-accent" />
                    ) : (
                      <FaLock className="h-4 w-4 text-red-500" />
                    )}
                    <span>{repository.allow_forking ? "Forking Allowed" : "Forking Disabled"}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-github-text-secondary">
                    {repository.is_template ? (
                      <GoRepo className="h-4 w-4 text-neon-purple" />
                    ) : (
                      <span className="text-github-text-secondary">•</span>
                    )}
                    <span>{repository.is_template ? "Template Repository" : "Standard Repository"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function RepositoryPageWithSuspense(props: { params: Promise<{ name: string[] }> }) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12">
          <RepositoryCardSkeleton />
        </div>
      }
    >
      <RepositoryPage params={props.params} />
    </Suspense>
  );
}