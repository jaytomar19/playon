import { Search } from "lucide-react";

// Competition dropdown + team/competition search. Options come only from
// the matches that were actually loaded.
export default function MatchFilters({ competitions, competitionId, onCompetitionChange, query, onQueryChange }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <label className="flex flex-col gap-1 text-xs font-semibold text-muted">
        Competition
        <select
          value={competitionId}
          onChange={(event) => onCompetitionChange(event.target.value)}
          className="h-10 rounded-lg border border-line bg-surface px-3 text-sm font-normal text-foreground sm:w-56"
        >
          <option value="">All competitions</option>
          {competitions.map((competition) => (
            <option key={competition.id} value={competition.id}>
              {competition.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-1 flex-col gap-1 text-xs font-semibold text-muted">
        Search
        <span className="relative">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Team or competition"
            className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm font-normal text-foreground placeholder:text-muted"
          />
        </span>
      </label>
    </div>
  );
}
