"use client";

import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import MatchFilters from "@/components/filters/MatchFilters";
import SportTabs from "@/components/filters/SportTabs";
import { useFavourites } from "@/hooks/useFavourites";
import { useSportsData } from "@/hooks/useSportsData";
import { CLIENT_LIVE_REFRESH_MS } from "@/lib/sports/config";
import { favouritesFirst, filterMatches, listCompetitions } from "@/lib/sports/matchFilters";
import MatchSection from "./MatchSection";

function SportBoard({ sport }) {
  // Each list is fetched once here and shared with its section.
  const live = useSportsData(`/api/${sport}/live`, { refreshMs: CLIENT_LIVE_REFRESH_MS });
  const fixtures = useSportsData(`/api/${sport}/fixtures`);
  const results = useSportsData(`/api/${sport}/results`);

  const [competitionId, setCompetitionId] = useState("");
  const [query, setQuery] = useState("");
  const { favourites } = useFavourites();

  const competitions = useMemo(
    () => listCompetitions([...(live.data ?? []), ...(fixtures.data ?? []), ...(results.data ?? [])]),
    [live.data, fixtures.data, results.data],
  );

  const filtersActive = competitionId !== "" || query.trim() !== "";
  const prepare = (data) => favouritesFirst(filterMatches(data ?? [], { competitionId, query }), favourites);

  const notice = live.meta?.notice ?? fixtures.meta?.notice ?? results.meta?.notice;
  const name = sport;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <MatchFilters
          competitions={competitions}
          competitionId={competitionId}
          onCompetitionChange={setCompetitionId}
          query={query}
          onQueryChange={setQuery}
        />
        {notice && (
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Info size={14} aria-hidden="true" />
            {notice} Filters and search cover only the matches loaded below.
          </p>
        )}
      </div>

      <MatchSection
        id={`${sport}-live`}
        title="Live"
        result={live}
        matches={prepare(live.data)}
        filtersActive={filtersActive}
        emptyMessage={`No ${name} matches are live right now.`}
      />
      <MatchSection
        id={`${sport}-fixtures`}
        title="Upcoming"
        result={fixtures}
        matches={prepare(fixtures.data)}
        filtersActive={filtersActive}
        emptyMessage={`No upcoming ${name} fixtures in the next 7 days.`}
      />
      <MatchSection
        id={`${sport}-results`}
        title="Results"
        result={results}
        matches={prepare(results.data)}
        filtersActive={filtersActive}
        emptyMessage={`No ${name} results from the last 7 days.`}
      />
    </div>
  );
}

/**
 * Live, upcoming and recent matches for one sport, with filters.
 * With `showSportTabs`, visitors can switch sport in place (homepage).
 */
export default function MatchBoard({ initialSport = "cricket", showSportTabs = false }) {
  const [sport, setSport] = useState(initialSport);

  return (
    <div className="flex flex-col gap-6">
      {showSportTabs && <SportTabs sport={sport} onChange={setSport} />}
      {/* `key` gives each sport a fresh board, so data and filters never mix. */}
      <SportBoard key={sport} sport={sport} />
    </div>
  );
}
