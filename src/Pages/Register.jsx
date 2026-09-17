import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { apiFetch } from "../lib/api";
import { useAuth } from "../Auth/AuthContext";
import heroImage from "../assets/hero-image.png";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    zone: "",
    role: "resident",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone || undefined,
          zone: form.zone || undefined,
          role: form.role,
        }),
      });
      await login(form.email.trim(), form.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const field = (
    name,
    label,
    type = "text",
    required = false,
    placeholder = "",
  ) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      />
    </label>
  );

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
              Join the community
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-tight">
              Turn local awareness into safer neighbourhoods.
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/75">
              Report incidents, follow updates and help your community respond.
            </p>
          </div>
        </div>
      </div>
      <div className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white"
          >
            <ArrowLeft size={16} /> Back to SafeCircle
          </Link>
          <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <h1 className="text-2xl font-bold text-slate-950">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Start with the resident experience, or test the patrol workflow.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {field("name", "Full name", "text", true, "Your full name")}
              {field(
                "email",
                "Email address",
                "email",
                true,
                "you@example.com",
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {field("phone", "Phone", "tel", false, "Optional")}
                {field(
                  "zone",
                  "Zone",
                  "text",
                  false,
                  "e.g. Oak Ridge Sector B",
                )}
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Account role
                </span>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                >
                  <option value="resident">Resident</option>
                  <option value="patrol_officer">Patrol officer</option>
                </select>
                <span className="mt-1 block text-xs text-slate-400">
                  Admin accounts should be provisioned by the backend, not
                  self-created.
                </span>
              </label>
              {field(
                "password",
                "Password",
                "password",
                true,
                "At least 6 characters",
              )}{" "}
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
                className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">
              Already registered?{" "}
              <Link
                to="/login"
                className="font-semibold text-violet-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
