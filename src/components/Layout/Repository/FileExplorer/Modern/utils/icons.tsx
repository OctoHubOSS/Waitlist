import React from 'react';
import {
    FaFile,
    FaFileCode,
    FaFileAlt,
    FaFileImage,
    FaFilePdf,
    FaFileVideo,
    FaFileArchive,
    FaFileExcel,
    FaFilePowerpoint,
    FaFileWord,
    FaFileAudio,
    FaMarkdown
} from 'react-icons/fa';
import { isImage, isMarkdown } from './fileType';

/**
 * Get appropriate icon for a file based on its extension
 */
export const getFileIcon = (fileName: string, isImageFn = isImage, isMarkdownFn = isMarkdown) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    if (isImageFn(fileName)) {
        return <FaFileImage className="text-purple-400" />;
    }

    if (isMarkdownFn(fileName)) {
        return <FaMarkdown className="text-blue-400" />;
    }

    switch (ext) {
        // Code files
        case 'js':
        case 'jsx':
        case 'ts':
        case 'tsx':
        case 'py':
        case 'rb':
        case 'php':
        case 'go':
        case 'java':
        case 'c':
        case 'cpp':
        case 'cs':
        case 'html':
        case 'css':
        case 'scss':
        case 'json':
        case 'xml':
        case 'yaml':
        case 'yml':
            return <FaFileCode className="text-yellow-400" />;

        // Document files
        case 'pdf':
            return <FaFilePdf className="text-red-400" />;
        case 'doc':
        case 'docx':
            return <FaFileWord className="text-blue-600" />;
        case 'xls':
        case 'xlsx':
        case 'csv':
            return <FaFileExcel className="text-green-600" />;
        case 'ppt':
        case 'pptx':
            return <FaFilePowerpoint className="text-orange-500" />;

        // Media files
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
            return <FaFileVideo className="text-indigo-400" />;
        case 'mp3':
        case 'wav':
        case 'ogg':
            return <FaFileAudio className="text-green-400" />;

        // Archive files
        case 'zip':
        case 'tar':
        case 'gz':
        case 'rar':
        case '7z':
            return <FaFileArchive className="text-amber-500" />;

        // Text files
        case 'txt':
            return <FaFileAlt className="text-gray-400" />;

        // Default file icon
        default:
            return <FaFile className="text-gray-400" />;
    }
};