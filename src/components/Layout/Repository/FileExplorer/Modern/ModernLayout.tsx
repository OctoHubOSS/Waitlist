import useModernExplorer from './hooks/useModernExplorer';
import BreadcrumbNav from './components/BreadcrumbNav';
import BranchSelector from './components/BranchSelector';
import FileHeader from './components/FileHeader';
import FileTable from './components/FileTable';
import EmptyState from './components/EmptyState';
import FileRenderer from './components/FileRenderer';

const ModernLayout = () => {
    const {
        files,
        currentPath,
        isLoading,
        selectedFile,
        fileContent,
        fileViewLoading,
        fileViewError,
        isImage,
        isMarkdown,
        getFileLanguage
    } = useModernExplorer();

    return (
        <div className="rounded-lg overflow-hidden bg-github-dark shadow-lg border border-github-border">
            {/* Header with breadcrumbs and branch selector */}
            <div className="py-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <BreadcrumbNav />
                <BranchSelector />
            </div>

            {/* File content or directory listing */}
            {selectedFile ? (
                <div className="bg-github-dark">
                    <FileHeader />
                    <div className="p-6">
                        <FileRenderer />
                    </div>
                </div>
            ) : (
                <div className="p-6 bg-github-dark-secondary">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-600 border-t-github-link"></div>
                            <p className="mt-4 text-gray-400">Loading files...</p>
                        </div>
                    ) : files && files.length > 0 ? (
                        <FileTable />
                    ) : (
                        <EmptyState />
                    )}
                </div>
            )}
        </div>
    );
};

export default ModernLayout;