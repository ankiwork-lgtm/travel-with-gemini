import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f7f8fa",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "40px",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "24px", textAlign: "center" }}>
          Sign In
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}

export const metadata = { title: "Login" };
