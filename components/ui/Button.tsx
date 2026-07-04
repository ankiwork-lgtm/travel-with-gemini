import { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: ReactNode;
}

export default function Button({ loading, disabled, children, style, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "10px 20px",
        backgroundColor: "#3b82d4",
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        fontSize: "14px",
        fontWeight: 500,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        width: "100%",
        ...style,
      }}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}
