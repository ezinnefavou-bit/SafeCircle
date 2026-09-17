import { Link } from "react-router";
import { MapPin, MessageCircle, ArrowBigUp, Clock } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

function formatCategory(category) {
  if (!category) return "Other";
  return category
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function formatWhen(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function IncidentCard({ incident }) {
  const zone = incident.location?.zone || incident.zone;
  const upvoteCount = Array.isArray(incident.upvotes)
    ? incident.upvotes.length
    : incident.upvotes || 0;
  const commentCount = Array.isArray(incident.comments)
    ? incident.comments.length
    : 0;

  return (
    <Link
      to={`/incidents/${incident.id || incident._id}`}
      className="block rounded-2xl border border-ink-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-ink-900">
          {incident.title}
        </h3>
        <div className="flex shrink-0 items-center gap-2">
          <PriorityBadge priority={incident.priority} />
          <StatusBadge status={incident.status} />
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-ink-600">
        {incident.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-400">
        <span className="rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-700">
          {formatCategory(incident.category)}
        </span>
        {zone && (
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {zone}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {formatWhen(incident.createdAt)}
        </span>
        <span className="flex items-center gap-1">
          <ArrowBigUp size={14} />
          {upvoteCount}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle size={14} />
          {commentCount}
        </span>
      </div>
    </Link>
  );
}
