"use client";

import { useNow } from "@/hooks/useNow";
import { formatMatchTime } from "@/lib/utils/formatTime";

// Shows a time in the visitor's timezone. The server doesn't know that
// timezone, so the text is filled in once the page runs in the browser.
export default function LocalTime({ iso, className = "" }) {
  const now = useNow();
  if (!iso) return null;
  return (
    <time dateTime={iso} className={className}>
      {now === null ? "" : formatMatchTime(iso)}
    </time>
  );
}
