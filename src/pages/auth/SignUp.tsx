import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthButton from "../../components/auth/AuthButton";
import AuthCard from "../../components/auth/AuthCard";
import AuthInput from "../../components/auth/AuthInput";
import AuthUtils from "../../utils/authUtils";
import { authService } from "../../services/authService";

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Full name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    // backend-ul cere minim 8 caractere (StringLength MinimumLength = 8)
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const result = await authService.registerUser({
      fullName: fullName.trim(),
      username: email.trim(),   // username = email in backend
      password,
    });

    setLoading(false);

    if (!result.ok) {
      setError(result.message ?? "Registration failed");
      return;
    }

    // userul a fost creat in DB cu succes
    navigate("/signin", {
      state: { message: `Account created! Welcome, ${result.data.fullName}. Please sign in.` },
      replace: true,
    });
  };

  return (
    <AuthCard title="Sign up" titleColor="emerald">
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />

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
          placeholder="Create a strong password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          showPasswordToggle
          required
        />

        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          showPasswordToggle
          error={error}
          required
        />

        <AuthButton type="submit" loading={loading}>
          Sign up
        </AuthButton>

        <div className="text-center">
          <p className="m-0 text-xs leading-[1.5] text-gray-400">
            Already have an account?{" "}
            <Link to="/signin" className="font-semibold text-emerald-400 transition-colors duration-200 hover:text-emerald-300">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthCard>
  );
}

