import type { MouseEventHandler, ReactNode } from "react";

interface AuthButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function AuthButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = "submit",
}: AuthButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r from-emerald-500 to-blue-500 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-blue-600 hover:shadow-xl disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50"
    >
      {loading ? (
        <>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

