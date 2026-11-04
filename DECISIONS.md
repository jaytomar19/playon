# Playon — key decisions

## Data providers (approved 2026-11-03)

| | Cricket | Football |
| --- | --- | --- |
| Provider | [CricketData.org](https://cricketdata.org/) (CricAPI) | [football-data.org](https://www.football-data.org/) v4 |
| Plan | Free: 100 calls/day | Free: 10 calls/minute, 12 competitions |
| Live data | Yes; "most data delayed by a few minutes" | **Delayed** on the free plan (live costs €12/month) |
| Endpoints used | `GET /v1/cricScore` (live + 7 days either side) | `GET /v4/matches` (`status=LIVE` or a date range), `GET /v4/matches/{id}` |
| Terms | Personal, non-commercial use; no image hotlinking; fair use | Terms page could not be checked — verify before launch |

Chosen as the best-documented free options. API-Football was not chosen because its
free-plan season limits could not be verified.

**Verified with a real key (2026-11-04):** CricAPI's `cricScore` field names match the
normalizer; one response held 134 matches (16 live, 49 fixtures, 69 results) and all
parsed. Two findings: `matchType` can be empty, and for multi-day (Test/first-class)
matches the feed sends **one innings per team**, so those cards say so. The response
also echoes the API key in an `apikey` field, which Playon never passes on.

**Football verified with a real key (2026-11-04):** field names match; 213 matches
from 10 competitions all parsed. The free plan sends **no `minute`** and
**`venue: null`** (both appear to need a paid tier), so live football shows "LIVE"
without a minute and no venue. Half-time score and round are available. The exact
size of the free-plan score delay is not documented.

## Scope change: richer match details (approved 2026-11-04)

The project owner approved extending match detail pages beyond the original V1 fields:

- **Cricket:** every innings (team, innings number, runs/wickets, overs), venue, toss —
  from CricAPI's `match_info` endpoint.
- **Football:** round (matchday or cup stage) and half-time score, plus venue if a
  paid plan ever supplies it. These are already in the match lists, so football
  detail pages are served from the cached lists at no extra cost; only a match
  outside the lists' dates triggers a separate call. (Found when the 10 calls/minute
  limit was hit during testing.)

Lineups, scorecards, commentary and statistics remain out of scope.

Cost: each cricket detail page opened calls `match_info` once (1 of 100 daily calls).
To limit this, it is only called for matches already in the cached `cricScore` list
(so made-up IDs cost nothing) and cached per match: 24 h once finished, 20 min while
live, 6 h before the start. If the call fails or the quota is used up, the page still
shows the basic details and says the extra details are unavailable.

`match_info` innings labels are inconsistent ("sikkim Inning 1",
"Manipur,Sikkim Inning 1"); the batting team is the name before the comma, which was
checked against `cricScore`. Labels that don't match a team are shown as-is.

## Refresh / cache policy

Provider responses are cached on the server with Next.js's `fetch` cache, so every
visitor shares the same cached answer and traffic does not spend quota.

| Data | Cache time | Why |
| --- | --- | --- |
| Cricket (all lists + details) | 20 min | 100 calls/day → at most 72 calls/day, leaving headroom |
| Football live | 60 s | Comfortably within 10 calls/min |
| Football fixtures / results | 30 min / 10 min | Change rarely |
| Football match details | From the cached lists; 60 s for older matches | Avoids the 10/min limit |

Browsers re-check Playon's own live endpoints every 60 s (only while the tab is
visible). That reads our cache, not the provider.

The browser asks for the three cricket lists at once. Simultaneous requests share one
in-progress provider call (`cricketProvider.js`), so they don't triple usage. This
only works within one server instance — if Vercel runs several, usage can be higher,
so check the CricketData.org dashboard after launch and raise the cache time if needed.

Cricket match details are looked up in the cached `cricScore` list instead of calling
the provider again — so only recent/upcoming cricket matches have detail pages.

All values live in `src/lib/sports/config.js`.

## Caching mechanism: `fetch` cache, not Cache Components

Next.js 16 enables "Cache Components" by default. Its `"use cache"` memory cache is not
shared between serverless instances on Vercel, which would multiply provider calls and
exhaust the cricket quota. The classic `fetch` cache (`next: { revalidate }`) is
persisted by Vercel, so it was used instead and Cache Components was turned off.

## Honest timestamps

"Updated X ago" uses the provider response's `Date` header, which is preserved in the
cache — so cached data shows its true age. Data older than a per-list threshold is
marked "may be out of date". If a browser refresh fails, the previous data stays with a
"couldn't refresh" note.

## No team logos

CricketData.org's terms forbid hotlinking its images, and football-data.org's crest
terms could not be verified. Teams are shown with short-code badges instead.

## Team IDs for favourites

Favourites are stored as `sport:teamId` (e.g. `football:57`). football-data.org provides
numeric team IDs. `cricScore` provides no team IDs, so cricket uses a slug of the team
name (`cricket:india`) — stable as long as the provider's team name stays the same.

## No Supabase, no shadcn/ui

Favourites and theme live in `localStorage`; no V1 feature needs a database. Native
HTML controls (select, search input, buttons) styled with Tailwind covered every UI
need, so shadcn/ui and its extra dependencies were not added.

## Tests

Unit tests use Node's built-in test runner (`npm test`) — no extra dependency.
