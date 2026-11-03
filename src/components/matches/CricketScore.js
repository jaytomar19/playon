// Shows a cricket score as the provider gave it. When the text could be
// parsed into innings, runs/wickets are emphasised and overs shown smaller.
export default function CricketScore({ score, large = false }) {
  if (!score) return null;
  const runsSize = large ? "text-3xl" : "text-xl";

  if (!score.innings) {
    return <span className={`font-display font-bold tabular ${runsSize}`}>{score.text}</span>;
  }

  const last = score.innings[score.innings.length - 1];

  return (
    <span className="flex items-baseline justify-end gap-1.5 whitespace-nowrap">
      <span className={`font-display font-bold tabular ${runsSize}`}>
        {score.innings
          .map((inning) => (inning.wickets === null ? inning.runs : `${inning.runs}/${inning.wickets}`))
          .join(" & ")}
      </span>
      {last.overs !== null && (
        <span className="text-xs text-muted tabular">({last.overs} ov)</span>
      )}
    </span>
  );
}
