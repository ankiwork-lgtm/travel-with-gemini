import fs from "fs";
import path from "path";
import { geminiModel } from "./client";
import { Message } from "@/lib/firestore/conversation";

export interface ChatRequest {
  destination: string;
  budget: string;
  days: string;
  startDate: string;
  endDate: string;
  message?: string;
}

const promptCache = new Map<string, string>();

export function loadPrompt(filename: string): string {
  if (promptCache.has(filename)) return promptCache.get(filename)!;
  const text = fs.readFileSync(path.join(process.cwd(), "prompts", filename), "utf-8");
  promptCache.set(filename, text);
  return text;
}

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export function buildPrompt(req: ChatRequest, history: Message[]): string {
  const systemPrompt = loadPrompt("system_prompt.md");
  const destinationPrompt = fillTemplate(loadPrompt("destination_prompt.md"), {
    destination: req.destination,
    budget: req.budget,
    days: req.days,
    startDate: req.startDate,
    endDate: req.endDate,
  });

  const historyContext =
    history.length > 0
      ? "\n\n## Conversation History\n" +
        history
          .map((m) => `**${m.role === "user" ? "User" : "Assistant"}:** ${m.content}`)
          .join("\n\n")
      : "";

  const currentMessage = req.message
    ? `\n\n## Follow-up Question\n${req.message}`
    : "";

  return `${systemPrompt}\n\n${destinationPrompt}${historyContext}${currentMessage}`;
}

export async function callGemini(prompt: string): Promise<string> {
  console.log("[Gemini] Sending request to gemini-2.5-flash (prompt length: %d chars)", prompt.length);
  const start = Date.now();
  const result = await geminiModel.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  console.log("[Gemini] Response received in %dms (response length: %d chars)", Date.now() - start, text.length);
  return text;
}
