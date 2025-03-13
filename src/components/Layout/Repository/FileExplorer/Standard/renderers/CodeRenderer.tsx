import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useFileExplorer } from '../hooks/useFileExplorer';

interface CodeRendererProps {
    content: string;
    filename: string;
}

export default function CodeRenderer({ content, filename }: CodeRendererProps) {
    const { getFileLanguage } = useFileExplorer();

    return (
        <div className="overflow-x-auto">
            <SyntaxHighlighter
                language={getFileLanguage(filename)}
                style={atomOneDark}
                customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    background: '#0d1117',
                    borderRadius: 0
                }}
                showLineNumbers
            >
                {content}
            </SyntaxHighlighter>
        </div>
    );
}