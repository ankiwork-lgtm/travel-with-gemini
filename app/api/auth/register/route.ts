import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      console.warn("[Register] Missing email or password in request body");
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    console.log("[Register] Creating user — email: %s", email);
    const userRecord = await adminAuth.createUser({ email, password });
    const uid = userRecord.uid;
    console.log("[Register] Firebase Auth user created — uid: %s", uid);

    await adminDb.collection("users").doc(uid).set({
      uid,
      email,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log("[Register] Firestore users doc created — uid: %s", uid);

    await adminDb.collection("conversation_memory").doc(uid).set({
      uid,
      messages: [],
    });
    console.log("[Register] Firestore conversation_memory doc created — uid: %s", uid);

    return NextResponse.json({ uid, email }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    console.error("[Register] Error — %s", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
