import { useState, useEffect } from 'react';
import { FaTimes, FaDownload, FaCopy, FaEllipsisV } from "react-icons/fa";

interface FileActionsProps {
    fileContent: string | null;
    selectedFile: any;
    backToDirectory: () => void;
    isImage: (name: string) => boolean;
}

const FileActions = ({ fileContent, selectedFile, backToDirectory, isImage }: FileActionsProps) => {
    const [showFileMenu, setShowFileMenu] = useState(false);

    // Add function to copy file contents to clipboard
    const copyFileContents = () => {
        if (fileContent) {
            navigator.clipboard.writeText(fileContent)
                .then(() => {
                    // You could add a toast notification here
                    console.log('Content copied to clipboard');
                    // Close the dropdown after action
                    setShowFileMenu(false);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                });
        }
    };

    // Function to download the file
    const downloadFile = () => {
        if (selectedFile && selectedFile.download_url) {
            // For images and binary files that already have a download URL
            window.open(selectedFile.download_url, '_blank');
        } else if (fileContent) {
            // For text files we can create a download from the content
            const element = document.createElement('a');
            const file = new Blob([fileContent], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = selectedFile?.name || 'download.txt';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
        // Close the dropdown after action
        setShowFileMenu(false);
    };

    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            // Check if click is outside the dropdown
            const dropdown = document.getElementById('file-action-dropdown');
            const button = document.getElementById('file-action-button');
            if (dropdown && button) {
                if (!dropdown.contains(e.target as Node) && !button.contains(e.target as Node)) {
                    setShowFileMenu(false);
                }
            }
        };

        if (showFileMenu) {
            document.addEventListener('mousedown', handleGlobalClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleGlobalClick);
        };
    }, [showFileMenu]);

    return (
        <div className="relative">
            <button
                id="file-action-button"
                onClick={(e) => {
                    e.stopPropagation();
                    setShowFileMenu(!showFileMenu);
                }}
                className="bg-github-dark hover:bg-github-dark-secondary border border-github-border text-white px-4 py-2 rounded-lg transition-colors flex items-center"
            >
                <span className="mr-2">Actions</span>
                <FaEllipsisV className="w-3 h-3" />
            </button>

            {showFileMenu && (
                <div
                    id="file-action-dropdown"
                    className="absolute right-0 top-full mt-1 bg-github-dark rounded-lg border border-gray-700 shadow-xl z-10 w-48 overflow-hidden"
                >
                    <div className="py-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                backToDirectory();
                                setShowFileMenu(false);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-white"
                        >
                            <FaTimes className="w-4 h-4 mr-3 text-red-400" />
                            Close file
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                downloadFile();
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-white"
                        >
                            <FaDownload className="w-4 h-4 mr-3 text-blue-400" />
                            Download file
                        </button>

                        {fileContent && !isImage(selectedFile.name) && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    copyFileContents();
                                }}
                                className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-white"
                            >
                                <FaCopy className="w-4 h-4 mr-3 text-green-400" />
                                Copy contents
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileActions;