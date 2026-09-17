import { useEffect, useState } from "react";
import { apiFetch, extractList } from "../lib/api";
import { useAuth } from "../Auth/AuthContext";
const SEVERITIES = ["info", "warning", "critical", "emergency"];
const styles = {
  info: "border-sky-200 bg-sky-50",
  warning: "border-amber-200 bg-amber-50",
  critical: "border-orange-300 bg-orange-50",
  emergency: "border-red-300 bg-red-50",
};
export default function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ zone: "", severity: "" });
  const [form, setForm] = useState({
    title: "",
    message: "",
    severity: "info",
    targetZone: "",
    expiresInHours: "",
  });
  const [busy, setBusy] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const p = new URLSearchParams();
      if (filters.zone) p.set("zone", filters.zone);
      if (filters.severity) p.set("severity", filters.severity);
      const data = await apiFetch(`/alerts${p.toString() ? `?${p}` : ""}`);
      setAlerts(extractList(data, ["alerts", "items", "results"]));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [filters]);
  async function broadcast(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiFetch("/alerts", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          expiresInHours: form.expiresInHours
            ? Number(form.expiresInHours)
            : undefined,
        }),
      });
      setForm({
        title: "",
        message: "",
        severity: "info",
        targetZone: "",
        expiresInHours: "",
      });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-violet-700">
          Community alerts
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Safety alerts</h1>
        <p className="mt-1 text-sm text-slate-500">
          Important updates filtered by zone and severity.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <input
            value={filters.zone}
            onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
            placeholder="Filter by zone"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
          />
          <select
            value={filters.severity}
            onChange={(e) =>
              setFilters({ ...filters, severity: e.target.value })
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">All severities</option>
            {SEVERITIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        {user?.role === "admin" && (
          <form
            onSubmit={broadcast}
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="font-bold">Broadcast an alert</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Alert title"
                className="rounded-xl border border-slate-300 px-4 py-3 sm:col-span-2"
              />
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Alert message"
                className="rounded-xl border border-slate-300 px-4 py-3 sm:col-span-2"
              />
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="rounded-xl border border-slate-300 px-4 py-3"
              >
                {SEVERITIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <input
                value={form.targetZone}
                onChange={(e) =>
                  setForm({ ...form, targetZone: e.target.value })
                }
                placeholder="Target zone"
                className="rounded-xl border border-slate-300 px-4 py-3"
              />
              <input
                type="number"
                min="1"
                value={form.expiresInHours}
                onChange={(e) =>
                  setForm({ ...form, expiresInHours: e.target.value })
                }
                placeholder="Expires in hours"
                className="rounded-xl border border-slate-300 px-4 py-3"
              />
            </div>
            <button
              disabled={busy}
              className="mt-4 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Broadcasting…" : "Broadcast alert"}
            </button>
          </form>
        )}
        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500">
              Loading alerts…
            </div>
          ) : !alerts.length ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No alerts match the current filters.
            </div>
          ) : (
            alerts.map((a) => (
              <article
                key={a.id || a._id}
                className={`rounded-2xl border p-5 ${styles[a.severity] || styles.info}`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-bold">{a.title}</h3>
                  <span className="w-fit rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold uppercase">
                    {a.severity}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {a.message}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  {a.targetZone || "All zones"}
                  {a.createdAt &&
                    ` · ${new Date(a.createdAt).toLocaleString()}`}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
