import EmptyState from "@/components/states/EmptyState";
import ErrorState from "@/components/states/ErrorState";
import LoadingState from "@/components/states/LoadingState";
import LastUpdated from "./LastUpdated";
import MatchCard from "./MatchCard";

/**
 * One list (Live, Upcoming or Results) with all its data states:
 * loading → error → empty → no filter matches → cards.
 */
export default function MatchSection({ id, title, result, matches, emptyMessage, filtersActive }) {
  const total = result.data?.length ?? 0;

  let body;
  if (result.status === "loading") {
    body = <LoadingState label={`Loading ${title.toLowerCase()}`} />;
  } else if (result.status === "error") {
    // Retrying can't fix a missing API key, so no button in that case.
    const canRetry = result.error.code !== "NOT_CONFIGURED";
    body = <ErrorState message={result.error.message} onRetry={canRetry ? result.retry : null} />;
  } else if (total === 0) {
    body = <EmptyState message={emptyMessage} />;
  } else if (matches.length === 0 && filtersActive) {
    body = <EmptyState message="No matches fit your search or competition filter." />;
  } else {
    body = (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    );
  }

  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id={id} className="font-display text-2xl font-bold uppercase tracking-wide">
          {title}
          {result.status === "success" && (
            <span className="ml-2 text-base text-muted tabular">
              {filtersActive && matches.length !== total ? `${matches.length} of ${total}` : total}
            </span>
          )}
        </h2>
        {result.status === "success" && (
          <LastUpdated
            lastUpdated={result.meta?.lastUpdated}
            staleAfterSeconds={result.meta?.staleAfterSeconds}
            refreshFailed={result.refreshFailed}
          />
        )}
      </div>
      {body}
    </section>
  );
}
