import { FaFolder } from "react-icons/fa";

const EmptyDirectory = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-800 p-5 rounded-full mb-6">
                <FaFolder className="text-4xl text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
                This folder is empty
            </h3>
            <p className="text-gray-400 max-w-md">
                There are no files or directories in this location
            </p>
        </div>
    );
};

export default EmptyDirectory;