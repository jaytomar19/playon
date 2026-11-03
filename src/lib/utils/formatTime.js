// Formats in the visitor's own timezone and language.
export function formatMatchTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// "just now", "5 min ago", "3 h ago", or a date for anything older.
export function formatAge(iso, now) {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return null;
  const minutes = Math.max(0, Math.round((now - time) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return formatMatchTime(iso);
}
