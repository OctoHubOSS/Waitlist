const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-600 border-t-github-link"></div>
            <p className="mt-4 text-gray-400">Loading files...</p>
        </div>
    );
};

export default Loading;