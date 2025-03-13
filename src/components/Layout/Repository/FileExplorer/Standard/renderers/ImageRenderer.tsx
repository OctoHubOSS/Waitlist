interface ImageRendererProps {
    url: string;
    name: string;
}

export default function ImageRenderer({ url, name }: ImageRendererProps) {
    return (
        <div className="p-4 bg-github-dark flex justify-center">
            <img
                src={url}
                alt={name}
                className="max-w-full max-h-[600px] object-contain"
            />
        </div>
    );
}