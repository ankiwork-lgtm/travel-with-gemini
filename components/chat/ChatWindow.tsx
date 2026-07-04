"use client";

import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import Spinner from "@/components/ui/Spinner";
import { Message } from "@/lib/firestore/conversation";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <section
      role="region"
      aria-live="polite"
      aria-label="Chat messages"
      aria-busy={isLoading}
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {messages.length === 0 && !isLoading && (
        <p style={{ textAlign: "center", color: "#57606a", marginTop: "40px", fontSize: "14px" }}>
          Enter a destination above and click <strong>Discover</strong> to get started.
        </p>
      )}
      {messages.map((msg, i) => (
        <ChatBubble key={i} role={msg.role} content={msg.content} />
      ))}
      {isLoading && (
        <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "12px" }}>
          <Spinner size={24} />
        </div>
      )}
      <div ref={bottomRef} />
    </section>
  );
}
