"use client";

import { Clock, TriangleAlert } from "lucide-react";
import { useNow } from "@/hooks/useNow";
import { formatAge, formatMatchTime } from "@/lib/utils/formatTime";

/**
 * "Updated 4 min ago" for the data actually on screen. `lastUpdated` is when
 * the provider produced the response, so cached data shows its real age.
 */
export default function LastUpdated({ lastUpdated, staleAfterSeconds, refreshFailed = false }) {
  const now = useNow();
  if (now === null) return null;

  if (!lastUpdated) {
    return <p className="text-xs text-muted">Update time unknown</p>;
  }

  const ageSeconds = (now - Date.parse(lastUpdated)) / 1000;
  const stale = refreshFailed || (staleAfterSeconds && ageSeconds > staleAfterSeconds);

  return (
    <p className={`flex items-center gap-1 text-xs ${stale ? "text-live" : "text-muted"}`}>
      {stale ? <TriangleAlert size={12} aria-hidden="true" /> : <Clock size={12} aria-hidden="true" />}
      <span>
        Updated{" "}
        <time dateTime={lastUpdated} title={formatMatchTime(lastUpdated)}>
          {formatAge(lastUpdated, now)}
        </time>
        {refreshFailed ? " · couldn't refresh" : stale ? " · may be out of date" : ""}
      </span>
    </p>
  );
}
