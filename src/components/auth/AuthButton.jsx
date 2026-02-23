import React from "react";

/**
 * AuthButton - Primary CTA button with gradient and hover effects
 * Strict 8px spacing grid
 * Height: 48px
 */
export default function AuthButton({ children, onClick, disabled, loading }) {
  return (
    <>
      <style>{`
        @keyframes buttonHover {
          from {
            transform: scale(1);
            box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
          }
          to {
            transform: scale(1.02);
            box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.4);
          }
        }
        @keyframes buttonActive {
          from {
            transform: scale(1.02);
          }
          to {
            transform: scale(0.98);
          }
        }
        .auth-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 48px;
        }
        .auth-btn:hover:not(:disabled) {
          animation: buttonHover 0.3s ease-out forwards;
        }
        .auth-btn:active:not(:disabled) {
          animation: buttonActive 0.1s ease-out forwards;
        }
      `}</style>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className="auth-btn w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all duration-300 border-0 flex items-center justify-center"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    </>
  );
}
