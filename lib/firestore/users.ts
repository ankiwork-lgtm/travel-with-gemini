import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export interface UserDocument {
  uid: string;
  email: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export async function createUser(uid: string, email: string): Promise<void> {
  await getAdminDb().collection("users").doc(uid).set({
    uid,
    email,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function getUser(uid: string): Promise<UserDocument | null> {
  const doc = await getAdminDb().collection("users").doc(uid).get();
  if (!doc.exists) return null;
  return doc.data() as UserDocument;
}
