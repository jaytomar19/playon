// A short-code tile in place of a logo (provider logos aren't used: see
// DECISIONS.md). Falls back to the first letters of the team name.
export default function TeamBadge({ team, sport, large = false }) {
  const code = (team.shortName || team.name.slice(0, 3)).slice(0, 4).toUpperCase();
  const ring = sport === "cricket" ? "border-cricket" : "border-football";
  const size = large ? "h-14 w-14 text-lg" : "h-9 w-9 text-xs";

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-lg border-2 bg-surface-2 font-display font-bold tracking-wide ${ring} ${size}`}
    >
      {code}
    </span>
  );
}
