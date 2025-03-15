import { createContext, useContext, ReactNode } from "react";
import { FileItem, Branch, FileExplorerContextType } from "@/types/repos";
import { formatBytes } from "../../../Shared/utils/formatters";
import {
  getFileLanguage,
  isMarkdown,
  isImage,
} from "../../../Shared/utils/filetype";

// Enhance with utility functions
const enhancedContext: FileExplorerContextType = {
  formatBytes,
  getFileLanguage,
  isMarkdown,
  isImage,
} as FileExplorerContextType;

export const FileExplorerContext =
  createContext<FileExplorerContextType>(enhancedContext);

export function useFileExplorer() {
  const context = useContext(FileExplorerContext);
  if (!context) {
    throw new Error(
      "useFileExplorer must be used within a FileExplorerProvider",
    );
  }
  return context;
}

interface FileExplorerProviderProps {
  children: ReactNode;
  value: Omit<
    FileExplorerContextType,
    "formatBytes" | "getFileLanguage" | "isMarkdown" | "isImage"
  >;
}

export function FileExplorerProvider({
  children,
  value,
}: FileExplorerProviderProps) {
  // Merge provided values with utility functions
  const enhancedValue = {
    ...value,
    formatBytes,
    getFileLanguage,
    isMarkdown,
    isImage,
  };

  return (
    <FileExplorerContext.Provider value={enhancedValue}>
      {children}
    </FileExplorerContext.Provider>
  );
}
