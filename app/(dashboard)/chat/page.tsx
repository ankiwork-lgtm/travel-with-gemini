"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import Header from "@/components/layout/Header";
import DestinationForm, { DestinationFormValues } from "@/components/chat/DestinationForm";
import ChatWindow from "@/components/chat/ChatWindow";
import ChatInput from "@/components/chat/ChatInput";
import { Message } from "@/lib/firestore/conversation";

export default function ChatPage() {
  const { idToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [destination, setDestination] = useState<DestinationFormValues | null>(null);

  // Load history on mount
  useEffect(() => {
    if (!idToken) return;
    fetch("/api/history", {
      headers: { Authorization: `Bearer ${idToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.messages?.length) setMessages(data.messages);
      })
      .catch(() => {});
  }, [idToken]);

  const sendToGemini = async (values: DestinationFormValues, followUp?: string) => {
    if (!idToken) return;
    setIsLoading(true);

    const userMessage: Message = {
      role: "user",
      content: followUp || `Discover ${values.destination} — ${values.days} days, ${values.budget}, ${values.startDate} to ${values.endDate}`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ ...values, message: followUp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ ${errorMsg}`, timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscover = (values: DestinationFormValues) => {
    setDestination(values);
    setMessages([]);
    sendToGemini(values);
  };

  const handleFollowUp = (message: string) => {
    if (!destination) return;
    sendToGemini(destination, message);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header />
      <DestinationForm onSubmit={handleDiscover} isLoading={isLoading} />
      <ChatWindow messages={messages} isLoading={isLoading} />
      <ChatInput onSend={handleFollowUp} isLoading={isLoading} />
    </div>
  );
}
