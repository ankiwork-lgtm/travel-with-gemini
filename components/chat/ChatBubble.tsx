import MarkdownRenderer from "./MarkdownRenderer";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBubble({ role, content }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <article
      aria-label={isUser ? "Your message" : "Assistant response"}
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          padding: "12px 16px",
          borderRadius: "12px",
          backgroundColor: isUser ? "#3b82d4" : "#f7f8fa",
          color: isUser ? "#ffffff" : "#1f2328",
          border: isUser ? "none" : "1px solid #e5e7eb",
          fontSize: "14px",
        }}
      >
        {isUser ? (
          <p style={{ margin: 0 }}>{content}</p>
        ) : (
          <MarkdownRenderer content={content} />
        )}
      </div>
    </article>
  );
}
