import { FaFolder } from "react-icons/fa";
import { getFileIcon } from "./utils/icons";
import { formatSize } from "./utils/formatting";

interface FileItemProps {
    file: any;
    onClick: () => void;
    isImage: (name: string) => boolean;
    isMarkdown: (name: string) => boolean;
}

/**
 * File item for the modern explorer table view
 */
const FileItem = ({ file, onClick, isImage, isMarkdown }: FileItemProps) => {
    return (
        <tr
            onClick={onClick}
            className="hover:bg-gray-800 cursor-pointer transition-colors border-b border-gray-800/50"
        >
            <td className="py-3 px-4">
                <div className="flex items-center">
                    {file.type === "dir" ? (
                        <FaFolder className="mr-3 text-yellow-500" />
                    ) : (
                        <span className="mr-3">{getFileIcon(file.name, isImage, isMarkdown)}</span>
                    )}
                    <span className={`${file.type === "dir" ? "text-white font-medium" : "text-gray-300"}`}>
                        {file.name}
                    </span>
                </div>
            </td>
            <td className="py-3 px-4 text-gray-400 text-sm hidden md:table-cell">
                {file.type === "dir" ? "—" : formatSize(file.size)}
            </td>
            <td className="py-3 px-4 text-gray-400 text-sm hidden lg:table-cell">
                {formatDate(file.last_commit)}
            </td>
        </tr>
    );
};

export default FileItem;