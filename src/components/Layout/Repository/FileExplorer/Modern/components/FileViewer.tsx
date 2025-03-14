import { useModernFileExplorer } from "../hooks/useModernFileExplorer";
import { FiDownload, FiCopy, FiShare2, FiMoreHorizontal } from "react-icons/fi";
import { MdOutlineColorLens, MdExpandMore } from "react-icons/md";
import ModernImageRenderer from "../renderers/ImageRenderer";
import ModernMarkdownRenderer from "../renderers/MarkdownRenderer";
import ModernCodeRenderer from "../renderers/CodeRenderer";
import { useState, useRef, useEffect } from "react";

export default function ModernFileViewer() {
    const {
        selectedFile,
        fileContent,
        fileViewLoading,
        fileViewError,
        formatBytes,
        isImage,
        isMarkdown,
        syntaxTheme,
        setSyntaxTheme
    } = useModernFileExplorer();

    const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
    const actionsMenuRef = useRef<HTMLDivElement>(null);

    // Available themes - Make sure these match the imports in CodeRenderer
    const availableThemes = [
        { id: 'atomOneDark', name: 'Atom One Dark' },
        { id: 'atomOneLight', name: 'Atom One Light' },
        { id: 'dracula', name: 'Dracula' },
        { id: 'github', name: 'GitHub' },
        { id: 'monokai', name: 'Monokai' },
        { id: 'nord', name: 'Nord' },
        { id: 'vs', name: 'VS Light' },
        { id: 'vscDarkPlus', name: 'VS Code Dark+' }
    ];

    // Handle copying file content
    const handleCopyContent = async () => {
        if (fileContent) {
            try {
                await navigator.clipboard.writeText(fileContent);
                // Could add toast notification here
                setActionsMenuOpen(false);
            } catch (err) {
                console.error("Failed to copy content:", err);
            }
        }
    };

    // Handle sharing file
    const handleShare = () => {
        const fileUrl = window.location.href;

        if (navigator.share) {
            navigator.share({
                title: selectedFile?.name || 'Shared File',
                url: fileUrl
            }).then(() => {
                setActionsMenuOpen(false);
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(fileUrl)
                .then(() => {
                    // Could add toast notification here
                    setActionsMenuOpen(false);
                })
                .catch(console.error);
        }
    };

    // Handle theme change
    const handleThemeChange = (themeId: string) => {
        console.log("Changing theme to:", themeId);
        setSyntaxTheme(themeId);
        setActionsMenuOpen(false);
    };

    // Close the dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
                setActionsMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!selectedFile) return null;

    const isCodeFile = !isImage(selectedFile.name);

    return (
        <div className="modern-file-viewer">
            <div className="bg-github-dark border-b border-github-border p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <span className="font-medium text-github-text">{selectedFile.name}</span>
                    <span className="ml-3 text-xs text-github-text-secondary">
                        {formatBytes(selectedFile.size)}
                    </span>
                </div>

                <div className="relative" ref={actionsMenuRef}>
                    <button
                        onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
                        className="flex items-center text-sm text-github-text-secondary hover:text-github-link bg-github-dark-secondary hover:bg-github-dark-secondary/80 py-1 px-3 rounded-md transition-colors"
                    >
                        <FiMoreHorizontal className="h-4 w-4 mr-2" />
                        Actions
                    </button>

                    {actionsMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-github-dark rounded-lg shadow-lg z-10 border border-github-border overflow-hidden">
                            {selectedFile.download_url && (
                                <a
                                    href={selectedFile.download_url}
                                    download={selectedFile.name}
                                    className="flex items-center w-full text-left px-4 py-2 text-github-text hover:bg-github-dark-secondary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setActionsMenuOpen(false)}
                                >
                                    <FiDownload className="h-4 w-4 mr-3" />
                                    Download
                                </a>
                            )}

                            {fileContent && isCodeFile && (
                                <button
                                    onClick={handleCopyContent}
                                    className="flex items-center w-full text-left px-4 py-2 text-github-text hover:bg-github-dark-secondary"
                                >
                                    <FiCopy className="h-4 w-4 mr-3" />
                                    Copy content
                                </button>
                            )}

                            <button
                                onClick={handleShare}
                                className="flex items-center w-full text-left px-4 py-2 text-github-text hover:bg-github-dark-secondary"
                            >
                                <FiShare2 className="h-4 w-4 mr-3" />
                                Share file link
                            </button>

                            {fileContent && isCodeFile && !isMarkdown(selectedFile.name) && (
                                <div className="border-t border-github-border mt-1 pt-1">
                                    <div className="px-4 py-2 text-xs text-github-text-secondary">
                                        Syntax Theme
                                    </div>

                                    {availableThemes.map(theme => (
                                        <button
                                            key={theme.id}
                                            className={`flex items-center w-full text-left px-4 py-2 ${syntaxTheme === theme.id
                                                    ? 'bg-github-dark-secondary text-github-link'
                                                    : 'text-github-text hover:bg-github-dark-secondary'
                                                }`}
                                            onClick={() => handleThemeChange(theme.id)}
                                        >
                                            <MdOutlineColorLens className="h-4 w-4 mr-3" />
                                            <span>{theme.name}</span>
                                            {syntaxTheme === theme.id && (
                                                <span className="ml-auto text-sm text-github-text-secondary">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-hidden">
                {fileViewLoading ? (
                    <div className="animate-pulse p-6">
                        <div className="h-4 bg-github-border rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-github-border rounded w-1/2 mb-3"></div>
                        <div className="h-4 bg-github-border rounded w-5/6 mb-3"></div>
                        <div className="h-4 bg-github-border rounded w-2/3"></div>
                    </div>
                ) : fileViewError ? (
                    <div className="p-6 bg-red-900/20 text-red-400">
                        {fileViewError}
                    </div>
                ) : fileContent ? (
                    isImage(selectedFile.name) ? (
                        <ModernImageRenderer
                            url={selectedFile.download_url as string}
                            name={selectedFile.name}
                        />
                    ) : isMarkdown(selectedFile.name) ? (
                        <ModernMarkdownRenderer content={fileContent} />
                    ) : (
                        <ModernCodeRenderer
                            content={fileContent}
                            filename={selectedFile.name}
                        />
                    )
                ) : (
                    <div className="p-6 text-github-text-secondary">
                        No content available
                    </div>
                )}
            </div>
        </div>
    );
}
