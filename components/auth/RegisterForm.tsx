"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/chat");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Input
        id="register-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        aria-label="Email"
      />
      <Input
        id="register-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        aria-label="Password"
      />
      {error && (
        <p role="alert" id="register-error" style={{ color: "#dc2626", fontSize: "14px" }}>
          {error}
        </p>
      )}
      <Button id="register-submit" type="submit" loading={loading}>
        Create Account
      </Button>
      <p style={{ textAlign: "center", fontSize: "14px", color: "#57606a" }}>
        Already have an account?{" "}
        <Link id="login-link" href="/login" style={{ color: "#3b82d4" }}>
          Sign In
        </Link>
      </p>
    </form>
  );
}
