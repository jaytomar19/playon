import assert from "node:assert/strict";
import { test } from "node:test";
import {
  normalizeCricketList,
  normalizeCricketMatch,
  parseCricketScore,
} from "../src/lib/sports/normalizeCricket.js";

// Shaped like CricketData.org's `cricScore` items (test input only; to be
// re-checked against a real response when an API key is available).
const live = {
  id: "a1b2c3d4-0000-1111-2222-333344445555",
  dateTimeGMT: "2026-11-03T09:30:00",
  matchType: "odi",
  status: "Australia opt to bat",
  ms: "live",
  t1: "Australia [AUS]",
  t2: "India [IND]",
  t1s: "245/6 (42.3)",
  t2s: "",
  series: "Australia tour of India, 2026",
};

test("parses simple and multi-innings scores", () => {
  assert.deepEqual(parseCricketScore("245/6 (42.3)"), [{ runs: 245, wickets: 6, overs: "42.3" }]);
  assert.deepEqual(parseCricketScore("180 & 95/3 (31)"), [
    { runs: 180, wickets: null, overs: null },
    { runs: 95, wickets: 3, overs: "31" },
  ]);
});

test("returns null for score text it cannot read", () => {
  assert.equal(parseCricketScore("Yet to bat"), null);
  assert.equal(parseCricketScore(""), null);
  assert.equal(parseCricketScore(undefined), null);
});

test("maps a live match", () => {
  const match = normalizeCricketMatch(live);
  assert.equal(match.sport, "cricket");
  assert.equal(match.status, "live");
  assert.equal(match.statusText, "Australia opt to bat");
  assert.equal(match.matchType, "ODI");
  assert.equal(match.startTime, "2026-11-03T09:30:00.000Z");
  assert.deepEqual(match.competition, {
    id: "australia-tour-of-india-2026",
    name: "Australia tour of India, 2026",
  });
  assert.equal(match.teams[0].name, "Australia");
  assert.equal(match.teams[0].shortName, "AUS");
  assert.equal(match.teams[0].id, "australia");
  assert.equal(match.teams[0].score.text, "245/6 (42.3)");
  assert.equal(match.teams[1].score, null, "no score is shown when none was supplied");
});

test("keeps unparseable score text as-is", () => {
  const match = normalizeCricketMatch({ ...live, t1s: "245-6 (DLS)" });
  assert.deepEqual(match.teams[0].score, { text: "245-6 (DLS)", innings: null });
});

test("maps fixture and result statuses", () => {
  assert.equal(normalizeCricketMatch({ ...live, ms: "fixture" }).status, "upcoming");
  assert.equal(normalizeCricketMatch({ ...live, ms: "result" }).status, "completed");
  assert.equal(normalizeCricketMatch({ ...live, ms: "other" }).status, "unknown");
});

test("handles missing optional fields and team names without codes", () => {
  const match = normalizeCricketMatch({ id: "x1", ms: "fixture", t1: "Nepal", t2: "Oman" });
  assert.equal(match.competition, null);
  assert.equal(match.startTime, null);
  assert.equal(match.teams[0].shortName, null);
  assert.equal(match.matchType, null);
});

// Copied from a real cricScore response (2026-11-04).
const realTest = {
  id: "real-test-1",
  dateTimeGMT: "2026-11-02T04:00:00",
  matchType: "test",
  status: "Day 3: Stumps - Sikkim lead by 224 runs",
  ms: "live",
  t1: "Manipur [MNP]",
  t2: "Sikkim [SKM]",
  t1s: "289/10 (108.2)",
  t2s: "81/0 (25)",
  series: "Ranji Trophy Plate 2026-27",
};

test("handles real multi-day matches and flags the one-innings limit", () => {
  const match = normalizeCricketMatch(realTest);
  assert.deepEqual(match.teams[0].score.innings, [{ runs: 289, wickets: 10, overs: "108.2" }]);
  assert.equal(match.matchType, "TEST");
  assert.match(match.scoreNote, /one innings per team/);
  assert.equal(normalizeCricketMatch({ ...realTest, matchType: "t20" }).scoreNote, null);
  assert.equal(
    normalizeCricketMatch({ ...realTest, ms: "fixture", t1s: "", t2s: "" }).scoreNote,
    null,
    "no note before any score exists",
  );
});

test("empty matchType becomes null and teams without codes still get IDs", () => {
  const match = normalizeCricketMatch({ ...realTest, matchType: "", t1: "Uae Bulls" });
  assert.equal(match.matchType, null);
  assert.equal(match.teams[0].id, "uae-bulls");
  assert.equal(match.teams[0].shortName, null);
});

test("skips invalid matches", () => {
  assert.deepEqual(normalizeCricketList([{ id: "x", t1: "A" }, null, {}]), []);
  assert.deepEqual(normalizeCricketList("nope"), []);
});
