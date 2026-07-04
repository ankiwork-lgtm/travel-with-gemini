import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
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
          Create Account
        </h1>
        <RegisterForm />
      </div>
    </main>
  );
}

export const metadata = { title: "Register" };
