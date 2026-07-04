"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: "60px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <h1 style={{ fontSize: "18px", fontWeight: 600, color: "#1f2328" }}>
        AI Destination Discovery
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {user && (
          <span style={{ fontSize: "13px", color: "#57606a" }}>{user.email}</span>
        )}
        <button
          id="logout-btn"
          onClick={handleLogout}
          aria-label="Log out"
          style={{
            padding: "6px 14px",
            fontSize: "13px",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            background: "#fff",
            cursor: "pointer",
            color: "#1f2328",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
