import assert from "node:assert/strict";
import { test } from "node:test";
import {
  normalizeFootballList,
  normalizeFootballMatch,
  normalizeFootballStandings,
} from "../src/lib/sports/normalizeFootball.js";

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

test("adds venue, round and half-time when supplied", () => {
  const match = normalizeFootballMatch({
    ...finished,
    venue: "Emirates Stadium",
    matchday: 27,
    stage: "REGULAR_SEASON",
    score: { ...finished.score, halfTime: { home: 1, away: 0 } },
  });
  assert.deepEqual(match.details, {
    venue: "Emirates Stadium",
    round: "Matchday 27",
    halfTime: { home: 1, away: 0 },
  });

  const cup = normalizeFootballMatch({ ...finished, stage: "QUARTER_FINALS", matchday: null });
  assert.equal(cup.details.round, "Quarter finals");
  assert.equal(cup.details.venue, null);
  assert.equal(cup.details.halfTime, null);

  const leagueStage = normalizeFootballMatch({ ...finished, stage: "LEAGUE_STAGE", matchday: 4 });
  assert.equal(leagueStage.details.round, "League stage · Matchday 4");
});

// Copied from a real /v4/matches/{id} response (2026-11-04). The free plan
// sends `venue: null` and no `minute`.
test("handles a real free-plan match response", () => {
  const match = normalizeFootballMatch({
    id: 558553,
    utcDate: "2026-10-28T17:30:00Z",
    status: "FINISHED",
    venue: null,
    matchday: 9,
    stage: "REGULAR_SEASON",
    group: null,
    lastUpdated: "2026-11-04T00:20:29Z",
    competition: { id: 2019, name: "Serie A", code: "SA", type: "LEAGUE" },
    homeTeam: { id: 112, name: "Parma Calcio 1913", shortName: "Parma", tla: "PAR" },
    awayTeam: { id: 115, name: "Udinese Calcio", shortName: "Udinese", tla: "UDI" },
    score: { winner: "DRAW", duration: "REGULAR", fullTime: { home: 0, away: 0 }, halfTime: { home: 0, away: 0 } },
  });
  assert.equal(match.status, "completed");
  assert.equal(match.winner, "DRAW");
  assert.deepEqual(match.details, { venue: null, round: "Matchday 9", halfTime: { home: 0, away: 0 } });
  assert.equal(match.teams[0].goals, 0, "a real 0 is kept, not treated as missing");
});

test("keeps HTTPS crest links only", () => {
  const withCrest = normalizeFootballMatch({
    ...finished,
    homeTeam: { ...finished.homeTeam, crest: "https://crests.football-data.org/57.png" },
    awayTeam: { ...finished.awayTeam, crest: "http://insecure.example/61.png" },
  });
  assert.equal(withCrest.teams[0].logo, "https://crests.football-data.org/57.png");
  assert.equal(withCrest.teams[1].logo, null);
  assert.equal(normalizeFootballMatch(finished).teams[0].logo, null);
});

// Shaped like a real /v4/competitions/2019/standings response (2026-11-04).
const standingsResponse = {
  standings: [
    {
      stage: "REGULAR_SEASON",
      type: "TOTAL",
      group: null,
      table: [
        {
          position: 1,
          team: { id: 110, name: "SS Lazio", tla: "LAZ", crest: "https://crests.football-data.org/110.png" },
          playedGames: 10, form: null, won: 9, draw: 1, lost: 0, points: 28,
          goalsFor: 24, goalsAgainst: 8, goalDifference: 16,
        },
        {
          position: 2,
          team: { id: 112, name: "Parma Calcio 1913", tla: "PAR", crest: "https://crests.football-data.org/112.png" },
          playedGames: 10, form: null, won: 6, draw: 2, lost: 2, points: 20,
          goalsFor: 15, goalsAgainst: 10, goalDifference: 5,
        },
      ],
    },
  ],
};

test("normalizes a league table", () => {
  const table = normalizeFootballStandings(standingsResponse, ["112"]);
  assert.equal(table.group, null);
  assert.equal(table.rows.length, 2);
  assert.deepEqual(table.rows[0], {
    position: 1,
    team: { id: "110", name: "SS Lazio", shortName: "LAZ", logo: "https://crests.football-data.org/110.png" },
    played: 10, won: 9, draw: 1, lost: 0, goalDifference: 16, points: 28,
  });
});

test("picks the group table containing the match's teams", () => {
  const groups = {
    standings: [
      { type: "TOTAL", group: "GROUP_A", table: [{ position: 1, team: { id: 1, name: "A1" }, points: 3 }] },
      { type: "HOME", group: "GROUP_B", table: [{ position: 1, team: { id: 2, name: "B1" }, points: 3 }] },
      { type: "TOTAL", group: "GROUP_B", table: [{ position: 1, team: { id: 2, name: "B1" }, points: 3 }] },
    ],
  };
  const table = normalizeFootballStandings(groups, ["2"]);
  assert.equal(table.group, "Group B");
  assert.equal(table.rows[0].team.name, "B1");
});

test("returns null when there is no league table", () => {
  assert.equal(normalizeFootballStandings({ standings: [] }), null);
  assert.equal(normalizeFootballStandings(null), null);
  assert.equal(normalizeFootballStandings({ standings: [{ type: "TOTAL", table: [] }] }), null);
});

test("unknown statuses map to unknown", () => {
  assert.equal(normalizeFootballMatch({ ...finished, status: "SOMETHING_NEW" }).status, "unknown");
});

test("skips matches with undecided teams and invalid input", () => {
  const undecided = { ...finished, awayTeam: { id: null, name: null } };
  assert.deepEqual(normalizeFootballList([undecided, null, "x"]), []);
  assert.deepEqual(normalizeFootballList(undefined), []);
});
