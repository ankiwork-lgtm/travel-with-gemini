interface SpinnerProps {
  size?: number;
}

export default function Spinner({ size = 24 }: SpinnerProps) {
  return (
    <svg
      aria-label="Loading"
      role="status"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "spin 0.75s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#e5e7eb"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#3b82d4"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
