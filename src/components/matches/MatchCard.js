import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CricketScore from "./CricketScore";
import FavouriteButton from "./FavouriteButton";
import LocalTime from "./LocalTime";
import StatusBadge from "./StatusBadge";
import TeamBadge from "./TeamBadge";

// One match in a list. Cricket and football share the frame but show their
// own score formats.

function TeamRow({ match, team }) {
  const isFootball = match.sport === "football";
  const lost =
    isFootball &&
    match.status === "completed" &&
    match.winner &&
    match.winner !== "DRAW" &&
    match.winner !== (team.side === "home" ? "HOME_TEAM" : "AWAY_TEAM");

  return (
    <li className="flex items-center gap-2">
      <TeamBadge team={team} sport={match.sport} />
      <span className={`min-w-0 flex-1 truncate font-semibold ${lost ? "text-muted" : ""}`}>
        {team.name}
      </span>
      <FavouriteButton sport={match.sport} team={team} />
      <span className="min-w-10 text-right">
        {isFootball ? (
          team.goals !== null && (
            <span className={`font-display text-2xl font-bold tabular ${lost ? "text-muted" : ""}`}>
              {team.goals}
            </span>
          )
        ) : (
          <CricketScore score={team.score} />
        )}
      </span>
    </li>
  );
}

function footerText(match) {
  if (match.sport === "football") {
    return [match.statusText, match.durationText].filter(Boolean).join(" · ");
  }
  return match.statusText;
}

export default function MatchCard({ match }) {
  const accent = match.sport === "cricket" ? "before:bg-cricket" : "before:bg-football";
  const text = footerText(match);

  return (
    <article
      className={`relative flex flex-col gap-3 overflow-hidden rounded-xl border border-line bg-surface p-4 pl-5 before:absolute before:inset-y-0 before:left-0 before:w-1 ${accent}`}
    >
      <header className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-muted">
          {match.competition?.name ?? "Competition not listed"}
          {match.matchType && <span className="ml-1.5 text-foreground">· {match.matchType}</span>}
        </p>
        <StatusBadge status={match.status} minute={match.minute} />
      </header>

      <ul className="flex flex-col gap-2">
        {match.teams.map((team, index) => (
          <TeamRow key={index} match={match} team={team} />
        ))}
      </ul>

      <footer className="flex items-end justify-between gap-3 border-t border-line pt-3 text-sm">
        <div className="min-w-0 text-muted">
          {text && <p className="text-foreground">{text}</p>}
          <LocalTime iso={match.startTime} className="text-xs" />
        </div>
        <Link
          href={`/match/${match.sport}/${encodeURIComponent(match.id)}`}
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-accent-text hover:underline"
        >
          Details
          <span className="sr-only">
            : {match.teams[0].name} vs {match.teams[1].name}
          </span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </footer>
    </article>
  );
}
