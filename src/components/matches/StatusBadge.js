// Status is always written out in text (never shown by colour alone).
const LABELS = {
  live: "Live",
  upcoming: "Upcoming",
  completed: "Result",
  postponed: "Postponed",
  cancelled: "Cancelled",
  unknown: "Status unknown",
};

export default function StatusBadge({ status, minute = null }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-live px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
        <span aria-hidden="true" className="live-dot h-1.5 w-1.5 rounded-full bg-white" />
        Live
        {minute != null && <span className="tabular">{minute}&prime;</span>}
      </span>
    );
  }

  const tone =
    status === "completed"
      ? "bg-foreground text-background"
      : status === "upcoming"
        ? "bg-surface-2 text-foreground"
        : "border border-line text-muted";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${tone}`}>
      {LABELS[status] ?? LABELS.unknown}
    </span>
  );
}
