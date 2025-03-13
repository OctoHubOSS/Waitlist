import ImageRenderer from '../renderers/ImageRenderer';
import MarkdownRenderer from '../renderers/MarkdownRenderer';
import CodeRenderer from '../renderers/CodeRenderer';

interface ContentRendererProps {
    selectedFile: any | null;
    fileContent: string | null;
    fileViewLoading: boolean;
    fileViewError: string | null;
    isImage: (name: string) => boolean;
    isMarkdown: (name: string) => boolean;
    getSyntaxLanguage: (filename: string) => string;
}

const ContentRenderer = ({
    selectedFile,
    fileContent,
    fileViewLoading,
    fileViewError,
    isImage,
    isMarkdown,
    getSyntaxLanguage
}: ContentRendererProps) => {
    if (fileViewLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-github-link"></div>
            </div>
        );
    }

    if (fileViewError) {
        return (
            <div className="p-6 bg-red-900/20 border border-red-900/30 rounded-lg text-red-400">
                <h3 className="text-lg font-semibold mb-2">Error loading file</h3>
                <p>{fileViewError}</p>
            </div>
        );
    }

    if (!fileContent || !selectedFile) {
        return (
            <div className="p-6 text-gray-400">
                No content available
            </div>
        );
    }

    if (isImage(selectedFile.name)) {
        return (
            <ImageRenderer url={selectedFile.download_url} name={selectedFile.name} />
        );
    }

    if (isMarkdown(selectedFile.name)) {
        return (
            <MarkdownRenderer content={fileContent} />
        );
    }

    // Code syntax highlighting
    return (
        <CodeRenderer
            content={fileContent}
            language={getSyntaxLanguage(selectedFile.name)}
        />
    );
};

export default ContentRenderer;