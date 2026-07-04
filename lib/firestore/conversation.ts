import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export async function saveMessage(uid: string, message: Message): Promise<void> {
  await getAdminDb().collection("conversation_memory").doc(uid).update({
    messages: FieldValue.arrayUnion(message),
  });
}

export async function saveMessages(uid: string, messages: Message[]): Promise<void> {
  await getAdminDb().collection("conversation_memory").doc(uid).update({
    messages: FieldValue.arrayUnion(...messages),
  });
}

export async function getHistory(uid: string, limit = 10): Promise<Message[]> {
  const doc = await getAdminDb().collection("conversation_memory").doc(uid).get();
  if (!doc.exists) return [];
  const messages = (doc.data()?.messages as Message[]) || [];
  return messages.length > limit ? messages.slice(-limit) : messages;
}

export async function initConversation(uid: string): Promise<void> {
  // merge:true is idempotent — no prior read needed; only sets fields that don't exist
  await getAdminDb()
    .collection("conversation_memory")
    .doc(uid)
    .set({ uid, messages: [] }, { merge: true });
}
