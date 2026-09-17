import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowBigUp, Clock, MapPin, Trash2, UserRound } from "lucide-react";
import { apiFetch, unwrap } from "../lib/api";
import { useAuth } from "../Auth/AuthContext";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import CommentList from "../components/CommentList";
const STATUSES = [
  "reported",
  "under_review",
  "in_progress",
  "resolved",
  "dismissed",
];
const idOf = (x) => (typeof x === "string" ? x : x?.id || x?._id);
export default function IncidentDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  async function load() {
    setError("");
    try {
      const data = await apiFetch(`/incidents/${id}`);
      setItem(unwrap(data)?.incident || unwrap(data));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [id]);
  async function act(path, body) {
    setBusy(true);
    setError("");
    try {
      await apiFetch(path, {
        method: "POST",
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function submitComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    await act(`/incidents/${id}/comments`, { text: comment.trim() });
    setComment("");
  }
  async function status(e) {
    setBusy(true);
    try {
      await apiFetch(`/incidents/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: e.target.value }),
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!window.confirm("Delete this incident? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await apiFetch(`/incidents/${id}`, { method: "DELETE" });
      nav("/incidents", { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }
  if (loading)
    return (
      <div className="p-10 text-center text-sm text-slate-500">
        Loading incident…
      </div>
    );
  if (!item)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error || "Incident not found."}
        </div>
      </div>
    );
  const zone = item.location?.zone || item.zone;
  const upvotes = Array.isArray(item.upvotes)
    ? item.upvotes.length
    : Number(item.upvotes || item.upvotesCount || 0);
  const owner = idOf(item.reportedBy);
  const me = idOf(user);
  const canDelete = Boolean(owner && me && owner === me);
  const canStatus = ["patrol_officer", "admin"].includes(user?.role);
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => nav(-1)}
          className="mb-4 text-sm font-medium text-violet-700 hover:underline"
        >
          ← Back to incidents
        </button>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <PriorityBadge priority={item.priority} />
                <StatusBadge status={item.status} />
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-950 sm:text-3xl">
                {item.title}
              </h1>
            </div>
            {item.reportedBy?.name && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <UserRound size={16} />
                {item.reportedBy.name}
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
            {zone && (
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {zone}
              </span>
            )}
            {item.createdAt && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {new Date(item.createdAt).toLocaleString()}
              </span>
            )}
          </div>
          <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {item.description}
          </p>
          {item.images?.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {item.images.map((src, i) => (
                <img
                  key={i}
                  src={typeof src === "string" ? src : src.url}
                  alt="Incident evidence"
                  className="max-h-72 w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}
          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <button
              disabled={busy}
              onClick={() => act(`/incidents/${id}/upvote`)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
            >
              <ArrowBigUp size={17} /> Upvote ({upvotes})
            </button>
            {canStatus && (
              <select
                disabled={busy}
                value={item.status}
                onChange={status}
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
              >
                <option value="">Update status</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            )}
            {canDelete && (
              <button
                disabled={deleting}
                onClick={remove}
                className="ml-auto inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
              >
                <Trash2 size={16} />
                {deleting ? "Deleting…" : "Delete"}
              </button>
            )}
          </div>
        </article>
        {error && (
          <div
            className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}
        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold">Comments</h2>
          <div className="mt-5">
            <CommentList comments={item.comments} />
          </div>
          <form
            onSubmit={submitComment}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment or update…"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-violet-500"
            />
            <button
              disabled={busy || !comment.trim()}
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Post comment
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
