import { getAdminAuth } from "@/lib/firebase/admin";

export async function verifyIdToken(request: Request): Promise<string> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }
  const token = authHeader.split("Bearer ")[1];
  const decoded = await getAdminAuth().verifyIdToken(token);
  return decoded.uid;
}
