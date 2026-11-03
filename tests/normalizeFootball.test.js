import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeFootballList, normalizeFootballMatch } from "../src/lib/sports/normalizeFootball.js";

// Shaped like football-data.org's documented v4 Match example (test input only).
const finished = {
  id: 327117,
  utcDate: "2022-02-27T16:05:00Z",
  status: "FINISHED",
  minute: 90,
  lastUpdated: "2022-06-06T08:20:24Z",
  competition: { id: 2021, name: "Premier League" },
  homeTeam: { id: 57, name: "Arsenal FC", shortName: "Arsenal", tla: "ARS" },
  awayTeam: { id: 61, name: "Chelsea FC", shortName: "Chelsea", tla: "CHE" },
  score: { winner: "HOME_TEAM", duration: "REGULAR", fullTime: { home: 2, away: 1 } },
};

test("maps a finished match", () => {
  const match = normalizeFootballMatch(finished);
  assert.equal(match.id, "327117");
  assert.equal(match.status, "completed");
  assert.equal(match.statusText, "Full time");
  assert.deepEqual(match.competition, { id: "2021", name: "Premier League" });
  assert.equal(match.teams[0].name, "Arsenal FC");
  assert.equal(match.teams[0].shortName, "ARS");
  assert.equal(match.teams[0].goals, 2);
  assert.equal(match.teams[1].side, "away");
  assert.equal(match.winner, "HOME_TEAM");
  assert.equal(match.minute, null, "minute is only kept for live matches");
  assert.equal(match.providerUpdatedAt, "2022-06-06T08:20:24Z");
});

test("maps live statuses and keeps the minute", () => {
  const match = normalizeFootballMatch({ ...finished, status: "IN_PLAY", minute: 67 });
  assert.equal(match.status, "live");
  assert.equal(match.minute, 67);
  assert.equal(normalizeFootballMatch({ ...finished, status: "PAUSED" }).status, "live");
});

test("upcoming matches have no goals rather than 0", () => {
  const match = normalizeFootballMatch({
    ...finished,
    status: "TIMED",
    score: { winner: null, fullTime: { home: null, away: null } },
  });
  assert.equal(match.status, "upcoming");
  assert.equal(match.teams[0].goals, null);
});

test("missing optional fields stay null", () => {
  const { minute, lastUpdated, competition, ...bare } = finished;
  const match = normalizeFootballMatch({ ...bare, score: undefined });
  assert.equal(match.competition, null);
  assert.equal(match.teams[0].goals, null);
  assert.equal(match.providerUpdatedAt, null);
});

test("unknown statuses map to unknown", () => {
  assert.equal(normalizeFootballMatch({ ...finished, status: "SOMETHING_NEW" }).status, "unknown");
});

test("skips matches with undecided teams and invalid input", () => {
  const undecided = { ...finished, awayTeam: { id: null, name: null } };
  assert.deepEqual(normalizeFootballList([undecided, null, "x"]), []);
  assert.deepEqual(normalizeFootballList(undefined), []);
});
