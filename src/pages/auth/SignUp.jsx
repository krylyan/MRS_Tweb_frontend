import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";

/**
 * SignUp Page - Complete rebuild with strict 8px spacing grid
 * 
 * Spacing structure:
 * - Title to first input: 24px (from card)
 * - Label to input: 8px (in component)
 * - Input to next label: 24px
 * - Error to next label: 16px
 * - Input to button: 24px
 * - Button to link: 24px
 * 
 * All spacing uses 8px grid: 8px, 16px, 24px, 32px, 40px, 48px
 */
export default function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    setLoading(false);
    // After successful signup, redirect to signin
    navigate("/signin", {
      state: { message: "Account created successfully! Please sign in." },
      replace: true,
    });
  };

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .auth-card-error {
          animation: shake 0.5s cubic-bezier(0.36, 0, 0.66, -0.56);
        }
      `}</style>

      {/* Home Button - Top Left | Design System Navigation Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed z-50 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border-0 h-9 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg outline-none focus-visible:ring-3"
        style={{
          top: "24px",
          left: "24px",
        }}
      >
        <span>←</span>
        <span>Home</span>
      </button>

      <AuthCard title="Sign up" titleColor="emerald">
        <form onSubmit={handleSubmit} className={error ? "auth-card-error" : ""}>
          {/* Full Name Input */}
          <div style={{ marginBottom: "24px" }}>
            <AuthInput
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              error=""
              required
            />
          </div>

          {/* Email Input */}
          <div style={{ marginBottom: "24px" }}>
            <AuthInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error=""
              required
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: "24px" }}>
            <AuthInput
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPasswordToggle={true}
              error=""
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div style={{ marginBottom: error ? "16px" : "24px" }}>
            <AuthInput
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showPasswordToggle={true}
              error={error}
              required
            />
          </div>

          {/* Submit Button */}
          <div style={{ marginBottom: "24px" }}>
            <AuthButton onClick={handleSubmit} loading={loading}>
              Sign up
            </AuthButton>
          </div>

          {/* Sign In Link */}
          <div style={{ textAlign: "center" }}>
            <p className="text-gray-400 text-xs" style={{ margin: 0, lineHeight: 1.5 }}>
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </AuthCard>
    </>
  );
}
