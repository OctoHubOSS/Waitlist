import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import "github-markdown-css/github-markdown-dark.css";

// Add a style tag to override the markdown-body background
const overrideStyles = `
.markdown-body {
  background-color: transparent !important;
  max-width: none !important;
  width: 100% !important;
}
`;

interface MarkdownRendererProps {
  content: string;
}

export default function DocsContent({ content }: MarkdownRendererProps) {
  return (
    <>
      <style>{overrideStyles}</style>
      <div className="p-6 markdown-body w-full max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}
          components={{
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <SyntaxHighlighter
                  language={match[1]}
                  style={vscDarkPlus as any}
                  PreTag="div"
                  showLineNumbers
                  className="w-full max-w-none"
                >
                  {String(children).replace(/\n$/, "")}
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
                  target={props.href?.startsWith("http") ? "_blank" : undefined}
                  rel={
                    props.href?.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="text-github-link hover:underline"
                >
                  {props.children}
                </a>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </>
  );
}
