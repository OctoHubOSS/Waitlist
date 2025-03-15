"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useRepository } from "@/utils/fetcher";
import RepositoryCardSkeleton from "@/components/Layout/Repository/Skeleton";
import RepositoryNotFound from "@/components/Layout/Repository/NotFound";
import RepositoryHeader from "@/components/Layout/Repository/Header";
import RepositoryStats from "@/components/Layout/Repository/Stats";
import RepositoryDetailsGrid from "@/components/Layout/Repository/Details";
import RepositoryFooter from "@/components/Layout/Repository/Footer";
import FileBrowser from "@/components/Layout/Repository/FileExplorer/Standard";
import ModernExplorer from "@/components/Layout/Repository/FileExplorer/Modern";
import ViewToggle from "@/components/Layout/Repository/PageClient/ViewToggle";
import { animations } from "@/components/Layout/Repository/PageClient/utils/animations";
import { extractRepoInfo } from "@/components/Layout/Repository/PageClient/utils/repo";

export default function RepositoryPageClient({
  params,
}: {
  params: { name?: string[] };
}) {
  const [owner, setOwner] = useState<string>("");
  const [repo, setRepo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"standard" | "explorer">(
    // Get saved preference from localStorage or default to "standard"
    typeof window !== "undefined"
      ? (localStorage.getItem("fileExplorerViewMode") as
          | "standard"
          | "explorer") || "standard"
      : "standard",
  );
  const pathname = usePathname();

  // Extract owner and repo from params or URL
  useEffect(() => {
    const {
      extractedOwner,
      extractedRepo,
      error: extractError,
    } = extractRepoInfo(params.name, pathname);

    if (extractedOwner && extractedRepo) {
      setOwner(extractedOwner);
      setRepo(extractedRepo);
      setError(null);
    } else {
      setError(extractError || "Could not determine repository from URL");
    }
  }, [params, pathname]);

  // Use repository data fetcher with better error handling for Octokit responses
  const { data, error: fetchError, isLoading } = useRepository(owner, repo);

  // Handle errors from fetcher with improved error handling
  useEffect(() => {
    if (fetchError) {
      console.error("Repository fetch error:", fetchError);
      const errorMessage =
        fetchError.error ||
        (typeof fetchError === "string"
          ? fetchError
          : "Failed to load repository");
      setError(errorMessage);
    }
  }, [fetchError]);

  // Save view mode preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("fileExplorerViewMode", viewMode);
    }
  }, [viewMode]);

  // Loading state
  if (isLoading || (!data && !error)) {
    return <RepositoryCardSkeleton />;
  }

  // Error state
  if (error || !data) {
    return <RepositoryNotFound error={error as any} />;
  }

  // Extract repository data
  const repository = data.repository;
  const { containerVariants, itemVariants } = animations;

  return (
    <div className="mx-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="overflow-hidden"
      >
        <motion.div variants={itemVariants}>
          <div className="p-8">
            <RepositoryHeader
              repository={repository}
              itemVariants={itemVariants}
            />
            <RepositoryStats
              repository={repository}
              itemVariants={itemVariants}
            />

            <div className="divider" />

            <RepositoryFiles
              repository={repository}
              data={data}
              viewMode={viewMode}
              setViewMode={setViewMode}
              itemVariants={itemVariants}
            />

            <div className="divider mt-8" />

            <RepositoryDetailsGrid
              repository={repository}
              itemVariants={itemVariants}
            />
            <RepositoryFooter
              repository={repository}
              itemVariants={itemVariants}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Repository Files Section Component
 */
interface RepositoryFilesProps {
  repository: any;
  data: any;
  viewMode: "standard" | "explorer";
  setViewMode: (mode: "standard" | "explorer") => void;
  itemVariants: any;
}

function RepositoryFiles({
  repository,
  data,
  viewMode,
  setViewMode,
  itemVariants,
}: RepositoryFilesProps) {
  const toggleViewMode = () => {
    setViewMode(viewMode === "standard" ? "explorer" : "standard");
  };

  return (
    <motion.div variants={itemVariants} className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">File Explorer</h2>
        <ViewToggle viewMode={viewMode} toggleViewMode={toggleViewMode} />
      </div>

      {viewMode === "standard" ? (
        <FileBrowser
          owner={repository.owner.login}
          repo={repository.name}
          defaultBranch={repository.default_branch}
          initialContents={data.contents}
          currentPath={data.currentPath}
        />
      ) : (
        <ModernExplorer
          owner={repository.owner.login}
          repo={repository.name}
          defaultBranch={repository.default_branch}
          initialContents={data.contents}
          currentPath={data.currentPath}
        />
      )}
    </motion.div>
  );
}
