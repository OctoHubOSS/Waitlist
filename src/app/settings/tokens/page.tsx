"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FaKey,
  FaPlus,
  FaTrash,
  FaCopy,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import { motion } from "framer-motion";
import { TokenResponse, TokenCreateRequest } from "@/types/api";
import TokenCreateForm from "@/components/Settings/Tokens/TokenCreateForm";
import TokenCard from "@/components/Settings/Tokens/TokenCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SettingsLayout from "@/components/Layout/Settings";
import useSWR, { mutate } from "swr";

// Custom hook for token management
function useTokens() {
  const {
    data,
    error,
    isLoading,
    mutate: mutateTokens,
  } = useSWR<TokenResponse[]>("/api/v1/tokens");

  const createToken = async (tokenData: TokenCreateRequest) => {
    try {
      const response = await fetch("/api/v1/tokens", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tokenData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create token");
      }

      const newToken = await response.json();
      await mutateTokens();
      return newToken;
    } catch (err: any) {
      throw new Error(err.message || "Failed to create token");
    }
  };

  const revokeToken = async (tokenId: string) => {
    try {
      const response = await fetch(`/api/v1/tokens/${tokenId}/revoke`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to revoke token");
      }

      await mutateTokens();
    } catch (err: any) {
      throw new Error(err.message || "Failed to revoke token");
    }
  };

  return {
    tokens: data || [],
    error,
    isLoading,
    createToken,
    revokeToken,
    mutateTokens,
  };
}

export default function TokensPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newToken, setNewToken] = useState<{
    value: string;
    id: string;
  } | null>(null);
  const { tokens, error, isLoading, createToken, revokeToken } = useTokens();

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/settings/tokens");
    return null;
  }

  const handleCreateToken = async (tokenData: TokenCreateRequest) => {
    try {
      const response = await createToken(tokenData);

      if (response.data) {
        // Save the plaintext token for display (only shown once)
        setNewToken({
          value: response.data.token,
          id: response.data.id,
        });

        // Close the form
        setShowCreateForm(false);
      }
    } catch (err: any) {
      console.error("Error creating token:", err);
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    if (
      !confirm(
        "Are you sure you want to revoke this token? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await revokeToken(tokenId);
    } catch (err: any) {
      console.error("Error revoking token:", err);
    }
  };

  const copyTokenToClipboard = (token: string) => {
    navigator.clipboard
      .writeText(token)
      .then(() => {
        // Show a temporary success message
        alert("Token copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy token:", err);
      });
  };

  const clearNewToken = () => {
    setNewToken(null);
  };

  // Content to render
  let content;

  if (isLoading && tokens.length === 0) {
    content = (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  } else if (error) {
    content = (
      <div className="bg-red-900/20 border border-red-500/50 rounded-md p-4 mb-6">
        <p className="text-red-300">{error.message}</p>
        <button
          onClick={() => mutate("/api/v1/tokens")}
          className="mt-2 flex items-center text-sm text-red-300 hover:text-red-200"
        >
          <HiRefresh className="mr-1" /> Try again
        </button>
      </div>
    );
  } else {
    content = (
      <>
        {newToken && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-900/20 border border-green-500/50 rounded-md p-4 mb-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-green-300 font-medium mb-2">
                  New Token Created
                </h3>
                <p className="text-sm text-green-200 mb-2">
                  Save this token now. You won't be able to see it again!
                </p>
              </div>
              <button
                onClick={clearNewToken}
                className="text-green-300 hover:text-green-200"
              >
                ×
              </button>
            </div>
            <div className="flex items-center bg-green-950/50 border border-green-800 rounded p-2 my-2 font-mono text-sm overflow-x-auto">
              <code className="flex-1 whitespace-nowrap text-green-100">
                {newToken.value}
              </code>
              <button
                onClick={() => copyTokenToClipboard(newToken.value)}
                className="ml-2 p-1 text-green-300 hover:text-green-100"
                title="Copy to clipboard"
              >
                <FaCopy />
              </button>
            </div>
            <p className="text-xs text-green-300/80">
              For security, this token will never be displayed again.
            </p>
          </motion.div>
        )}

        {tokens.length === 0 && !showCreateForm ? (
          <div className="text-center py-12">
            <FaKey className="mx-auto h-12 w-12 text-github-text-secondary mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              No API Tokens Found
            </h3>
            <p className="text-github-text-secondary mb-6">
              Create an API token to access OctoSearch programmatically.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary flex items-center mx-auto"
            >
              <FaPlus className="mr-2" /> Create New Token
            </button>
          </div>
        ) : (
          <>
            {!showCreateForm && (
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn btn-primary flex items-center"
                >
                  <FaPlus className="mr-2" /> Create New Token
                </button>
              </div>
            )}

            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 bg-github-dark-secondary rounded-lg border border-github-border p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-medium text-white">
                    Create New API Token
                  </h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-github-text-secondary hover:text-white"
                  >
                    ×
                  </button>
                </div>
                <TokenCreateForm onSubmit={handleCreateToken} />
              </motion.div>
            )}

            <div className="space-y-6">
              {tokens.map((token) => (
                <TokenCard
                  key={token.id}
                  token={token}
                  onRevoke={handleRevokeToken}
                />
              ))}
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <SettingsLayout
      title="API Tokens"
      description="Manage your API tokens for programmatic access to OctoSearch"
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-4">API Tokens</h1>
        <p className="text-github-text-secondary">
          API tokens allow you to authenticate with the OctoSearch API from your
          applications. These tokens give you programmatic access without
          needing to use your password.
        </p>
      </div>

      <div className="bg-github-dark-secondary/40 border border-github-border rounded-md p-4 mb-8">
        <h2 className="text-lg font-medium text-github-link mb-2">
          Security Notice
        </h2>
        <ul className="list-disc list-inside text-sm text-github-text-secondary space-y-1">
          <li>Tokens have the same access as your account</li>
          <li>Treat tokens like passwords - keep them secret</li>
          <li>Use scopes to limit token access when possible</li>
          <li>Revoke tokens that are no longer needed</li>
        </ul>
      </div>

      {content}
    </SettingsLayout>
  );
}
