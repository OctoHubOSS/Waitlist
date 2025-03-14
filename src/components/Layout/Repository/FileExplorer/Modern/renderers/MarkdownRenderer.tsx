import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useModernFileExplorer } from '../hooks/useModernFileExplorer';
import 'github-markdown-css/github-markdown-dark.css';

interface ModernMarkdownRendererProps {
    content: string;
}

export default function ModernMarkdownRenderer({ content }: ModernMarkdownRendererProps) {
    const { syntaxTheme = 'atomOneDark' } = useModernFileExplorer();

    return (
        <div className="p-6 bg-github-dark markdown-body">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}
                components={{
                    code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                            <SyntaxHighlighter
                                language={match[1]}
                                style={vscDarkPlus}
                                PreTag="div"
                                showLineNumbers
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                    a(props) {
                        return (
                            <a
                                href={props.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-github-link hover:underline"
                            >
                                {props.children}
                            </a>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
