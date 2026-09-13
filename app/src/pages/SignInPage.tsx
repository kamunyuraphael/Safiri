import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthCarousel } from "@/components/common/AuthCarousel";

export function SignInPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex items-center justify-center px-6 py-20 lg:py-6 bg-earth-50">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <Compass className="h-7 w-7 text-terra-400" strokeWidth={2.2} />
            <span className="font-display text-2xl font-semibold text-forest-800">Safiri</span>
          </Link>

          <div className="bg-white rounded-2xl border border-earth-200 shadow-sm p-8">
            <h1 className="font-display text-3xl text-forest-800 mb-1">Welcome back</h1>
            <p className="text-forest-700/60 text-sm mb-6">Sign in to keep planning your trip.</p>

            {error && (
              <div className="flex items-center gap-2 bg-terra-400/10 text-terra-600 text-sm px-4 py-3 rounded-lg mb-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-earth-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-earth-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terra-400/40 focus:border-terra-400"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-earth-500 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-earth-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terra-400/40 focus:border-terra-400"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-terra-400 text-white font-medium rounded-full hover:bg-terra-600 transition-colors disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="text-center text-sm text-forest-700/60 mt-6">
              Don't have an account?{" "}
              <Link to="/signup" className="text-terra-400 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right — real destination photo carousel, hidden on small screens */}
      <div className="hidden lg:block">
        <AuthCarousel />
      </div>
    </div>
  );
}
