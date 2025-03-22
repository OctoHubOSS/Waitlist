import React from 'react';

interface CodeProps {
  children: React.ReactNode;
  className?: string;
}

export const Code: React.FC<CodeProps> = ({ children, className = '' }) => {
  return (
    <code
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        backgroundColor: '#0d1117',
        color: '#c9d1d9',
        padding: '0.2em 0.4em',
        fontSize: '85%',
        borderRadius: '3px',
        border: '1px solid #30363d',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        display: 'inline-block',
      }}
      className={className}
    >
      {children}
    </code>
  );
};

export default Code;