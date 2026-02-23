import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * AuthInput - Input field with 8px grid spacing and proper proportions
 * Strict spacing grid: 8px, 16px, 24px, 32px, 40px, 48px
 * 
 * Spacing within component:
 * - Label to input: 8px
 * - Input to error: 8px
 * - Error cannot be modified by component (parent handles 16px to next element)
 */
export default function AuthInput({
  label,
  type = "text",
  placeholder,
  icon: Icon,
  value,
  onChange,
  error,
  showPasswordToggle = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle && showPassword ? "text" : type;

  return (
    <>
      <style>{`
        @keyframes inputFocus {
          from {
            border-color: rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
          to {
            border-color: rgba(16, 185, 129, 0.5);
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
          }
        }
        .auth-input:focus {
          outline: none;
          animation: inputFocus 0.3s ease-out forwards;
        }
        .auth-input {
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          height: 48px;
        }
        .auth-input::placeholder {
          color: rgba(156, 163, 175, 0.7);
          font-weight: 400;
        }
      `}</style>
      
      <div>
        {label && (
          <label className="block text-xs font-semibold text-gray-300" style={{ marginBottom: "8px" }}>
            {label}
          </label>
        )}
        <div className="relative">
          {/* Input field with 48px height minimum and consistent padding */}
          <input
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`auth-input w-full bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm font-medium transition-all duration-300 focus:border-emerald-500/50 focus:shadow-[0_0_20px_rgba(16,185,129,0.2)] ${
              error
                ? "border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                : ""
            }`}
            style={{ padding: "12px 16px" }}
            {...props}
          />

          {/* Password toggle icon - properly centered and positioned */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 flex items-center justify-center"
              tabIndex="-1"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Error message - white/light tone, never black */}
        {error && (
          <p className="text-white text-xs" style={{ marginTop: "8px", opacity: 0.9 }}>
            {error}
          </p>
        )}
      </div>
    </>
  );
}
