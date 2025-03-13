interface ImageRendererProps {
    url: string;
    name: string;
}

const ImageRenderer = ({ url, name }: ImageRendererProps) => {
    return (
        <div className="flex justify-center">
            <img
                src={url}
                alt={name}
                className="max-w-full max-h-[500px] object-contain rounded-lg shadow-xl"
            />
        </div>
    );
};

export default ImageRenderer;