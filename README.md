# Playon

Playon is a responsive live-score website for **cricket** and **football**. It
shows real data from external sports APIs — live scores, upcoming fixtures,
recent results and basic match details. It never invents scores: when data is
unavailable, the site says so.

## Features (V1)

- Live scores, upcoming fixtures (next 7 days) and recent results (last 7 days)
- Match details — cricket: teams, every innings with overs, status, venue, toss;
  football: teams, goals, match minute, status, final result, half-time score,
  venue, round. Only fields the provider sends.
- Honest "Updated X ago" indicator, with an out-of-date warning
- Sport tabs, competition filter, team/competition search
- Favourite teams (shown first) and dark/light theme, saved in the browser
- Loading, error and empty states; responsive layout; SEO metadata

Out of scope: accounts, mobile app, news, notifications, betting, fantasy,
social features, AI features and other sports.

## Tech stack

Next.js 16 (App Router) · React 19 · JavaScript · Tailwind CSS 4 · Lucide icons ·
Next.js Route Handlers · Vercel

## Getting started

Requires Node.js 20.9+ and npm.

```bash
npm install
cp .env.example .env.local   # add your API keys (see below)
npm run dev                  # http://localhost:3000
```

Without keys the site still runs and shows "This score source has not been
configured yet" in each data section.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Node's built-in test runner) |

## API keys

| Variable | Provider | Sign up |
| --- | --- | --- |
| `CRICKET_API_KEY` | CricketData.org | https://cricketdata.org/ |
| `FOOTBALL_API_KEY` | football-data.org | https://www.football-data.org/client/register |

Keys live only in `.env.local` (ignored by Git) and in Vercel's project settings,
and are read only on the server. Never give them a `NEXT_PUBLIC_` prefix — Next.js
copies those variables into the JavaScript sent to browsers.

## Known data limitations

- **Football scores are delayed** on football-data.org's free plan, which covers 12
  competitions (Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Champions
  League, and others).
- **Cricket refreshes about every 20 minutes** to stay inside CricketData.org's
  100 calls/day, and only matches from 7 days either side of today are available.
  Each cricket match page opened uses one extra call (cached per match).
- No team logos (provider image terms). See [DECISIONS.md](DECISIONS.md).
- **Development tip:** a hard refresh (Ctrl+Shift+R) or "Disable cache" in DevTools
  makes `npm run dev` skip the server cache and call the providers directly. Use a
  normal refresh to avoid spending the cricket quota.

## How it works

```
Browser ──► /api/{sport}/{live|fixtures|results} ──► provider adapter ──► sports API
   ▲                (Route Handler, server)              (adds API key)
   └──────── Playon JSON ◄── normalizer ◄── fetch cache ◄──────┘
```

- **Pages** (`src/app`) render the layout on the server. The match lists are
  client components that call Playon's own `/api` endpoints, so filters, search
  and favourites work instantly in the browser.
- **Route Handlers** (`src/app/api`) validate input and return one consistent
  shape: `{ success, sport, category, data, meta: { lastUpdated, source } }` or
  `{ success: false, error: { code, message } }`.
- **Provider adapters** (`src/lib/providers`) are the only code that knows
  provider URLs and keys. **Normalizers** (`src/lib/sports`) convert each
  provider's JSON into Playon's match shape, so swapping a provider doesn't
  touch the UI.
- **Caching:** provider responses are cached with Next.js's `fetch` cache, so all
  visitors share one cached answer. Policy and reasoning: [DECISIONS.md](DECISIONS.md).
- **Match detail pages** (`/match/[sport]/[matchId]`) are rendered on the server
  directly from the same data layer.

### Folder layout

```
src/
├── app/                 Pages, layout, error/loading/404, and api/ Route Handlers
├── components/
│   ├── layout/          Header, footer, logo, theme toggle, hero art
│   ├── matches/         Match board, sections, cards, badges, timestamps
│   ├── filters/         Sport tabs, competition filter, search
│   └── states/          Loading, error and empty states
├── hooks/               useSportsData, useFavourites, useNow
└── lib/
    ├── api/             Response helpers, validation, shared route logic
    ├── providers/       CricketData.org and football-data.org adapters
    ├── sports/          Normalizers, categories, filters, refresh policy
    └── utils/           Small helpers (time formatting, slugs)
tests/                   Unit tests
```

## Deployment (Vercel)

1. Push the repository to GitHub and import it in Vercel.
2. Add `CRICKET_API_KEY` and `FOOTBALL_API_KEY` under Project → Settings →
   Environment Variables.
3. Deploy, then run through this launch checklist on the live site:
   - Home, Cricket and Football pages load real data (or honest empty states).
   - A match detail page opens from a card.
   - Theme and a favourite team survive a page refresh.
   - `/robots.txt` and `/sitemap.xml` show the real site address.
   - Search the browser DevTools Network tab: no request goes to a provider and no
     API key appears anywhere.
   - After a day, check CricketData.org's member area to confirm usage stays
     under 100 calls/day.
