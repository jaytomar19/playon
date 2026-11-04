import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import CricketScore from "@/components/matches/CricketScore";
import FavouriteButton from "@/components/matches/FavouriteButton";
import LastUpdated from "@/components/matches/LastUpdated";
import LeagueTable from "@/components/matches/LeagueTable";
import LocalTime from "@/components/matches/LocalTime";
import StatusBadge from "@/components/matches/StatusBadge";
import TeamBadge from "@/components/matches/TeamBadge";
import ErrorState from "@/components/states/ErrorState";
import { getErrorMessage } from "@/lib/api/responses";
import { isValidMatchId, isValidSport } from "@/lib/api/validation";
import { ProviderError } from "@/lib/providers/fetchProvider";
import { getMatch, getMatchStandings } from "@/lib/sports/getMatches";

// Loads the match, turning failures into a value instead of a crash.
// Next.js de-duplicates the identical fetch made by generateMetadata.
async function loadMatch(sport, matchId) {
  if (!isValidSport(sport) || !isValidMatchId(sport, matchId)) return { notFound: true };
  try {
    const { match, meta } = await getMatch(sport, matchId);
    return match ? { match, meta } : { notFound: true };
  } catch (error) {
    const code = error instanceof ProviderError ? error.code : "SPORTS_DATA_UNAVAILABLE";
    return { errorMessage: getErrorMessage(code) };
  }
}

export async function generateMetadata({ params }) {
  const { sport, matchId } = await params;
  const result = await loadMatch(sport, matchId);
  if (!result.match) return { title: "Match" };
  const [a, b] = result.match.teams;
  return {
    title: `${a.name} vs ${b.name}`,
    description: `${a.name} vs ${b.name}${
      result.match.competition ? ` — ${result.match.competition.name}` : ""
    }. Score and match status on Playon.`,
  };
}

function TeamPanel({ match, team }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      <TeamBadge team={team} sport={match.sport} large />
      <div className="flex items-center gap-1">
        <h2 className="font-display text-2xl font-bold uppercase">{team.name}</h2>
        <FavouriteButton sport={match.sport} team={team} />
      </div>
      {match.sport === "football" ? (
        team.goals !== null && (
          <p className="font-display text-6xl font-bold tabular">{team.goals}</p>
        )
      ) : (
        <CricketScore score={team.score} large />
      )}
      {match.sport === "football" && <p className="text-xs uppercase text-muted">{team.side}</p>}
    </div>
  );
}

// Every innings in batting order, as sent by the provider.
function InningsList({ innings }) {
  return (
    <section aria-labelledby="innings-heading" className="flex flex-col gap-2 border-t border-line pt-5">
      <h2 id="innings-heading" className="font-display text-xl font-bold uppercase">
        Innings
      </h2>
      <ol className="flex flex-col divide-y divide-line">
        {innings.map((inning, index) => (
          <li key={index} className="flex items-baseline justify-between gap-3 py-2">
            <span className="min-w-0">
              {inning.team ? (
                <>
                  <span className="font-semibold">{inning.team}</span>{" "}
                  <span className="text-sm text-muted">{inning.label}</span>
                </>
              ) : (
                <span className="text-muted">{inning.label ?? `Innings ${index + 1}`}</span>
              )}
            </span>
            <span className="flex shrink-0 items-baseline gap-1.5">
              <span className="font-display text-xl font-bold tabular">
                {inning.wickets === null ? inning.runs : `${inning.runs}/${inning.wickets}`}
              </span>
              {inning.overs !== null && (
                <span className="text-xs text-muted tabular">({inning.overs} ov)</span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Detail({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default async function MatchPage({ params }) {
  const { sport, matchId } = await params;
  const result = await loadMatch(sport, matchId);
  if (result.notFound) notFound();

  const backLink = (
    <Link
      href={`/${sport}`}
      className="flex w-fit items-center gap-1 text-sm font-semibold text-muted hover:text-foreground"
    >
      <ChevronLeft size={16} aria-hidden="true" />
      All {sport} matches
    </Link>
  );

  if (result.errorMessage) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <h1 className="font-display text-4xl font-bold uppercase">Match details</h1>
        <ErrorState message={result.errorMessage} />
      </div>
    );
  }

  const { match, meta } = result;
  const details = match.details;
  const standings = await getMatchStandings(match);
  const accent = sport === "cricket" ? "border-t-cricket" : "border-t-football";

  return (
    <div className="flex flex-col gap-6">
      {backLink}

      <article className={`flex flex-col gap-6 rounded-2xl border border-line border-t-4 bg-surface p-5 sm:p-8 ${accent}`}>
        <header className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted">
            {match.competition?.name ?? "Competition not listed"}
          </p>
          <StatusBadge status={match.status} minute={match.minute} />
        </header>

        <h1 className="sr-only">
          {match.teams[0].name} vs {match.teams[1].name}
        </h1>

        <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-start">
          <TeamPanel match={match} team={match.teams[0]} />
          <p aria-hidden="true" className="self-center font-display text-xl font-bold text-muted">
            VS
          </p>
          <TeamPanel match={match} team={match.teams[1]} />
        </div>

        {match.statusText && (
          <p className="text-center text-lg font-semibold">
            {match.statusText}
            {match.durationText && <span className="text-muted"> · {match.durationText}</span>}
          </p>
        )}
        {match.scoreNote && <p className="text-center text-sm text-muted">{match.scoreNote}</p>}

        {details?.innings?.length > 0 && <InningsList innings={details.innings} />}

        <dl className="grid gap-4 border-t border-line pt-5 text-sm sm:grid-cols-3">
          {match.startTime && (
            <Detail label="Start time">
              <LocalTime iso={match.startTime} />
            </Detail>
          )}
          {match.matchType && <Detail label="Format">{match.matchType}</Detail>}
          {details?.round && <Detail label="Round">{details.round}</Detail>}
          {details?.venue && <Detail label="Venue">{details.venue}</Detail>}
          {details?.toss && <Detail label="Toss">{details.toss}</Detail>}
          {details?.halfTime && (
            <Detail label="Half-time">
              <span className="tabular">
                {match.teams[0].shortName ?? match.teams[0].name} {details.halfTime.home} –{" "}
                {details.halfTime.away} {match.teams[1].shortName ?? match.teams[1].name}
              </span>
            </Detail>
          )}
          {match.sport === "football" && match.status === "live" && (
            <Detail label="Match minute">
              {match.minute != null ? `${match.minute}′` : "Not provided"}
            </Detail>
          )}
          {match.providerUpdatedAt && (
            <Detail label="Provider last changed">
              <LocalTime iso={match.providerUpdatedAt} />
            </Detail>
          )}
        </dl>

        {standings && (
          <LeagueTable
            standings={standings}
            competitionName={match.competition?.name}
            highlightIds={match.teams.map((team) => team.id)}
          />
        )}

        <footer className="flex flex-col gap-1 border-t border-line pt-4 text-xs text-muted">
          <LastUpdated lastUpdated={meta.lastUpdated} staleAfterSeconds={meta.staleAfterSeconds} />
          {match.detailsUnavailable && (
            <p>Extra match details (innings, venue, toss) are unavailable right now.</p>
          )}
          <p>
            Source: {meta.source}. {meta.notice}
          </p>
        </footer>
      </article>
    </div>
  );
}
