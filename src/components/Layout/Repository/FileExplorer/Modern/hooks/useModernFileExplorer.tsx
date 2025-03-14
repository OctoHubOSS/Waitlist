import { createContext, useContext, ReactNode } from 'react';
import { FileItem, Branch, FileExplorerContextType } from "@/types/repos";
import { formatBytes } from '../utils/formatters';
import { getFileLanguage, isMarkdown, isImage } from '../utils/filetype';

// Create the context with a more specific type
const ModernFileExplorerContext = createContext<FileExplorerContextType | null>(null);

// Create a default context value
const defaultContextValue: Partial<FileExplorerContextType> = {
    formatBytes,
    getFileLanguage,
    isMarkdown,
    isImage,
    syntaxTheme: 'atomOneDark',
    setSyntaxTheme: () => { }
};

export function useModernFileExplorer(): FileExplorerContextType {
    const context = useContext(ModernFileExplorerContext);
    if (!context) {
        throw new Error('useModernFileExplorer must be used within a ModernFileExplorerProvider');
    }
    return context;
}

interface ModernFileExplorerProviderProps {
    children: ReactNode;
    value: Partial<FileExplorerContextType>;
}

export function ModernFileExplorerProvider({ children, value }: ModernFileExplorerProviderProps) {
    // Merge provided values with default/utility functions
    const enhancedValue = {
        ...defaultContextValue,
        ...value
    } as FileExplorerContextType;  // Cast the merged object to FileExplorerContextType

    return (
        <ModernFileExplorerContext.Provider value={enhancedValue}>
            {children}
        </ModernFileExplorerContext.Provider>
    );
}
