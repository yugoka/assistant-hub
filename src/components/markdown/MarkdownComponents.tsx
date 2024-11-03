import { Components } from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import atomonedark from "react-syntax-highlighter/dist/cjs/styles/prism/a11y-dark";

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

  // Code blocks
  code: ({ node, ref, className, children, style, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    return (
      <SyntaxHighlighter
        {...props}
        style={atomonedark}
        language={match ? match[1] : "language-plaintext"}
        PreTag="div"
        className="my-3 overflow-x-auto rounded-lg w-full"
        children={String(children).replace(/\n$/, "")}
      />
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
