interface ModernImageRendererProps {
    url: string;
    name: string;
}

export default function ModernImageRenderer({ url, name }: ModernImageRendererProps) {
    return (
        <div className="p-6 bg-github-dark flex justify-center">
            <img
                src={url}
                alt={name}
                className="max-w-full max-h-[600px] object-contain rounded-lg shadow-md"
            />
        </div>
    );
}
