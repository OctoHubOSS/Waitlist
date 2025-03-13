import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { getSyntaxLanguage } from './utils/fileType';

interface CodeRendererProps {
    content: string;
    language: string;
}

const CodeRenderer = ({ content, language }: CodeRendererProps) => {
    return (
        <SyntaxHighlighter
            language={language}
            style={vscDarkPlus as any}
            className="bg-github-dark-secondary"
            customStyle={{
                margin: 0,
                padding: '1rem',
                borderRadius: 0
            }}
            showLineNumbers
        >
            {content}
        </SyntaxHighlighter>
    );
};

export default CodeRenderer;