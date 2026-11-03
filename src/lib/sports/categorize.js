// Which normalized statuses belong in each list, and how each list is sorted.
const CATEGORY_RULES = {
  live: { statuses: ["live"], newestFirst: false },
  fixtures: { statuses: ["upcoming", "postponed"], newestFirst: false },
  results: { statuses: ["completed", "cancelled"], newestFirst: true },
};

function timeOf(match) {
  const time = match.startTime ? Date.parse(match.startTime) : NaN;
  return Number.isNaN(time) ? Infinity : time;
}

export function selectCategory(matches, category) {
  const rule = CATEGORY_RULES[category];
  const selected = matches.filter((match) => rule.statuses.includes(match.status));
  selected.sort((a, b) => timeOf(a) - timeOf(b));
  if (rule.newestFirst) selected.reverse();
  return selected;
}
