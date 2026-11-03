// Pure helpers for the competition filter, search and favourites ordering.
// They run in the browser on data that has already been loaded.

export function normalizeQuery(query) {
  return String(query ?? "").trim().toLowerCase();
}

export function matchesSearch(match, query) {
  const q = normalizeQuery(query);
  if (q === "") return true;
  const haystack = [
    match.competition?.name,
    ...match.teams.flatMap((team) => [team.name, team.shortName]),
  ];
  return haystack.some((value) => value && value.toLowerCase().includes(q));
}

export function filterMatches(matches, { competitionId = "", query = "" } = {}) {
  return matches.filter(
    (match) =>
      (competitionId === "" || match.competition?.id === competitionId) &&
      matchesSearch(match, query),
  );
}

// Unique competitions present in the loaded matches, sorted by name.
export function listCompetitions(matches) {
  const byId = new Map();
  for (const match of matches) {
    if (match.competition?.id && !byId.has(match.competition.id)) {
      byId.set(match.competition.id, match.competition);
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function favouriteKey(sport, teamId) {
  return `${sport}:${teamId}`;
}

export function involvesFavourite(match, favourites) {
  return match.teams.some((team) => favourites.includes(favouriteKey(match.sport, team.id)));
}

// Moves matches involving a favourite team to the front, keeping order otherwise.
export function favouritesFirst(matches, favourites) {
  if (favourites.length === 0) return matches;
  const fav = matches.filter((match) => involvesFavourite(match, favourites));
  const rest = matches.filter((match) => !involvesFavourite(match, favourites));
  return [...fav, ...rest];
}
