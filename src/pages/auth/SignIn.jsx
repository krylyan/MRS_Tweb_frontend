import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthUtils from "../../utils/authUtils";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const successMessage = location.state?.message || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (AuthUtils.login(email, password)) {
      setLoading(false);
      if (AuthUtils.isQuestionnaireRequired()) {
        navigate("/questionnaire", { replace: true });
        return;
      }
      navigate("/home", { replace: true });
      return;
    }

    setLoading(false);
    setError("Invalid credentials. Test account: admin / admin");
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

      <AuthCard title="Sign in" titleColor="emerald">
        <form onSubmit={handleSubmit} className={error ? "auth-card-error" : ""}>
          {successMessage && (
            <p
              className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2"
              style={{ marginBottom: "16px" }}
            >
              {successMessage}
            </p>
          )}

          <p className="text-gray-400 text-xs" style={{ marginBottom: "16px", lineHeight: 1.5 }}>
            Test account: <span className="text-emerald-300 font-semibold">admin / admin</span>
          </p>

          <div style={{ marginBottom: "24px" }}>
            <AuthInput
              label="Email or Username"
              type="text"
              placeholder="admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error=""
              required
            />
          </div>

          <div style={{ marginBottom: error ? "16px" : "24px" }}>
            <AuthInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPasswordToggle={true}
              error={error}
              required
            />
          </div>

          <div style={{ marginBottom: "24px", textAlign: "center" }}>
            <Link
              to="#"
              className="text-xs text-gray-400 hover:text-emerald-400 transition-colors duration-200"
            >
              Forgot Password?
            </Link>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <AuthButton onClick={handleSubmit} loading={loading}>
              Login
            </AuthButton>
          </div>

          <div style={{ textAlign: "center" }}>
            <p className="text-gray-400 text-xs" style={{ margin: 0, lineHeight: 1.5 }}>
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors duration-200"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </AuthCard>
    </>
  );
}
