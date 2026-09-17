function formatWhen(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CommentList({ comments }) {
  if (!comments || comments.length === 0) {
    return (
      <p className="text-sm text-ink-400">
        No comments yet. Be the first to share an update.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((comment, index) => (
        <li
          key={comment.id || comment._id || index}
          className="rounded-xl border border-ink-200 bg-ink-50 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-900">
              {comment.authorName || comment.author?.name || "Community member"}
            </span>
            <span className="text-xs text-ink-400">
              {formatWhen(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-600">{comment.text || comment.message}</p>
        </li>
      ))}
    </ul>
  );
}
