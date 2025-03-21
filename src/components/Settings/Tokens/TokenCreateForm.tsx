import { useState } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { TokenCreateRequest } from '@/types/api';
import { SCOPE_SETS } from '@/lib/auth/token-constants';

interface TokenCreateFormProps {
  onSubmit: (tokenData: TokenCreateRequest) => void;
  onCancel?: () => void;
}

export default function TokenCreateForm({ onSubmit, onCancel }: TokenCreateFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'basic' | 'advanced'>('basic');
  const [expiresIn, setExpiresIn] = useState(90); // Default 90 days
  const [scopes, setScopes] = useState<string[]>(SCOPE_SETS.BASIC_READ);
  const [scopeSet, setScopeSet] = useState<string>('BASIC_READ');
  const [customScopes, setCustomScopes] = useState(false);
  
  const availableScopeGroups = [
    { key: 'BASIC_READ', name: 'Basic Read-Only Access' },
    { key: 'FULL_READ', name: 'Full Read-Only Access' },
    { key: 'REPO_MANAGEMENT', name: 'Repository Management' },
    { key: 'ISSUES_PRS', name: 'Issues & PRs Management' },
    { key: 'ORG_MANAGEMENT', name: 'Organization Management' },
    { key: 'FULL_WRITE', name: 'Full Write Access (Admin)' }
  ];
  
  const expirationOptions = [
    { value: 7, label: '7 days' },
    { value: 30, label: '30 days' },
    { value: 60, label: '60 days' },
    { value: 90, label: '90 days' },
    { value: 180, label: '180 days' },
    { value: 365, label: '1 year' }
  ];
  
  const allScopes = {
    "User": [
      { value: "user:read", label: "Read user information" },
      { value: "user:email:read", label: "Read user email" },
      { value: "user:profile:read", label: "Read user profile" },
      { value: "user:write", label: "Update user information" },
      { value: "user:profile:write", label: "Update user profile" },
      { value: "user:admin", label: "Administration of users" }
    ],
    "Repository": [
      { value: "repo:read", label: "List and view repositories" },
      { value: "repo:code:read", label: "Read repository code" },
      { value: "repo:issues:read", label: "Read repository issues" },
      { value: "repo:prs:read", label: "Read repository pull requests" },
      { value: "repo:releases:read", label: "Read repository releases" },
      { value: "repo:wiki:read", label: "Read repository wiki" },
      { value: "repo:webhooks:read", label: "Read repository webhooks" },
      { value: "repo:write", label: "Create and update repositories" },
      { value: "repo:code:write", label: "Write repository code" },
      { value: "repo:issues:write", label: "Create and update issues" },
      { value: "repo:prs:write", label: "Create and update pull requests" },
      { value: "repo:releases:write", label: "Create and update releases" },
      { value: "repo:wiki:write", label: "Create and update wiki pages" },
      { value: "repo:webhooks:write", label: "Manage repository webhooks" },
      { value: "repo:admin", label: "Full repository administration" }
    ],
    "Organization": [
      { value: "org:read", label: "View organization information" },
      { value: "org:members:read", label: "List organization members" },
      { value: "org:teams:read", label: "List organization teams" },
      { value: "org:write", label: "Update organization information" },
      { value: "org:members:write", label: "Manage organization members" },
      { value: "org:teams:write", label: "Manage organization teams" },
      { value: "org:admin", label: "Full organization administration" }
    ],
    "Team": [
      { value: "team:read", label: "View team information" },
      { value: "team:write", label: "Update team information" },
      { value: "team:admin", label: "Full team administration" }
    ],
    "Other": [
      { value: "search:read", label: "Perform searches" },
      { value: "analytics:read", label: "Access analytics data" },
      { value: "package:read", label: "List and view packages" },
      { value: "package:write", label: "Create and update packages" }
    ]
  };
  
  const handleScopeSetChange = (newScopeSet: string) => {
    const key = newScopeSet as keyof typeof SCOPE_SETS;
    if (SCOPE_SETS[key]) {
      setScopes([...SCOPE_SETS[key]]);
      setScopeSet(newScopeSet);
      setCustomScopes(false);
    } else if (newScopeSet === 'custom') {
      setCustomScopes(true);
    }
  };
  
  const toggleScope = (scope: string) => {
    if (scopes.includes(scope)) {
      setScopes(scopes.filter(s => s !== scope));
    } else {
      setScopes([...scopes, scope]);
    }
  };
  
  const handleTypeChange = (newType: 'basic' | 'advanced') => {
    setType(newType);
    
    // If changing from advanced to basic, remove any write scopes
    if (newType === 'basic') {
      setScopes(prevScopes => prevScopes.filter(scope => 
        scope.includes(':read') || scope === 'search:read'
      ));
      
      // If current scope set includes write permissions, reset to BASIC_READ
      if (!['BASIC_READ', 'FULL_READ'].includes(scopeSet)) {
        setScopeSet('BASIC_READ');
        setScopes([...SCOPE_SETS.BASIC_READ]);
      }
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name.trim()) {
      alert('Token name is required');
      return;
    }
    
    if (scopes.length === 0) {
      alert('At least one scope must be selected');
      return;
    }
    
    const tokenData: TokenCreateRequest = {
      name: name.trim(),
      type,
      scopes,
      expiresIn
    };
    
    if (description.trim()) {
      tokenData.description = description.trim();
    }
    
    onSubmit(tokenData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="token-name" className="block text-sm font-medium text-github-text-secondary mb-1">
            Token Name <span className="text-red-500">*</span>
          </label>
          <input
            id="token-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., 'CI Pipeline', 'Development Environment'"
            className="input input-bordered w-full"
            required
          />
          <p className="mt-1 text-xs text-github-text-secondary">
            Choose a descriptive name that helps you remember where this token is used.
          </p>
        </div>
        
        <div>
          <label htmlFor="token-description" className="block text-sm font-medium text-github-text-secondary mb-1">
            Description
          </label>
          <textarea
            id="token-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this token will be used for"
            className="textarea textarea-bordered w-full"
            rows={2}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-github-text-secondary mb-1">
            Token Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="token-type"
                checked={type === 'basic'}
                onChange={() => handleTypeChange('basic')}
                className="radio radio-primary mr-2"
              />
              <div>
                <span className="text-github-text">Basic</span>
                <p className="text-xs text-github-text-secondary">
                  Read-only access to resources
                </p>
              </div>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="token-type"
                checked={type === 'advanced'}
                onChange={() => handleTypeChange('advanced')}
                className="radio radio-primary mr-2"
              />
              <div>
                <span className="text-github-text">Advanced</span>
                <p className="text-xs text-github-text-secondary">
                  Both read and write access
                </p>
              </div>
            </label>
          </div>
        </div>
        
        <div>
          <label htmlFor="expiration" className="block text-sm font-medium text-github-text-secondary mb-1">
            Expiration <span className="text-red-500">*</span>
          </label>
          <select
            id="expiration"
            value={expiresIn}
            onChange={(e) => setExpiresIn(Number(e.target.value))}
            className="select select-bordered w-full"
          >
            {expirationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-github-text-secondary">
            For security reasons, all tokens expire. You can generate a new token when this one expires.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-github-text-secondary mb-1">
            Permissions <span className="text-red-500">*</span>
          </label>
          
          <div className="mb-4">
            <select
              value={customScopes ? 'custom' : scopeSet}
              onChange={(e) => handleScopeSetChange(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="" disabled>Select a predefined permission set</option>
              {availableScopeGroups.map(group => (
                <option 
                  key={group.key} 
                  value={group.key}
                  disabled={type === 'basic' && !['BASIC_READ', 'FULL_READ'].includes(group.key)}
                >
                  {group.name}
                  {type === 'basic' && !['BASIC_READ', 'FULL_READ'].includes(group.key) ? 
                    ' (Requires Advanced token)' : ''}
                </option>
              ))}
              <option value="custom">Custom Permissions</option>
            </select>
          </div>
          
          {customScopes && (
            <div className="bg-github-dark-secondary/40 border border-github-border rounded-md p-4 space-y-4">
              {Object.entries(allScopes).map(([category, categoryScopes]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-github-link mb-2">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {categoryScopes.map(scope => (
                      <label 
                        key={scope.value} 
                        className={`flex items-center p-2 rounded hover:bg-github-dark-secondary ${
                          type === 'basic' && !scope.value.includes(':read') ? 
                          'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={scopes.includes(scope.value)}
                          onChange={() => toggleScope(scope.value)}
                          disabled={type === 'basic' && !scope.value.includes(':read')}
                          className="checkbox checkbox-sm checkbox-primary mr-2"
                        />
                        <div>
                          <span className="text-sm text-github-text">{scope.label}</span>
                          <span className="text-xs text-github-text-secondary ml-2">
                            ({scope.value})
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-2 flex items-center">
            <span className="text-xs text-github-text-secondary mr-2">Selected scopes:</span>
            <div className="flex flex-wrap gap-1">
              {scopes.length > 0 ? (
                scopes.map(scope => (
                  <span 
                    key={scope} 
                    className="bg-github-dark-secondary text-xs px-2 py-1 rounded-full text-github-text-secondary"
                  >
                    {scope}
                  </span>
                ))
              ) : (
                <span className="text-xs text-red-400">No scopes selected</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-github-border">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost flex items-center"
          >
            <FaTimes className="mr-2" /> Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary flex items-center"
          disabled={!name.trim() || scopes.length === 0}
        >
          <FaSave className="mr-2" /> Create Token
        </button>
      </div>
    </form>
  );
}
