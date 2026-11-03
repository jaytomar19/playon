import assert from "node:assert/strict";
import { test } from "node:test";
import { selectCategory } from "../src/lib/sports/categorize.js";
import {
  favouritesFirst,
  filterMatches,
  listCompetitions,
  matchesSearch,
} from "../src/lib/sports/matchFilters.js";

function makeMatch(id, status, startTime, home, away, competition) {
  return {
    id,
    sport: "football",
    status,
    startTime,
    competition,
    teams: [
      { id: home.toLowerCase(), name: home, shortName: home.slice(0, 3).toUpperCase() },
      { id: away.toLowerCase(), name: away, shortName: away.slice(0, 3).toUpperCase() },
    ],
  };
}

const PL = { id: "pl", name: "Premier League" };
const LL = { id: "ll", name: "La Liga" };
const matches = [
  makeMatch("1", "completed", "2026-11-01T15:00:00Z", "Arsenal", "Chelsea", PL),
  makeMatch("2", "upcoming", "2026-11-05T15:00:00Z", "Barcelona", "Sevilla", LL),
  makeMatch("3", "completed", "2026-11-02T15:00:00Z", "Everton", "Fulham", PL),
  makeMatch("4", "postponed", "2026-11-04T15:00:00Z", "Getafe", "Girona", LL),
  makeMatch("5", "live", "2026-11-03T15:00:00Z", "Leeds", "Burnley", PL),
];

test("search ignores case and surrounding spaces", () => {
  assert.ok(matchesSearch(matches[0], "  ARSENAL "));
  assert.ok(matchesSearch(matches[0], "premier"));
  assert.ok(matchesSearch(matches[0], "che"));
  assert.ok(!matchesSearch(matches[0], "barcelona"));
  assert.ok(matchesSearch(matches[0], "   "), "blank search matches everything");
});

test("filters by competition and search together", () => {
  assert.deepEqual(filterMatches(matches, { competitionId: "ll" }).map((m) => m.id), ["2", "4"]);
  assert.deepEqual(filterMatches(matches, { competitionId: "pl", query: "everton" }).map((m) => m.id), ["3"]);
  assert.deepEqual(filterMatches(matches, { query: "nobody" }), []);
});

test("lists unique competitions sorted by name", () => {
  assert.deepEqual(listCompetitions(matches), [LL, PL]);
  assert.deepEqual(listCompetitions([{ ...matches[0], competition: null }]), []);
});

test("puts favourite teams' matches first", () => {
  const ordered = favouritesFirst(matches, ["football:everton"]);
  assert.equal(ordered[0].id, "3");
  assert.equal(ordered.length, matches.length);
  assert.equal(favouritesFirst(matches, []), matches);
});

test("selects and sorts categories", () => {
  assert.deepEqual(selectCategory(matches, "live").map((m) => m.id), ["5"]);
  assert.deepEqual(selectCategory(matches, "fixtures").map((m) => m.id), ["4", "2"]);
  assert.deepEqual(selectCategory(matches, "results").map((m) => m.id), ["3", "1"], "newest first");
});
