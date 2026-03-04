import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Utensils, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    "w-full bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-placeholder)] " +
    "border border-[var(--border-mid)] rounded-xl px-4 py-3 text-sm outline-none " +
    "focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] px-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Utensils className="w-8 h-8 text-orange-400" />
          <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            PlatePlan
          </span>
        </div>

        {/* Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Sign in to your PlatePlan account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputCls}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputCls + " pr-11"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-secondary)] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-2.5 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors mt-2"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-[var(--text-secondary)] mt-5">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
