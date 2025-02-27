import React, { useState } from "react";
import { ClipboardCheck, Clipboard } from "lucide-react";
import { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import syntaxHighlighterStyle from "react-syntax-highlighter/dist/cjs/styles/prism/material-dark";
import { Button } from "../ui/button";

export const MarkdownComponents: Components = {
  // Headers
  h1: ({ children }) => <h1 className="text-xl font-bold my-4">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-bold my-3">{children}</h2>,
  h3: ({ children }) => (
    <h3 className="text-base font-bold my-2">{children}</h3>
  ),

  // Paragraphs and text
  p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,

  // Lists
  ul: ({ children }) => (
    <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>
  ),

  // Code blocks with language display and copy button
  code: ({ node, ref, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    // inline code
    if (!match) {
      return (
        <code className="px-1.5 py-0.5 mx-0.5 rounded-sm bg-gray-200 dark:bg-gray-700 font-mono text-sm">
          {children}
        </code>
      );
    }

    const language = match[1];
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
    };
    return (
      <div className="my-3 relative rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
        <div className="flex justify-between items-center px-2  bg-gray-200 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-400">
          <span className="text-xs">{language}</span>
          <Button
            variant="ghost"
            onClick={handleCopy}
            className="p-1 text-xs h-8"
          >
            {isCopied ? (
              <ClipboardCheck className="w-4 h-4" />
            ) : (
              <Clipboard className="w-4 h-4" />
            )}
            {isCopied ? "Copied!" : "Copy"}
          </Button>
        </div>
        <SyntaxHighlighter
          {...props}
          style={syntaxHighlighterStyle}
          language={language}
          PreTag="div"
          className="overflow-x-auto rounded-b-lg p-0"
          customStyle={{ margin: 0 }}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  },

  // Links
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-blue-500 dark:text-blue-400 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),

  // Blockquotes
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 italic">
      {children}
    </blockquote>
  ),

  // Tables
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-3 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
      {children}
    </td>
  ),
};
