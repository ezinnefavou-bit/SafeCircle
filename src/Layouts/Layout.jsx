import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import {
  Bell,
  FilePlus2,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Shield,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../Auth/AuthContext";
const items = [
  { to: "/incidents", label: "Incidents", icon: ListChecks },
  { to: "/report-incident", label: "Report incident", icon: FilePlus2 },
  { to: "/alerts", label: "Alerts", icon: Bell },
  {
    to: "/patrols",
    label: "Patrols",
    icon: Shield,
    roles: ["patrol_officer", "admin"],
  },
  { to: "/profile", label: "Profile", icon: User },
];
export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const links = items.filter((x) => !x.roles || x.roles.includes(user?.role));
  async function signOut() {
    await logout();
    nav("/", { replace: true });
  }
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:flex">
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
            <Link
              onClick={() => setOpen(false)}
              to="/dashboard"
              className="flex items-center gap-2 font-bold text-slate-950"
            >
              <Shield className="text-violet-600" />
              SafeCircle
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 lg:hidden"
              aria-label="Close menu"
            >
              <X />
            </button>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            <NavLink
              onClick={() => setOpen(false)}
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-100"}`
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
            {links.map((x) => {
              const Icon = x.icon;
              return (
                <NavLink
                  onClick={() => setOpen(false)}
                  key={x.to}
                  to={x.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? "bg-violet-50 text-violet-700" : "text-slate-600 hover:bg-slate-100"}`
                  }
                >
                  <Icon size={18} />
                  {x.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="border-t border-slate-200 p-4">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name}
            </p>
            <p className="mt-0.5 text-xs capitalize text-slate-400">
              {user?.role?.replaceAll("_", " ")}
            </p>
            <button
              onClick={signOut}
              className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </aside>
        {open && (
          <button
            className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu overlay"
          />
        )}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
            <button
              onClick={() => setOpen(true)}
              className="rounded-xl p-2"
              aria-label="Open menu"
            >
              <Menu />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2 font-bold">
              <Shield className="text-violet-600" />
              SafeCircle
            </Link>
            <div className="h-9 w-9 rounded-full bg-violet-100 text-center text-sm font-bold leading-9 text-violet-700">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </header>
          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
