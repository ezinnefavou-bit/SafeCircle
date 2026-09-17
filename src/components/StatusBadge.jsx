const STATUS_STYLES = {
  reported: "bg-sky-100 text-sky-700 border-sky-200",
  under_review: "bg-amber-100 text-amber-700 border-amber-200",
  in_progress: "bg-brand-100 text-brand-700 border-brand-200",
  resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  dismissed: "bg-ink-100 text-ink-600 border-ink-200",
};

const STATUS_LABELS = {
  reported: "Reported",
  under_review: "Under review",
  in_progress: "In progress",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.reported;
  const label = STATUS_LABELS[status] || status;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
}
