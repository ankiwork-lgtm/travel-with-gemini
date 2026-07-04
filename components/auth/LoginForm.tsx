"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function LoginForm() {
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
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/chat");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Input
        id="login-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        aria-label="Email"
      />
      <Input
        id="login-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        aria-label="Password"
      />
      {error && (
        <p role="alert" id="login-error" style={{ color: "#dc2626", fontSize: "14px" }}>
          {error}
        </p>
      )}
      <Button id="login-submit" type="submit" loading={loading}>
        Sign In
      </Button>
      <p style={{ textAlign: "center", fontSize: "14px", color: "#57606a" }}>
        Don&apos;t have an account?{" "}
        <Link id="register-link" href="/register" style={{ color: "#3b82d4" }}>
          Register
        </Link>
      </p>
    </form>
  );
}
