import { ReactNode } from 'react';
import { ModernExplorerProvider } from './useModernExplorer';
import ModernLayout from '../ModernLayout';
import { FileItem } from '@/types/repos';

interface ModernExplorerProps {
    owner: string;
    repo: string;
    defaultBranch: string;
    initialContents?: FileItem[] | null;
    currentPath?: string;
    children?: ReactNode;
}

export default function ModernExplorer({
    owner,
    repo,
    defaultBranch,
    initialContents,
    currentPath,
    children
}: ModernExplorerProps) {
    return (
        <ModernExplorerProvider
            owner={owner}
            repo={repo}
            defaultBranch={defaultBranch}
            initialContents={initialContents}
            currentPath={currentPath}
        >
            {children || <ModernLayout />}
        </ModernExplorerProvider>
    );
}

// Export the hook for external use
export { useModernExplorer } from './useModernExplorer';