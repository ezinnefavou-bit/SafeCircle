import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  ListChecks,
  MapPin,
  Radio,
  Shield,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { apiFetch, extractList } from "../lib/api";
import { useAuth } from "../Auth/AuthContext";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";

const OPEN_STATUSES = ["reported", "under_review", "in_progress"];
const ALERT_STYLES = {
  info: "border-sky-200 bg-sky-50",
  warning: "border-amber-200 bg-amber-50",
  critical: "border-orange-300 bg-orange-50",
  emergency: "border-red-300 bg-red-50",
};
const idOf = (x) => (typeof x === "string" ? x : x?.id || x?._id);

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const isOfficer = ["patrol_officer", "admin"].includes(user?.role);
  const isAdmin = user?.role === "admin";

  const [incidents, setIncidents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [patrols, setPatrols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      const results = await Promise.allSettled([
        apiFetch("/incidents"),
        apiFetch(
          `/alerts${user?.zone ? `?zone=${encodeURIComponent(user.zone)}` : ""}`,
        ),
        isOfficer ? apiFetch("/patrols") : Promise.resolve(null),
      ]);
      if (!active) return;

      const [incidentsRes, alertsRes, patrolsRes] = results;
      if (incidentsRes.status === "fulfilled")
        setIncidents(
          extractList(incidentsRes.value, ["incidents", "items", "results"]),
        );
      if (alertsRes.status === "fulfilled")
        setAlerts(extractList(alertsRes.value, ["alerts", "items", "results"]));
      if (isOfficer && patrolsRes.status === "fulfilled" && patrolsRes.value)
        setPatrols(
          extractList(patrolsRes.value, ["patrols", "items", "results"]),
        );

      if (
        incidentsRes.status === "rejected" &&
        alertsRes.status === "rejected"
      ) {
        setError(
          "We couldn't load your dashboard data. Pull to refresh or try again shortly.",
        );
      }
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [user?.zone, isOfficer]);

  const me = idOf(user);
  const myIncidents = incidents
    .filter((i) => idOf(i.reportedBy) === me)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const zoneIncidents = user?.zone
    ? incidents.filter((i) => (i.location?.zone || i.zone) === user.zone)
    : incidents;
  const recentZoneIncidents = [...zoneIncidents]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const openZoneCount = zoneIncidents.filter((i) =>
    OPEN_STATUSES.includes(i.status),
  ).length;
  const resolvedZoneCount = zoneIncidents.filter(
    (i) => i.status === "resolved",
  ).length;
  const activeAlerts = alerts
    .filter((a) => !a.expiresAt || new Date(a.expiresAt) > new Date())
    .slice(0, 4);
  const uid = user?.id || user?._id;
  const activeShift = patrols.find(
    (p) =>
      p.status === "active" &&
      (String(p.officerId) === String(uid) || p.officerId?.id === uid),
  );
  const myPastPatrolCount = patrols.filter(
    (p) =>
      p.status !== "active" &&
      (String(p.officerId) === String(uid) || p.officerId?.id === uid),
  ).length;

  const stats = [
    { label: "My reports", value: myIncidents.length, icon: ClipboardList },
    { label: "Open in your zone", value: openZoneCount, icon: Activity },
    { label: "Active alerts", value: activeAlerts.length, icon: Bell },
    isOfficer
      ? { label: "Shifts logged", value: myPastPatrolCount, icon: Shield }
      : {
          label: "Resolved in your zone",
          value: resolvedZoneCount,
          icon: CheckCircle2,
        },
  ];

  const quickActions = [
    {
      to: "/report-incident",
      label: "Report incident",
      icon: FilePlus2,
      primary: true,
    },
    { to: "/incidents", label: "Browse incidents", icon: ListChecks },
    { to: "/alerts", label: "View alerts", icon: Bell },
    ...(isOfficer
      ? [
          {
            to: "/patrols",
            label: activeShift ? "View active shift" : "Start a patrol",
            icon: Shield,
          },
        ]
      : []),
    ...(isAdmin
      ? [{ to: "/alerts", label: "Broadcast alert", icon: Radio }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-violet-700">
              Your dashboard
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              {greeting()}, {user?.name?.split(" ")[0] || "there"}.
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              {user?.zone ? (
                <>
                  <MapPin size={14} /> Watching {user.zone}
                </>
              ) : (
                "Add your zone in your profile to see local alerts and stats."
              )}
              <span className="mx-1 text-slate-300">·</span>
              <span className="capitalize">
                {user?.role?.replaceAll("_", " ")}
              </span>
            </p>
          </div>
        </div>

        {error && (
          <div
            className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {isOfficer && (
          <div
            className={`mt-6 rounded-2xl border p-5 sm:p-6 ${activeShift ? "border-violet-200 bg-violet-50" : "border-slate-200 bg-white"}`}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${activeShift ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}
                >
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-bold text-slate-950">
                    {activeShift
                      ? `On patrol · ${activeShift.zone}`
                      : "No active patrol"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {activeShift
                      ? `Started ${new Date(activeShift.startTime).toLocaleString()}`
                      : "Start a shift when you're ready to patrol your zone."}
                  </p>
                </div>
              </div>
              <Link
                to="/patrols"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {activeShift ? "Go to active shift" : "Start patrol"}{" "}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <Icon className="text-violet-700" size={20} />
              <p className="mt-5 text-2xl font-bold text-slate-950 sm:text-3xl">
                {loading ? "…" : value}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {quickActions.map(({ to, label, icon: Icon, primary }) => (
            <Link
              key={label}
              to={to}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${primary ? "bg-violet-600 text-white hover:bg-violet-700" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-950">
                {user?.zone ? `Recent in ${user.zone}` : "Recent incidents"}
              </h2>
              <Link
                to="/incidents"
                className="text-sm font-semibold text-violet-700 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {loading && (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                  Loading recent activity…
                </div>
              )}
              {!loading && !recentZoneIncidents.length && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <p className="font-semibold text-slate-700">
                    Nothing reported yet
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {user?.zone
                      ? `No incidents have been reported in ${user.zone}.`
                      : "No incidents to show."}{" "}
                    Be the first to file a report.
                  </p>
                  <Link
                    to="/report-incident"
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    <FilePlus2 size={16} /> Report incident
                  </Link>
                </div>
              )}
              {!loading &&
                recentZoneIncidents.map((item) => (
                  <Link
                    key={item.id || item._id}
                    to={`/incidents/${item.id || item._id}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-slate-950">
                        {item.title}
                      </p>
                      <div className="flex shrink-0 items-center gap-2">
                        <PriorityBadge priority={item.priority} />
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={13} />{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </Link>
                ))}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-950">
                  Your recent reports
                </h2>
                {myIncidents.length > 0 && (
                  <span className="text-sm text-slate-400">
                    {myIncidents.length} total
                  </span>
                )}
              </div>
              <div className="mt-4 space-y-3">
                {!loading && !myIncidents.length && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <p className="text-sm text-slate-500">
                      You haven't reported anything yet.
                    </p>
                    <Link
                      to="/report-incident"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:underline"
                    >
                      Report your first incident <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
                {!loading &&
                  myIncidents.slice(0, 3).map((item) => (
                    <Link
                      key={item.id || item._id}
                      to={`/incidents/${item.id || item._id}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-violet-300"
                    >
                      <span className="truncate font-medium text-slate-800">
                        {item.title}
                      </span>
                      <StatusBadge status={item.status} />
                    </Link>
                  ))}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-950">
                <AlertTriangle size={18} className="text-violet-700" /> Zone
                alerts
              </h2>
              <Link
                to="/alerts"
                className="text-sm font-semibold text-violet-700 hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {loading && (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  Loading alerts…
                </div>
              )}
              {!loading && !activeAlerts.length && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <ShieldCheck className="mx-auto text-emerald-500" size={22} />
                  <p className="mt-2 text-sm text-slate-500">
                    No active alerts{" "}
                    {user?.zone ? `for ${user.zone}` : "right now"}. All quiet.
                  </p>
                </div>
              )}
              {!loading &&
                activeAlerts.map((a) => (
                  <article
                    key={a.id || a._id}
                    className={`rounded-2xl border p-4 ${ALERT_STYLES[a.severity] || ALERT_STYLES.info}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {a.title}
                      </h3>
                      <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold uppercase">
                        {a.severity}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-700">
                      {a.message}
                    </p>
                  </article>
                ))}
            </div>

            {isAdmin && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-950">
                  <Radio size={16} className="text-violet-700" /> Admin tools
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Broadcast a new safety alert to a zone.
                </p>
                <Link
                  to="/alerts"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700 hover:underline"
                >
                  Go to broadcast form <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
