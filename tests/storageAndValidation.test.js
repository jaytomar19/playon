import assert from "node:assert/strict";
import { test } from "node:test";
import { isValidMatchId, isValidSport } from "../src/lib/api/validation.js";
import { parseFavourites, toggleFavourite } from "../src/lib/favourites.js";

test("parseFavourites survives missing and corrupt values", () => {
  assert.deepEqual(parseFavourites(null), []);
  assert.deepEqual(parseFavourites(""), []);
  assert.deepEqual(parseFavourites("{not json"), []);
  assert.deepEqual(parseFavourites('{"a":1}'), []);
  assert.deepEqual(parseFavourites('["football:57", 5, "bad", "football:57"]'), ["football:57"]);
});

test("toggleFavourite adds and removes", () => {
  assert.deepEqual(toggleFavourite([], "cricket:india"), ["cricket:india"]);
  assert.deepEqual(toggleFavourite(["cricket:india"], "cricket:india"), []);
});

test("validates sport and match IDs", () => {
  assert.ok(isValidSport("cricket"));
  assert.ok(!isValidSport("tennis"));
  assert.ok(isValidMatchId("football", "327117"));
  assert.ok(!isValidMatchId("football", "abc"));
  assert.ok(isValidMatchId("cricket", "a1b2c3d4-0000-1111-2222-333344445555"));
  assert.ok(!isValidMatchId("cricket", "../secret"));
  assert.ok(!isValidMatchId("tennis", "1"));
});
