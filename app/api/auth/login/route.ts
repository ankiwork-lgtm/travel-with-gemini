import { NextResponse } from "next/server";

// Login is handled client-side via Firebase SDK (signInWithEmailAndPassword).
// This route exists as a placeholder for server-side session handling if needed.
export async function POST() {
  return NextResponse.json({ message: "Use Firebase client SDK to sign in" }, { status: 200 });
}
