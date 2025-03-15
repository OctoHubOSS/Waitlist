import { FileItem } from "@/types/repos";

/**
 * Determine file language for syntax highlighting
 */
export const getFileLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'rb': 'ruby',
        'java': 'java',
        'php': 'php',
        'go': 'go',
        'c': 'c',
        'cpp': 'cpp',
        'cs': 'csharp',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'yaml': 'yaml',
        'yml': 'yaml',
        'md': 'markdown',
        'mdx': 'markdown',
        'sh': 'bash',
        'bash': 'bash',
    };

    return languageMap[ext] || 'plaintext';
};

/**
 * Check if file is a markdown file
 */
export const isMarkdown = (filename: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return ['md', 'mdx', 'markdown'].includes(ext);
};

/**
 * Check if file is an image
 */
export const isImage = (filename: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
};

/**
 * Helper function to find README file in a list of files
 */
export const findReadmeFile = (fileList: FileItem[]): FileItem | null => {
    const readmePatterns = [
        /^readme\.md$/i,
        /^readme\.mdx$/i,
        /^readme\.markdown$/i,
        /^readme$/i
    ];

    for (const pattern of readmePatterns) {
        const readmeFile = fileList.find(file =>
            file.type === "file" && pattern.test(file.name)
        );
        if (readmeFile) return readmeFile;
    }

    return null;
};