import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { apiFetch, extractList } from "../lib/api";
import IncidentCard from "../components/IncidentCard";

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
const STATUSES = [
  "reported",
  "under_review",
  "in_progress",
  "resolved",
  "dismissed",
];
const PRIORITIES = ["low", "medium", "high", "critical"];
const label = (v) =>
  v.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
    zone: "",
    search: "",
  });
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const p = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => v && p.set(k, v));
        const data = await apiFetch(`/incidents${p.toString() ? `?${p}` : ""}`);
        setIncidents(extractList(data, ["incidents", "items", "results"]));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [filters]);
  const update = (e) =>
    setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-violet-700">
              Community feed
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Incidents
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Search and filter reports from the community.
            </p>
          </div>
          <Link
            to="/report-incident"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus size={17} /> Report incident
          </Link>
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <label className="relative lg:col-span-2">
              <span className="sr-only">Search</span>
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                name="search"
                value={filters.search}
                onChange={update}
                placeholder="Search incidents…"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              />
            </label>
            {[
              ["status", STATUSES, "All status"],
              ["category", CATEGORIES, "All categories"],
              ["priority", PRIORITIES, "All priorities"],
            ].map(([name, items, first]) => (
              <select
                key={name}
                name={name}
                value={filters[name]}
                onChange={update}
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm capitalize outline-none focus:border-violet-500"
              >
                <option value="">{first}</option>
                {items.map((x) => (
                  <option key={x} value={x}>
                    {label(x)}
                  </option>
                ))}
              </select>
            ))}
            <input
              name="zone"
              value={filters.zone}
              onChange={update}
              placeholder="Zone"
              className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-violet-500 lg:col-span-1"
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <SlidersHorizontal size={14} /> Filters are sent directly to the
            API.
          </div>
        </div>
        <div className="mt-6">
          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Loading incidents…
            </div>
          )}
          {!loading && error && (
            <div
              className="rounded-2xl bg-red-50 p-4 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}
          {!loading && !error && !incidents.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="font-semibold text-slate-700">No incidents found</p>
              <p className="mt-1 text-sm text-slate-400">
                This empty state is separate from loading and errors. Try
                another filter or zone.
              </p>
            </div>
          )}
          {!loading && !error && incidents.length > 0 && (
            <div className="space-y-4">
              {incidents.map((item) => (
                <IncidentCard key={item.id || item._id} incident={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
