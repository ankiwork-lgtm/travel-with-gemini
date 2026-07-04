import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

const components: Components = {
  h1: ({ children }) => (
    <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "16px 0 8px" }}>{children}</h2>
  ),
  h2: ({ children }) => (
    <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "14px 0 6px" }}>{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 style={{ fontSize: "15px", fontWeight: 600, margin: "12px 0 4px" }}>{children}</h4>
  ),
  p: ({ children }) => <p style={{ margin: "6px 0" }}>{children}</p>,
  ul: ({ children }) => (
    <ul style={{ paddingLeft: "20px", margin: "6px 0", listStyleType: "disc" }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ paddingLeft: "20px", margin: "6px 0", listStyleType: "decimal" }}>{children}</ol>
  ),
  li: ({ children }) => <li style={{ margin: "2px 0" }}>{children}</li>,
  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
  code: ({ children }) => (
    <code
      style={{
        backgroundColor: "#e5e7eb",
        padding: "1px 4px",
        borderRadius: "3px",
        fontSize: "13px",
        fontFamily: "ui-monospace, monospace",
      }}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre
      style={{
        backgroundColor: "#f7f8fa",
        border: "1px solid #e5e7eb",
        borderRadius: "6px",
        padding: "12px",
        overflowX: "auto",
        fontSize: "13px",
        fontFamily: "ui-monospace, monospace",
        margin: "8px 0",
      }}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: "3px solid #3b82d4",
        paddingLeft: "12px",
        color: "#57606a",
        margin: "8px 0",
      }}
    >
      {children}
    </blockquote>
  ),
  hr: () => <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "12px 0" }} />,
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div style={{ lineHeight: 1.7, fontSize: "14px" }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
