import SyntaxHighlighter from 'react-syntax-highlighter';
import { useModernFileExplorer } from '../hooks/useModernFileExplorer';
import { useState, useEffect } from 'react';

// Import available themes individually for better compatibility
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { nord } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ModernCodeRendererProps {
    content: string;
    filename: string;
}

export default function ModernCodeRenderer({ content, filename }: ModernCodeRendererProps) {
    const { getFileLanguage, syntaxTheme = 'atomOneDark' } = useModernFileExplorer();

    // Map theme IDs to the actual theme objects
    const themeMap: Record<string, any> = {
        atomOneDark,
        atomOneLight,
        dracula,
        github,
        monokai,
        nord,
        vs,
        vscDarkPlus
    };

    // Get the selected theme or fall back to atomOneDark
    const selectedTheme = themeMap[syntaxTheme] || atomOneDark;

    // Adjust background color based on theme (light vs dark)
    const isDarkTheme = ['atomOneDark', 'dracula', 'monokai', 'nord', 'vscDarkPlus'].includes(syntaxTheme);
    const backgroundColor = isDarkTheme ? '#0d1117' : '#ffffff';
    const lineNumberColor = isDarkTheme ? { opacity: 0.5 } : { opacity: 0.5, color: '#333' };

    console.log("Rendering with theme:", syntaxTheme);

    return (
        <div className="overflow-x-auto">
            <SyntaxHighlighter
                language={getFileLanguage(filename)}
                style={selectedTheme}
                customStyle={{
                    margin: 0,
                    padding: '1.5rem',
                    background: backgroundColor,
                    borderRadius: 0
                }}
                showLineNumbers
                lineNumberStyle={lineNumberColor}
            >
                {content}
            </SyntaxHighlighter>
        </div>
    );
}
