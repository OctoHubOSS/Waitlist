import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { FaKey, FaTrash, FaEllipsisV, FaEye, FaEyeSlash } from 'react-icons/fa';
import { TokenResponse } from '@/types/api';

interface TokenCardProps {
  token: TokenResponse;
  onRevoke: (id: string) => void;
}

export default function TokenCard({ token, onRevoke }: TokenCardProps) {
  const [showScopes, setShowScopes] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const lastUsed = token.lastUsedAt ? 
    `Last used ${formatDistanceToNow(new Date(token.lastUsedAt))} ago` : 
    'Never used';
    
  const expires = token.expiresAt ? 
    `Expires ${formatDistanceToNow(new Date(token.expiresAt))} from now` : 
    'Never expires';
    
  const created = `Created ${formatDistanceToNow(new Date(token.createdAt))} ago`;
  
  const getStatusColor = () => {
    if (token.isExpired) {
      return 'bg-red-900/20 border-red-500/50 text-red-400';
    }
    if (new Date(token.expiresAt as string) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      return 'bg-yellow-900/20 border-yellow-500/50 text-yellow-400';
    }
    return 'bg-github-dark-secondary/40 border-github-border text-github-text-secondary';
  };
  
  const getStatusText = () => {
    if (token.isExpired) {
      return 'Expired';
    }
    if (new Date(token.expiresAt as string) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      return 'Expiring soon';
    }
    return 'Active';
  };

  return (
    <motion.div 
      className="bg-github-dark-secondary rounded-lg border border-github-border overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center p-4 border-b border-github-border">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-github-dark-secondary mr-3">
            <FaKey className="text-github-link" />
          </div>
          <div>
            <h3 className="font-medium text-white">{token.name}</h3>
            <p className="text-xs text-github-text-secondary">
              {token.description || 'No description'}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-github-text-secondary hover:text-white rounded-full hover:bg-github-dark-secondary/60"
          >
            <FaEllipsisV size={14} />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-github-dark-secondary border border-github-border rounded-md shadow-lg z-10">
              <button
                onClick={() => {
                  onRevoke(token.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-red-400 hover:bg-github-dark/60"
              >
                <FaTrash className="mr-2" size={12} />
                Revoke token
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2 py-1 rounded-full ${token.type === 'BASIC' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/50' : 'bg-purple-900/20 text-purple-400 border border-purple-500/50'}`}>
            {token.type}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-xs text-github-text-secondary">
          <div>{created}</div>
          <div>{lastUsed}</div>
          <div>{expires}</div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-github-text-secondary">Permissions</h4>
            <button
              onClick={() => setShowScopes(!showScopes)}
              className="text-xs flex items-center text-github-link hover:text-github-link-hover"
            >
              {showScopes ? (
                <>
                  <FaEyeSlash className="mr-1" size={12} />
                  Hide scopes
                </>
              ) : (
                <>
                  <FaEye className="mr-1" size={12} />
                  Show scopes
                </>
              )}
            </button>
          </div>
          
          {showScopes ? (
            <div className="bg-github-dark-secondary/60 rounded-md p-3 mt-2">
              <div className="flex flex-wrap gap-1">
                {token.scopes.map(scope => (
                  <span 
                    key={scope} 
                    className="bg-github-dark-secondary text-xs px-2 py-1 rounded-full text-github-text-secondary"
                  >
                    {scope}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-github-text-secondary">
              {token.scopes.length} permission {token.scopes.length === 1 ? 'scope' : 'scopes'} granted
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
