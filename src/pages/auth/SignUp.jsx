import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthUtils from "../../utils/authUtils";

export default function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (AuthUtils.isAuthenticated()) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
    await new Promise((resolve) => setTimeout(resolve, 300));

    const result = AuthUtils.register(email, password, fullName);
    setLoading(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

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

      <AuthCard title="Sign up" titleColor="emerald">
        <form onSubmit={handleSubmit} className={error ? "auth-card-error" : ""}>
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

          <div style={{ marginBottom: "24px" }}>
            <AuthButton onClick={handleSubmit} loading={loading}>
              Sign up
            </AuthButton>
          </div>

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
