import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  X,
  Activity,
  Users,
  ShieldAlert,
} from "lucide-react";
import { apiFetch, unwrap } from "../lib/api";
import { useAuth } from "../Auth/AuthContext";
import heroImage from "../assets/hero-image.png";

function statValue(value, suffix = "") {
  return value === undefined || value === null ? "—" : `${value}${suffix}`;
}

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch("/public/stats")
      .then((data) => {
        if (active) setStats(unwrap(data));
      })
      .catch(() => {
        if (active) setStats(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const overview = stats?.overview || stats || {};
  const community = stats?.communityMembers || {};
  const notices = stats?.recentPublicNotices || stats?.recentNotices || [];
  const nav = ["overview", "about", "notices"];

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <section className="relative min-h-[680px] overflow-hidden bg-slate-950">
        <img
          src={heroImage}
          alt="Community safety"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/65" />
        <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-white"
          >
            <ShieldCheck className="text-violet-300" />
            SafeCircle
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className="text-sm font-medium text-white/80 hover:text-white"
              >
                {item[0].toUpperCase() + item.slice(1)}
              </a>
            ))}
          </div>
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white hover:text-slate-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500"
                >
                  Register
                </Link>
              </>
            )}
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl border border-white/25 p-2 text-white md:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
        {menuOpen && (
          <div className="relative z-30 mx-5 rounded-2xl border border-white/10 bg-slate-950/95 p-3 md:hidden">
            {nav.map((item) => (
              <a
                key={item}
                onClick={() => setMenuOpen(false)}
                href={`#${item}`}
                className="block rounded-xl px-3 py-3 text-sm text-white/85 hover:bg-white/10"
              >
                {item[0].toUpperCase() + item.slice(1)}
              </a>
            ))}
            <div className="mt-2 border-t border-white/10 pt-3">
              {user ? (
                <Link
                  onClick={() => setMenuOpen(false)}
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-center text-sm font-semibold text-white"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    onClick={() => setMenuOpen(false)}
                    to="/login"
                    className="rounded-xl border border-white/20 py-3 text-center text-sm font-semibold text-white"
                  >
                    Login
                  </Link>
                  <Link
                    onClick={() => setMenuOpen(false)}
                    to="/register"
                    className="rounded-xl bg-violet-600 py-3 text-center text-sm font-semibold text-white"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="relative z-10 mx-auto flex min-h-[550px] max-w-7xl items-center px-5 pb-20 pt-16 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[.25em] text-violet-300">
              Community safety platform
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
              Safer neighbourhoods start with people.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
              Report incidents, follow community updates and connect residents
              with the people responsible for keeping neighbourhoods safe.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to={user ? "/report-incident" : "/login"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-7 py-3.5 font-semibold text-white hover:bg-violet-500"
              >
                Report an incident <ArrowRight size={18} />
              </Link>
              <Link
                to={user ? "/incidents" : "/login"}
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-3.5 font-semibold text-white hover:bg-white hover:text-slate-900"
              >
                Explore incidents
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="overview"
        className="scroll-mt-4 px-5 py-16 sm:px-8 lg:px-10 lg:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[.2em] text-violet-700">
              Live public numbers
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Safety at a glance.
            </h2>
            <p className="mt-4 text-slate-600">
              These numbers come directly from the Community Watch API. No login
              is required to view them.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [overview.totalIncidentsReported, "Incidents reported", Activity],
              [overview.inProgressIncidents, "In progress", ShieldAlert],
              [overview.resolvedIncidents, "Resolved", ShieldCheck],
              [overview.resolutionRatePercentage, "Resolution rate", Activity],
            ].map(([value, label, Icon]) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <Icon className="text-violet-700" size={22} />
                <p className="mt-7 text-3xl font-bold">
                  {loading
                    ? "…"
                    : statValue(value, label.includes("rate") ? "%" : "")}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-4 bg-slate-950 px-5 py-16 text-white sm:px-8 lg:px-10 lg:py-20"
      >
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[.2em] text-violet-300">
              About SafeCircle
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              One place for awareness, reporting and response.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/65">
              Residents can report incidents, comment and upvote. Patrol
              officers can manage shifts and update incident status.
              Administrators can broadcast alerts to a zone.
            </p>
            <Link
              to={user ? "/dashboard" : "/register"}
              className="mt-7 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-violet-100"
            >
              {user ? "Go to dashboard" : "Join SafeCircle"}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <Users className="text-violet-300" />
              <p className="mt-8 text-3xl font-bold">
                {loading ? "…" : statValue(community.registeredResidents)}
              </p>
              <p className="mt-2 text-sm text-white/60">Registered residents</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <ShieldCheck className="text-violet-300" />
              <p className="mt-8 text-3xl font-bold">
                {loading ? "…" : statValue(community.activePatrolOfficers)}
              </p>
              <p className="mt-2 text-sm text-white/60">
                Active patrol officers
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="notices"
        className="scroll-mt-4 px-5 py-16 sm:px-8 lg:px-10 lg:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-violet-700">
            Public notices
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Latest community updates.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {notices.length ? (
              notices.map((notice, i) => (
                <article
                  key={notice.id || notice._id || i}
                  className="rounded-2xl border border-slate-200 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold">{notice.title}</h3>
                    {notice.severity && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase text-slate-600">
                        {notice.severity}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {notice.message || notice.description || "Community notice"}
                  </p>
                  {notice.targetZone && (
                    <p className="mt-4 text-xs font-medium text-slate-500">
                      Target zone: {notice.targetZone}
                    </p>
                  )}
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
                No public notices available right now.
              </div>
            )}
          </div>
        </div>
      </section>
      <footer className="border-t border-slate-200 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SafeCircle</p>
          <div className="flex gap-5">
            {user ? (
              <Link to="/dashboard">Dashboard</Link>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
