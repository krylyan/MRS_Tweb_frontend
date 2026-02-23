import React from "react";

/**
 * AuthCard - Glass morphism card for authentication forms
 * Strict 8px spacing grid with 32px internal padding
 * 
 * Layout:
 * - Viewport-filling gradient background
 * - Centered vertically and horizontally
 * - Fixed-width card container (max 440px)
 * - Responsive on mobile (100% width with padding)
 * 
 * Spacing uses strict 8px grid:
 * 8px, 16px, 24px, 32px, 40px, 48px
 */
export default function AuthCard({ children, title, titleColor = "white" }) {
  const titleColorClass = titleColor === "emerald" ? "text-emerald-400" : "text-white";
  
  return (
    <>
      <style>{`
        @keyframes authCardEnter {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .auth-card {
          animation: authCardEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Full viewport background with gradient */}
      <div className="auth-page bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6">
        {/* Centered card container with fixed max-width */}
        <div className="auth-card w-full" style={{ maxWidth: "440px" }}>
          {/* Glassmorphic card with design tokens */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-shadow duration-300" style={{ padding: "32px" }}>
            {/* Header - Title separated from content */}
            <div style={{ marginBottom: "24px" }}>
              <h1 className={`text-2xl font-bold ${titleColorClass}`}>
                {title}
              </h1>
            </div>

            {/* Form content */}
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
