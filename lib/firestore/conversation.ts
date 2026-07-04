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

export async function getHistory(uid: string): Promise<Message[]> {
  const doc = await getAdminDb().collection("conversation_memory").doc(uid).get();
  if (!doc.exists) return [];
  return (doc.data()?.messages as Message[]) || [];
}

export async function initConversation(uid: string): Promise<void> {
  const ref = getAdminDb().collection("conversation_memory").doc(uid);
  const doc = await ref.get();
  if (!doc.exists) {
    await ref.set({ uid, messages: [] });
  }
}
