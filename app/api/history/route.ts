import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/auth/middleware";
import { getHistory } from "@/lib/firestore/conversation";

export async function GET(request: NextRequest) {
  let uid: string;
  try {
    uid = await verifyIdToken(request);
    console.log("[History] Auth verified — uid: %s", uid);
  } catch {
    console.warn("[History] Unauthorized request — missing or invalid token");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const messages = await getHistory(uid);
    console.log("[History] Returning %d message(s) for uid: %s", messages.length, uid);
    return NextResponse.json({ messages }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[History] Error — %s", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
