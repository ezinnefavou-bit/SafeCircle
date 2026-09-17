import { useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch, unwrap } from "../lib/api";
const CATEGORIES = [
  "theft",
  "vandalism",
  "suspicious_activity",
  "hazard",
  "lost_and_found",
  "noise_complaint",
  "emergency",
  "other",
];
const PRIORITIES = ["low", "medium", "high", "critical"];
const label = (v) =>
  v.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
export default function ReportIncident() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    zone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const valid = form.title.trim() && form.description.trim() && form.category;
  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/incidents", {
        method: "POST",
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          priority: form.priority,
          location: form.zone.trim() ? { zone: form.zone.trim() } : undefined,
        }),
      });
      const item = unwrap(data)?.incident || unwrap(data);
      const id = item?.id || item?._id;
      if (!id)
        throw new Error(
          "The incident was created, but the API did not return an incident id.",
        );
      nav(`/incidents/${id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-violet-700">
          New report
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
          Report an incident
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Provide enough detail for your community and safety team to act.
        </p>
        <form
          onSubmit={submit}
          className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Title
            </span>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
              placeholder="What happened?"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </span>
            <textarea
              required
              rows={6}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
              placeholder="Describe what you saw…"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Category
              </span>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-3 capitalize"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((x) => (
                  <option key={x} value={x}>
                    {label(x)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Priority
              </span>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-3 capitalize"
              >
                {PRIORITIES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Zone
            </span>
            <input
              value={form.zone}
              onChange={(e) => setForm({ ...form, zone: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-500"
              placeholder="e.g. Oak Ridge Sector B"
            />
          </label>
          {touched && !valid && (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Title, description and category are required.
            </p>
          )}
          {error && (
            <p
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Submit incident"}
          </button>
        </form>
      </div>
    </div>
  );
}
