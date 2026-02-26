import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
        .auth-card-error {
          animation: shake 0.5s cubic-bezier(0.36, 0, 0.66, -0.56);
        }
        .signin-shell {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: linear-gradient(135deg, #111827 0%, #1f2937 55%, #0f172a 100%);
        }
        .signin-card {
          width: 100%;
          max-width: 1080px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(8px);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
          padding: 16px;
          animation: authCardEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .signin-grid {
          display: grid;
          grid-template-columns: 1fr 0.95fr;
          gap: 16px;
        }
        .signin-visual {
          position: relative;
          min-height: 620px;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0f172a;
        }
        .signin-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .signin-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(37, 99, 235, 0.22) 0%, rgba(15, 23, 42, 0.28) 40%, rgba(15, 23, 42, 0.82) 100%);
        }
        .signin-brand {
          position: absolute;
          top: 18px;
          left: 18px;
          font-size: 32px;
          line-height: 1;
          font-weight: 700;
          letter-spacing: 0.4px;
          color: #ffffff;
        }
        .signin-quote {
          position: absolute;
          left: 22px;
          right: 22px;
          bottom: 72px;
          color: #ffffff;
          font-size: 44px;
          line-height: 1.06;
          font-weight: 500;
        }
        .signin-indicators {
          position: absolute;
          left: 22px;
          bottom: 24px;
          display: flex;
          gap: 10px;
        }
        .signin-indicators span {
          display: inline-block;
          width: 28px;
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.45);
        }
        .signin-indicators span.active {
          background: rgba(16, 185, 129, 0.95);
        }
        .signin-form-wrap {
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 34px 34px 30px;
        }
        @media (max-width: 1024px) {
          .signin-grid {
            grid-template-columns: 1fr;
          }
          .signin-visual {
            display: none;
          }
          .signin-form-wrap {
            padding: 28px 24px 24px;
          }
          .signin-shell {
            padding: 16px;
          }
        }
      `}</style>

      <main className="signin-shell">
        <div className="signin-card">
          <div className="signin-grid">
            <section className="signin-visual">
              <img
                src="https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1400&q=80"
                alt="Healthy fitness and nutrition lifestyle"
              />
              <div className="signin-overlay" />
              <div className="signin-brand">FitLife</div>

              <div className="signin-quote">Build strength, fuel results</div>
              <div className="signin-indicators" aria-hidden="true">
                <span />
                <span className="active" />
                <span />
              </div>
            </section>

            <section className="signin-form-wrap">
              <div style={{ marginBottom: "10px" }}>
                <h1 className="text-5xl font-semibold text-white">Sign in</h1>
              </div>

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
                  <p className="text-gray-300 text-sm">
                    Don&apos;t have an account?{" "}
                    <Link to="/signup" className="text-emerald-300 hover:text-emerald-200 transition-colors">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
