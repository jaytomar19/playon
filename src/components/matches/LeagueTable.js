import TeamBadge from "./TeamBadge";

const NUMBER_CELL = "px-1.5 py-2 text-right tabular";

// The competition table with this match's two teams highlighted.
export default function LeagueTable({ standings, competitionName, highlightIds }) {
  const title = [competitionName, standings.group].filter(Boolean).join(" · ");

  return (
    <section aria-labelledby="table-heading" className="flex flex-col gap-2 border-t border-line pt-5">
      <h2 id="table-heading" className="font-display text-xl font-bold uppercase">
        League table
      </h2>
      {title && <p className="text-xs text-muted">{title}</p>}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-xs text-muted">
            <th scope="col" className="w-8 py-2 text-left font-semibold">
              <abbr title="Position">#</abbr>
            </th>
            <th scope="col" className="py-2 text-left font-semibold">Club</th>
            <th scope="col" className={`${NUMBER_CELL} font-semibold`}>
              <abbr title="Played">P</abbr>
            </th>
            <th scope="col" className={`${NUMBER_CELL} hidden font-semibold sm:table-cell`}>
              <abbr title="Won">W</abbr>
            </th>
            <th scope="col" className={`${NUMBER_CELL} hidden font-semibold sm:table-cell`}>
              <abbr title="Drawn">D</abbr>
            </th>
            <th scope="col" className={`${NUMBER_CELL} hidden font-semibold sm:table-cell`}>
              <abbr title="Lost">L</abbr>
            </th>
            <th scope="col" className={`${NUMBER_CELL} font-semibold`}>
              <abbr title="Goal difference">GD</abbr>
            </th>
            <th scope="col" className={`${NUMBER_CELL} font-semibold`}>
              <abbr title="Points">Pts</abbr>
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.rows.map((row) => {
            const inMatch = highlightIds.includes(row.team.id);
            return (
              <tr
                key={row.team.id}
                className={`border-b border-line last:border-0 ${inMatch ? "bg-accent/15 font-semibold" : ""}`}
              >
                <td className="py-2 tabular text-muted">{row.position}</td>
                <td className="py-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <TeamBadge team={row.team} sport="football" small />
                    <span className="truncate">{row.team.name}</span>
                    {inMatch && <span className="sr-only">(playing in this match)</span>}
                  </span>
                </td>
                <td className={NUMBER_CELL}>{row.played}</td>
                <td className={`${NUMBER_CELL} hidden sm:table-cell`}>{row.won}</td>
                <td className={`${NUMBER_CELL} hidden sm:table-cell`}>{row.draw}</td>
                <td className={`${NUMBER_CELL} hidden sm:table-cell`}>{row.lost}</td>
                <td className={NUMBER_CELL}>
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>
                <td className={`${NUMBER_CELL} font-bold`}>{row.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
