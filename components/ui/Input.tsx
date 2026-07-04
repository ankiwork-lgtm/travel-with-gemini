import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, ...props }, ref) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {label && (
          <label htmlFor={id} style={{ fontSize: "14px", fontWeight: 500, color: "#1f2328" }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          style={{
            padding: "8px 12px",
            border: `1px solid ${error ? "#dc2626" : "#e5e7eb"}`,
            borderRadius: "6px",
            fontSize: "14px",
            width: "100%",
          }}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} role="alert" style={{ fontSize: "12px", color: "#dc2626" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
