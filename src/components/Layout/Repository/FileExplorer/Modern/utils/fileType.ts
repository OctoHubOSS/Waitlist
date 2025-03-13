import { FileItem } from "@/types/repos";

/**
 * Check if file is an image
 */
export const isImage = (filename: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext);
};

/**
 * Check if file is a markdown file
 */
export const isMarkdown = (filename: string): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return ['md', 'mdx', 'markdown'].includes(ext);
};

/**
 * Get human-readable file type name
 */
export const getFileLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
        'js': 'JavaScript',
        'jsx': 'JavaScript (React)',
        'ts': 'TypeScript',
        'tsx': 'TypeScript (React)',
        'py': 'Python',
        'rb': 'Ruby',
        'java': 'Java',
        'php': 'PHP',
        'go': 'Go',
        'c': 'C',
        'cpp': 'C++',
        'cs': 'C#',
        'html': 'HTML',
        'css': 'CSS',
        'scss': 'SCSS',
        'less': 'Less',
        'json': 'JSON',
        'yaml': 'YAML',
        'yml': 'YAML',
        'md': 'Markdown',
        'mdx': 'MDX',
        'sh': 'Shell',
        'bash': 'Bash',
        'sql': 'SQL',
        'graphql': 'GraphQL',
        'xml': 'XML',
        'svg': 'SVG',
        'txt': 'Text',
        'csv': 'CSV',
        'pdf': 'PDF',
        'doc': 'Word',
        'docx': 'Word',
        'xls': 'Excel',
        'xlsx': 'Excel',
        'ppt': 'PowerPoint',
        'pptx': 'PowerPoint',
        'zip': 'Archive',
        'rar': 'Archive',
        'tar': 'Archive',
        'gz': 'Archive',
        '7z': 'Archive',
    };

    return languageMap[ext] || 'Text';
};

/**
 * Get syntax highlighting language name
 */
export const getSyntaxLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
        'js': 'javascript',
        'jsx': 'jsx',
        'ts': 'typescript',
        'tsx': 'tsx',
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
        'scss': 'scss',
        'less': 'less',
        'json': 'json',
        'yaml': 'yaml',
        'yml': 'yaml',
        'md': 'markdown',
        'mdx': 'markdown',
        'sh': 'bash',
        'bash': 'bash',
        'sql': 'sql',
        'graphql': 'graphql',
        'xml': 'xml',
    };

    return languageMap[ext] || 'text';
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