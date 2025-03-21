import { useState } from 'react';
import { FaKey, FaPlus, FaChartLine, FaBook } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TokenResponse } from '@/types/api';
import TokenCard from './TokenCard';
import TokenCreateForm from './TokenCreateForm';

interface TokenDashboardProps {
  tokens: TokenResponse[];
  onCreateToken: (data: any) => Promise<void>;
  onRevokeToken: (id: string) => Promise<void>;
  loading: boolean;
  newToken: { value: string, id: string } | null;
  onClearNewToken: () => void;
}

export default function TokenDashboard({
  tokens,
  onCreateToken,
  onRevokeToken,
  loading,
  newToken,
  onClearNewToken
}: TokenDashboardProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const handleTokenCreated = async (data: any) => {
    await onCreateToken(data);
    setShowCreateForm(false);
  };
  
  const copyTokenToClipboard = (token: string) => {
    navigator.clipboard.writeText(token)
      .then(() => {
        alert('Token copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy token:', err);
      });
  };
  
  return (
    <div>
      {/* Success message for new token */}
      {newToken && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-900/20 border border-green-500/50 rounded-md p-4 mb-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-green-300 font-medium mb-2">New Token Created</h3>
              <p className="text-sm text-green-200 mb-2">
                Save this token now. You won't be able to see it again!
              </p>
            </div>
            <button 
              onClick={onClearNewToken}
              className="text-green-300 hover:text-green-200"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="flex items-center bg-green-950/50 border border-green-800 rounded p-2 my-2 font-mono text-sm overflow-x-auto">
            <code className="flex-1 whitespace-nowrap text-green-100">{newToken.value}</code>
            <button 
              onClick={() => copyTokenToClipboard(newToken.value)}
              className="ml-2 p-1 text-green-300 hover:text-green-100"
              title="Copy to clipboard"
              aria-label="Copy to clipboard"
            >
              <FaPlus className="mr-2" />
            </button>
          </div>
          <p className="text-xs text-green-300/80">
            For security, this token will never be displayed again.
          </p>
        </motion.div>
      )}
      
      {/* Empty state */}
      {tokens.length === 0 && !showCreateForm ? (
        <div className="text-center py-12">
          <FaKey className="mx-auto h-12 w-12 text-github-text-secondary mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No API Tokens Found</h3>
          <p className="text-github-text-secondary mb-6">
            Create an API token to access OctoSearch programmatically.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary flex items-center justify-center"
              disabled={loading}
            >
              <FaPlus className="mr-2" /> Create New Token
            </button>
            
            <Link
              href="/settings/tokens/guide"
              className="btn btn-outline flex items-center justify-center"
            >
              <FaBook className="mr-2" /> View Usage Guide
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Action buttons when tokens exist */}
          {!showCreateForm && (
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary flex items-center"
                disabled={loading}
              >
                <FaPlus className="mr-2" /> Create New Token
              </button>
              
              <Link
                href="/settings/tokens/guide"
                className="btn btn-outline flex items-center"
              >
                <FaBook className="mr-2" /> Usage Guide
              </Link>
              
              <Link
                href="/settings/tokens/analytics"
                className="btn btn-outline flex items-center"
              >
                <FaChartLine className="mr-2" /> Usage Analytics
              </Link>
            </div>
          )}
          
          {/* Create form */}
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-github-dark-secondary rounded-lg border border-github-border p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium text-white">Create New API Token</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-github-text-secondary hover:text-white"
                  aria-label="Close form"
                >
                  ×
                </button>
              </div>
              <TokenCreateForm 
                onSubmit={handleTokenCreated}
                onCancel={() => setShowCreateForm(false)}
              />
            </motion.div>
          )}
          
          {/* Token list */}
          {tokens.length > 0 && (
            <div className="space-y-6">
              {tokens.map(token => (
                <TokenCard 
                  key={token.id} 
                  token={token} 
                  onRevoke={onRevokeToken}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
