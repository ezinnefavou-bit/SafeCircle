import { useEffect, useMemo, useState } from "react";
import { apiFetch, extractList } from "../lib/api";
import { useAuth } from "../Auth/AuthContext";
const CP_STATUS = ["checked", "clear", "issue"];
export default function Patrols() {
  const { user } = useAuth();
  const [patrols, setPatrols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zone, setZone] = useState(user?.zone || "");
  const [initialNotes, setInitialNotes] = useState("");
  const [checkpoint, setCheckpoint] = useState({
    name: "",
    status: "checked",
    notes: "",
  });
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    setError("");
    try {
      const data = await apiFetch("/patrols");
      setPatrols(extractList(data, ["patrols", "items", "results"]));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const uid = user?.id || user?._id;
  const active = useMemo(
    () =>
      patrols.find(
        (p) =>
          p.status === "active" &&
          (String(p.officerId) === String(uid) || p.officerId?.id === uid),
      ),
    [patrols, uid],
  );
  async function send(path, body) {
    setBusy(true);
    setError("");
    try {
      await apiFetch(path, { method: "POST", body: JSON.stringify(body) });
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
          Patrol operations
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Patrol shifts</h1>
        <p className="mt-1 text-sm text-slate-500">
          Start a shift, log checkpoints and close it with a summary.
        </p>
        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {loading ? (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center text-sm text-slate-500">
            Loading patrols…
          </div>
        ) : !active ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send("/patrols/start", {
                zone,
                initialNotes: initialNotes || undefined,
              });
            }}
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <h2 className="font-bold">Start a patrol</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-sm font-medium">Zone</span>
                <input
                  required
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="Patrol zone"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-medium">
                  Initial notes
                </span>
                <input
                  value={initialNotes}
                  onChange={(e) => setInitialNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="Optional"
                />
              </label>
            </div>
            <button
              disabled={busy}
              className="mt-4 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Starting…" : "Start patrol"}
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Active shift · {active.zone}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Started{" "}
                  {active.startTime &&
                    new Date(active.startTime).toLocaleString()}
                </p>
              </div>
              <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                ACTIVE
              </span>
            </div>
            <div className="mt-6 rounded-2xl bg-white p-4">
              <h3 className="font-semibold">Log checkpoint</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto]">
                <input
                  required
                  value={checkpoint.name}
                  onChange={(e) =>
                    setCheckpoint({ ...checkpoint, name: e.target.value })
                  }
                  placeholder="Checkpoint name"
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                />
                <select
                  value={checkpoint.status}
                  onChange={(e) =>
                    setCheckpoint({ ...checkpoint, status: e.target.value })
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                >
                  {CP_STATUS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <input
                  value={checkpoint.notes}
                  onChange={(e) =>
                    setCheckpoint({ ...checkpoint, notes: e.target.value })
                  }
                  placeholder="Notes (optional)"
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                />
                <button
                  disabled={busy || !checkpoint.name.trim()}
                  onClick={() =>
                    send(`/patrols/${active.id || active._id}/checkpoint`, {
                      name: checkpoint.name.trim(),
                      status: checkpoint.status,
                      notes: checkpoint.notes || undefined,
                    })
                  }
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Log
                </button>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-white p-4">
              <h3 className="font-semibold">End shift</h3>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Shift summary"
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
                />
                <button
                  disabled={busy}
                  onClick={() =>
                    send(`/patrols/${active.id || active._id}/end`, { summary })
                  }
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  End patrol
                </button>
              </div>
            </div>
            {active.checkpoints?.length > 0 && (
              <div className="mt-5">
                <h3 className="font-semibold">Checkpoints</h3>
                <div className="mt-3 space-y-2">
                  {active.checkpoints.map((cp, i) => (
                    <div
                      key={cp.id || i}
                      className="rounded-xl bg-white p-3 text-sm"
                    >
                      <span className="font-medium">{cp.name}</span>
                      {cp.status && (
                        <span className="ml-2 text-slate-500">
                          · {cp.status}
                        </span>
                      )}
                      {cp.notes && (
                        <p className="mt-1 text-slate-500">{cp.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <section className="mt-8">
          <h2 className="font-bold">Past shifts</h2>
          <div className="mt-3 space-y-2">
            {patrols
              .filter((p) => p.status !== "active")
              .map((p) => (
                <div
                  key={p.id || p._id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{p.zone}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize">
                      {p.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {p.startTime && new Date(p.startTime).toLocaleString()}
                    {p.endTime && ` → ${new Date(p.endTime).toLocaleString()}`}
                  </p>
                  {p.summary && (
                    <p className="mt-2 text-sm text-slate-600">{p.summary}</p>
                  )}
                </div>
              ))}
            {!patrols.filter((p) => p.status !== "active").length && (
              <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                No past patrols yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
