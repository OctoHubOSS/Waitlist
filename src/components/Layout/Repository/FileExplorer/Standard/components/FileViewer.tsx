import { useFileExplorer } from "../hooks/useFileExplorer";
import { FaFileAlt, FaCode, FaDownload } from "react-icons/fa";
import { GoFileCode } from "react-icons/go";
import ImageRenderer from "../../../Shared/renderers/ImageRenderer";
import MarkdownRenderer from "../renderers/MarkdownRenderer";
import CodeRenderer from "../renderers/CodeRenderer";

export default function FileViewer() {
  const {
    selectedFile,
    fileContent,
    fileViewLoading,
    fileViewError,
    formatBytes,
    isImage,
    isMarkdown,
  } = useFileExplorer();

  if (!selectedFile) return null;

  return (
    <div>
      <div className="bg-github-dark rounded-t-md p-4 border border-github-border flex justify-between items-center">
        <div className="flex items-center">
          {isImage(selectedFile.name) ? (
            <FaFileAlt className="h-5 w-5 text-purple-400 mr-2" />
          ) : isMarkdown(selectedFile.name) ? (
            <GoFileCode className="h-5 w-5 text-blue-400 mr-2" />
          ) : (
            <FaCode className="h-5 w-5 text-yellow-400 mr-2" />
          )}
          <span className="text-github-text font-medium">
            {selectedFile.name}
          </span>
          <span className="ml-3 text-xs text-github-text-secondary">
            {formatBytes(selectedFile.size)}
          </span>
        </div>

        {selectedFile.download_url && (
          <a
            href={selectedFile.download_url}
            download={selectedFile.name}
            className="flex items-center text-xs text-github-text-secondary hover:text-github-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaDownload className="h-3 w-3 mr-1" />
            Download
          </a>
        )}
      </div>

      <div className="border border-t-0 border-github-border rounded-b-md overflow-hidden">
        {fileViewLoading ? (
          <div className="animate-pulse p-6 bg-github-dark-secondary">
            <div className="h-4 bg-github-border rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-github-border rounded w-1/2 mb-3"></div>
            <div className="h-4 bg-github-border rounded w-5/6 mb-3"></div>
            <div className="h-4 bg-github-border rounded w-2/3"></div>
          </div>
        ) : fileViewError ? (
          <div className="bg-red-900/20 p-6 text-red-400">{fileViewError}</div>
        ) : fileContent ? (
          isImage(selectedFile.name) ? (
            <ImageRenderer
              src={selectedFile.download_url as string}
              alt={selectedFile.name}
            />
          ) : isMarkdown(selectedFile.name) ? (
            <MarkdownRenderer content={fileContent} />
          ) : (
            <CodeRenderer content={fileContent} filename={selectedFile.name} />
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
