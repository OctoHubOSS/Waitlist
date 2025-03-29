import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
// Use Prism instead of the default SyntaxHighlighter
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'github-markdown-css/github-markdown-dark.css';

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="p-6 bg-github-dark markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}
        components={{
          code: (props) => {
            const match = /language-(\w+)/.exec(props.className || '');
            if (match) {
              return (
                <SyntaxHighlighter
                  language={match[1]}
                  style={vscDarkPlus as any}
                  PreTag="div"
                  showLineNumbers
                >
                  {String(props.children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }
            return (
              <code className="bg-gray-800 rounded px-1 py-0.5 text-sm">
                {props.children}
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
};

export default MarkdownRenderer;
