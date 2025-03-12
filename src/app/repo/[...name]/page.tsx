"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { use } from "react";
import { RepoPage } from "@/types/repos";
import { fetchRepositoryData } from "@/lib/API";
import RepositoryCardSkeleton from "@/components/Layout/Repository/Skeleton";
import RepositoryNotFound from "@/components/Layout/Repository/NotFound";
import RepositoryHeader from "@/components/Layout/Repository/Header";
import RepositoryStats from "@/components/Layout/Repository/Stats";
import RepositoryDetailsGrid from "@/components/Layout/Repository/Details";
import RepositoryFooter from "@/components/Layout/Repository/Footer";
import FileBrowser from "@/components/Layout/Repository/FileBrowser";

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
        <motion.div variants={itemVariants} className="">
          <div className="p-8">
            <RepositoryHeader repository={repository} itemVariants={itemVariants} />

            {/* Repository Stats */}
            <RepositoryStats repository={repository} itemVariants={itemVariants} />

            <div className="divider" />

            {/* File Browser */}
            <motion.div variants={itemVariants} className="mt-8">
              <h2 className="text-xl font-bold mb-4">Files</h2>
              <FileBrowser
                owner={repository.owner.login}
                repo={repository.name}
                defaultBranch={repository.default_branch}
              />
            </motion.div>

            <div className="divider" />

            {/* Additional Repository Info */}
            <RepositoryDetailsGrid repository={repository} itemVariants={itemVariants} />

            {/* Repository Footer */}
            <RepositoryFooter repository={repository} itemVariants={itemVariants} />
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