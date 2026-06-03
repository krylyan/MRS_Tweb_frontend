import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthButton from "../../components/auth/AuthButton";
import AuthInput from "../../components/auth/AuthInput";
import AuthUtils, { type SessionData } from "../../utils/authUtils";
import { authService } from "../../services/authService";

interface SignInLocationState {
  message?: string;
}

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SignInLocationState | null;
  const successMessage = state?.message ?? "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Redirect automat dacă userul e deja logat
  useEffect(() => {
    if (AuthUtils.isAuthenticated()) {
      navigate("/home", { replace: true });
      return;
    }
    const frame = requestAnimationFrame(() => setIsLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await authService.loginUser({
      username: email.trim(),
      password,
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.message ?? "Login failed");
      return;
    }

    // Salveaza sesiunea completa (userId, fullName, role, token) in sessionStorage
    const session: SessionData = {
      userId:   result.data.userId,
      fullName: result.data.fullName,
      role:     result.data.role as SessionData["role"],
      token:    result.data.token,
    };
    AuthUtils.setSession(session);

    navigate("/home", { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
      <div
        className={`w-full max-w-[1080px] rounded-[18px] border border-white/12 bg-white/4 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-[8px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isLoaded ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.98] opacity-0"
        }`}
      >
        <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
          <section className="relative hidden min-h-[620px] overflow-hidden rounded-[14px] border border-white/10 bg-slate-900 lg:block">
            <img
              src="https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=1400&q=80"
              alt="Healthy fitness and nutrition lifestyle"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(37,99,235,0.22)_0%,rgba(15,23,42,0.28)_40%,rgba(15,23,42,0.82)_100%)]" />
            <div className="absolute left-[18px] top-[18px] text-[32px] font-bold leading-none tracking-[0.4px] text-white">
              FitLife
            </div>
            <div className="absolute bottom-[72px] left-[22px] right-[22px] text-[44px] font-medium leading-[1.06] text-white">
              Build strength, fuel results
            </div>
            <div className="absolute bottom-6 left-[22px] flex gap-[10px]" aria-hidden="true">
              <span className="inline-block h-1 w-7 rounded-full bg-white/45" />
              <span className="inline-block h-1 w-7 rounded-full bg-emerald-500/95" />
              <span className="inline-block h-1 w-7 rounded-full bg-white/45" />
            </div>
          </section>

          <section className="rounded-[14px] border border-white/8 bg-white/[0.02] px-6 py-7 lg:px-[34px] lg:py-[30px]">
            <div className="mb-[10px]">
              <h1 className="text-5xl font-semibold text-white">Sign in</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {successMessage ? (
                <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                  {successMessage}
                </p>
              ) : null}

              <AuthInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <AuthInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                showPasswordToggle
                error={error}
                required
              />

              <div className="text-center">
                <Link to="#" className="text-xs text-gray-400 transition-colors duration-200 hover:text-emerald-400">
                  Forgot Password?
                </Link>
              </div>

              <AuthButton type="submit" loading={loading}>
                Login
              </AuthButton>

              <div className="text-center">
                <p className="text-sm text-gray-300">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="text-emerald-300 transition-colors hover:text-emerald-200">
                    Sign up here
                  </Link>
                </p>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

