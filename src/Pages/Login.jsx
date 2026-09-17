import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../Auth/AuthContext";
import heroImage from "../assets/hero-image.png";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-2">
      <div className="relative hidden min-h-screen overflow-hidden lg:block">
        <img
          src={heroImage}
          alt="Community safety"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold text-white"
          >
            <ShieldCheck className="text-violet-300" />
            SafeCircle
          </Link>
          <div className="max-w-lg pb-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[.25em] text-violet-300">
              Community safety
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-tight">
              Stay informed. Speak up. Look out for one another.
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/75">
              A calm, reliable space for residents and safety teams to report
              and respond to incidents.
            </p>
          </div>
        </div>
      </div>
      <div className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white"
          >
            <ArrowLeft size={16} /> Back to SafeCircle
          </Link>
          <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-slate-950">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Sign in to continue to your community.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email address
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </span>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  placeholder="Your password"
                />
              </label>
              {error && (
                <div
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}
              <button
                disabled={loading}
                className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-violet-700 hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
