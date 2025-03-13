import { getFileIcon } from "../utils";
import FileActions from "./FileActions";

interface FileHeaderProps {
    selectedFile: any;
    fileContent: string | null;
    getFileLanguage: (filename: string) => string;
    formatSize: (size: number) => string;
    isImage: (name: string) => boolean;
    isMarkdown: (name: string) => boolean;
    backToDirectory: () => void;
}

const FileHeader = ({
    selectedFile,
    fileContent,
    getFileLanguage,
    formatSize,
    isImage,
    isMarkdown,
    backToDirectory
}: FileHeaderProps) => {
    return (
        <div className="border-b border-gray-700 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center">
                <div className="mr-3 p-2 rounded-full bg-github-dark-secondary">
                    {getFileIcon(selectedFile.name, isImage, isMarkdown)}
                </div>
                <div>
                    <h3 className="text-white font-medium text-lg">{selectedFile.name}</h3>
                    <div className="text-xs text-gray-400">
                        {getFileLanguage(selectedFile.name)} • {formatSize(selectedFile.size)}
                    </div>
                </div>
            </div>

            <FileActions
                fileContent={fileContent}
                selectedFile={selectedFile}
                backToDirectory={backToDirectory}
                isImage={isImage}
            />
        </div>
    );
};

export default FileHeader;