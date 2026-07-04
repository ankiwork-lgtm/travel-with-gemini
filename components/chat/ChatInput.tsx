"use client";

import { useState, KeyboardEvent } from "react";
import Button from "@/components/ui/Button";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        padding: "12px 20px",
        borderTop: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
      }}
    >
      <input
        id="chat-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a follow-up question..."
        aria-label="Ask a follow-up question"
        disabled={isLoading}
        style={{
          flex: 1,
          padding: "8px 12px",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          fontSize: "14px",
          outline: "none",
        }}
      />
      <Button
        id="send-btn"
        onClick={handleSend}
        loading={isLoading}
        disabled={isLoading || !value.trim()}
        aria-label="Send message"
        style={{ width: "auto", padding: "8px 20px" }}
      >
        Send
      </Button>
    </div>
  );
}
