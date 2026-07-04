import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/auth/middleware";
import { getHistory, saveMessage, initConversation } from "@/lib/firestore/conversation";
import { buildPrompt, callGemini, ChatRequest } from "@/lib/gemini/generate";

export async function POST(request: NextRequest) {
  let uid: string;
  try {
    uid = await verifyIdToken(request);
    console.log("[Chat] Auth verified — uid: %s", uid);
  } catch {
    console.warn("[Chat] Unauthorized request — missing or invalid token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: ChatRequest = await request.json();
    console.log("[Chat] Request — destination: %s | budget: %s | days: %s | startDate: %s | endDate: %s | message: %s",
      body.destination, body.budget, body.days, body.startDate, body.endDate, body.message ?? "(none)");

    await initConversation(uid);
    console.log("[Chat] Conversation initialised for uid: %s", uid);

    const history = await getHistory(uid);
    console.log("[Chat] History loaded — %d message(s)", history.length);

    const prompt = buildPrompt(body, history);
    console.log("[Chat] Prompt built (%d chars) — calling Gemini...", prompt.length);

    const responseText = await callGemini(prompt);

    const now = Date.now();
    await saveMessage(uid, {
      role: "user",
      content: body.message || `Discover ${body.destination}`,
      timestamp: now,
    });
    await saveMessage(uid, {
      role: "assistant",
      content: responseText,
      timestamp: now + 1,
    });
    console.log("[Chat] Messages saved to Firestore for uid: %s", uid);

    return NextResponse.json({ response: responseText }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[Chat] Error — %s", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
