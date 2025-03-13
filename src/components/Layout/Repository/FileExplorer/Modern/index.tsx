import { ModernExplorerProvider } from './hooks/useModernExplorer';
import ModernLayout from './ModernLayout';
import { FileItem } from '@/types/repos';

interface ModernExplorerProps {
    owner: string;
    repo: string;
    defaultBranch: string;
    initialContents?: FileItem[] | null;
    currentPath?: string;
}

export default function ModernExplorer({
    owner,
    repo,
    defaultBranch,
    initialContents,
    currentPath,
}: ModernExplorerProps) {
    return (
        <ModernExplorerProvider
            owner={owner}
            repo={repo}
            defaultBranch={defaultBranch}
            initialContents={initialContents}
            currentPath={currentPath}
        >
            <ModernLayout />
        </ModernExplorerProvider>
    );
}

const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString();
};

// Export the hook for external use
export { useModernExplorer } from './hooks/useModernExplorer';