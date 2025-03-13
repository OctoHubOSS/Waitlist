import FileItem from "../FileItem";
import Loading from "./Loading";
import EmptyDirectory from "./EmptyDirectory";

interface DirectoryViewerProps {
    files: any[];
    navigateToPath: (path: string) => void;
    viewFile: (file: any) => void;
    isImage: (name: string) => boolean;
    isMarkdown: (name: string) => boolean;
    isLoading: boolean;
}

const DirectoryViewer = ({
    files,
    navigateToPath,
    viewFile,
    isImage,
    isMarkdown,
    isLoading
}: DirectoryViewerProps) => {
    if (isLoading) {
        return <Loading />;
    }

    if (!files || files.length === 0) {
        return <EmptyDirectory />;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left border-b border-gray-800">
                        <th className="pb-3 px-4 text-gray-400 font-medium">Name</th>
                        <th className="pb-3 px-4 text-gray-400 font-medium hidden md:table-cell">Size</th>
                        <th className="pb-3 px-4 text-gray-400 font-medium hidden lg:table-cell">Last commit</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Sort directories first, then files alphabetically */}
                    {[...files]
                        .sort((a, b) => {
                            if (a.type === "dir" && b.type !== "dir") return -1;
                            if (a.type !== "dir" && b.type === "dir") return 1;
                            return a.name.localeCompare(b.name);
                        })
                        .map(file => (
                            <FileItem
                                key={file.path}
                                file={file}
                                onClick={() => file.type === "dir" ? navigateToPath(file.path) : viewFile(file)}
                                isImage={isImage}
                                isMarkdown={isMarkdown}
                            />
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default DirectoryViewer;