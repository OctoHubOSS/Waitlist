'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, ChevronDown, RefreshCw, Terminal, Info, ChevronRight, Copy, Check } from 'lucide-react';

interface ErrorDetails {
  message: string;
  code?: string;
  status?: number;
  timestamp?: string;
  requestId?: string;
  path?: string;
  stack?: string;
  context?: Record<string, any>;
}

interface DashboardErrorProps {
  title?: string;
  message: string;
  details?: ErrorDetails;
  onRetry?: () => void;
}

export function DashboardError({
  title = 'Error Loading Dashboard',
  message,
  details,
  onRetry
}: DashboardErrorProps) {
  const [expanded, setExpanded] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<{ browser: string; os: string; device: string }>({
    browser: 'Unknown',
    os: 'Unknown',
    device: 'Unknown'
  });
  
  // Extract critical info from the error
  const errorInfo = {
    timestamp: details?.timestamp || new Date().toISOString(),
    errorType: details?.code || 'AppError',
    status: details?.status || 500,
    path: details?.path || window.location.pathname,
    errorId: details?.requestId || generateErrorId(),
  };

  // Get browser info on mount
  useEffect(() => {
    const detectBrowserInfo = async () => {
      try {
        // Use the browser's built-in capabilities to detect user agent
        const userAgent = navigator.userAgent;
        
        // Simple detection (you can replace this with your utility functions)
        const browser = detectBrowser(userAgent);
        const os = detectOS(userAgent);
        const device = detectDevice(userAgent);
        
        setBrowserInfo({ browser, os, device });
      } catch (error) {
        console.error('Failed to detect browser info:', error);
      }
    };
    
    detectBrowserInfo();
  }, []);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };
  
  const copyErrorInfoToClipboard = () => {
    const errorReport = {
      ...errorInfo,
      message,
      userAgent: navigator.userAgent,
      url: window.location.href,
      browser: browserInfo.browser,
      os: browserInfo.os,
      device: browserInfo.device,
      timestamp: new Date().toISOString(),
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-900/20 border border-red-900/40 rounded-xl p-4 sm:p-6 text-red-300">
        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
          <div className="p-2 bg-red-600/20 rounded-full mb-3 sm:mb-0 sm:mt-1 flex-shrink-0 self-start">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
          </div>
          
          <div className="w-full">
            <h3 className="text-lg font-semibold text-red-300 mb-1">{title}</h3>
            <p className="text-red-300/90 mb-4 break-words">{message}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {onRetry && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="px-4 py-2 bg-github-dark-secondary hover:bg-github-dark text-github-text-secondary hover:text-white rounded-md transition-colors inline-flex items-center justify-center"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                  {isRetrying ? 'Retrying...' : 'Retry'}
                </button>
              )}
              
              <button
                onClick={copyErrorInfoToClipboard}
                className="px-4 py-2 bg-github-dark text-github-text-secondary hover:text-white rounded-md transition-colors inline-flex items-center justify-center"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    <span>Copy Error Info</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-black/20 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-y-2">
              <div className="flex items-center text-xs text-red-300/70 ml-2 mr-4">
                <Info className="h-3.5 w-3.5 mr-1" />
                <span>Error ID: {errorInfo.errorId.slice(0, 8)}</span>
              </div>
              
              <div className="text-xs text-red-300/70 mr-4">
                {browserInfo.browser} on {browserInfo.os}
              </div>
              
              <div className="text-xs text-red-300/70">
                {new Date(errorInfo.timestamp).toLocaleString()}
              </div>
            </div>
            
            {details && (
              <button
                className={`flex items-center text-sm text-red-300/70 hover:text-red-300 transition-colors ${expanded ? 'mb-4' : ''}`}
                onClick={() => setExpanded(!expanded)}
              >
                <Terminal className="h-4 w-4 mr-1" />
                <span>{expanded ? 'Hide' : 'Show'} technical details</span>
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
            
            {expanded && (
              <div className="mt-2 p-3 sm:p-4 bg-black/30 rounded-md font-mono text-xs overflow-x-auto">
                <div className="w-full overflow-x-auto">
                  <table className="min-w-full text-left">
                    <tbody>
                      <tr>
                        <td className="py-1 pr-4 text-red-300/60 whitespace-nowrap">Browser:</td>
                        <td className="py-1 break-words">{browserInfo.browser}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4 text-red-300/60 whitespace-nowrap">OS:</td>
                        <td className="py-1 break-words">{browserInfo.os}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4 text-red-300/60 whitespace-nowrap">Device:</td>
                        <td className="py-1 break-words">{browserInfo.device}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4 text-red-300/60 whitespace-nowrap">Error ID:</td>
                        <td className="py-1 break-words">{errorInfo.errorId}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4 text-red-300/60 whitespace-nowrap">Time:</td>
                        <td className="py-1 break-words">{errorInfo.timestamp}</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4 text-red-300/60 whitespace-nowrap">Path:</td>
                        <td className="py-1 break-words">{errorInfo.path}</td>
                      </tr>
                      {details?.status && (
                        <tr>
                          <td className="py-1 pr-4 text-red-300/60 whitespace-nowrap">Status:</td>
                          <td className="py-1 break-words">{details.status}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {details?.context && Object.keys(details.context).length > 0 && (
                  <div className="mt-4">
                    <div className="text-red-300/60 mb-1">Additional Information:</div>
                    <div className="bg-black/50 p-2 rounded overflow-x-auto">
                      <pre className="whitespace-pre-wrap text-xs text-red-300/80 break-words max-w-full">
                        {JSON.stringify(details.context, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4 text-xs text-red-300/70 flex justify-between items-center">
              <span>If this issue persists, please contact support.</span>
              <a href="mailto:support@octohub.app?subject=Dashboard Error" className="flex items-center text-red-300 hover:underline">
                Contact Support
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple utilities for detecting browser info (you could replace these with your existing utilities)
function detectBrowser(userAgent: string): string {
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/chrome/i.test(userAgent)) return 'Chrome';
  if (/safari/i.test(userAgent)) return 'Safari';
  if (/edge/i.test(userAgent)) return 'Edge';
  if (/opera/i.test(userAgent) || /opr/i.test(userAgent)) return 'Opera';
  if (/msie|trident/i.test(userAgent)) return 'Internet Explorer';
  return 'Unknown Browser';
}

function detectOS(userAgent: string): string {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/macintosh|mac os x/i.test(userAgent)) return 'macOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
  return 'Unknown OS';
}

function detectDevice(userAgent: string): string {
  if (/mobile|iphone|ipod|android.*mobile|blackberry|iemobile/i.test(userAgent)) return 'Mobile';
  if (/ipad|android(?!.*mobile)/i.test(userAgent)) return 'Tablet';
  return 'Desktop';
}

function generateErrorId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
