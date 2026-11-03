# Playon

Playon is a responsive live-score website for **cricket** and **football**. It
shows real data from external sports APIs — live scores, upcoming fixtures,
recent results and basic match details. It never invents scores: when data is
unavailable, the site says so.

> **Status:** Phase 1 (foundation) of 5. The site runs, but no sports data
> provider is connected yet.

## V1 scope

- Live cricket and football scores, upcoming fixtures, recent results
- Basic match details (only fields the provider actually supplies)
- Last-updated indicator
- Sport and competition filters, team and competition search
- Favourite teams and dark/light theme, stored in the browser (`localStorage`)
- Loading, error and empty states; responsive layout; SEO metadata

Out of scope for V1: accounts, mobile app, news, notifications, betting,
fantasy, social features, AI features and other sports.

## Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js (App Router) |
| UI | React |
| Language | JavaScript |
| Styling | Tailwind CSS |
| Backend endpoints | Next.js Route Handlers |
| Hosting | Vercel |

## Prerequisites

- Node.js 20.9 or newer (developed with Node 24)
- npm

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in values (not needed until Phase 3)
npm run dev                  # http://localhost:3000
```

### Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Create an optimised production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Check the code with ESLint |

## Environment variables

API keys live only in `.env.local` (ignored by Git) and in Vercel's project
settings. They are read exclusively on the server. They must **never** use the
`NEXT_PUBLIC_` prefix, because Next.js copies `NEXT_PUBLIC_` variables into the
JavaScript sent to the browser. See `.env.example` for the variable names.

## Architecture

```
Browser ──► Playon pages ──► /api/... Route Handlers ──► provider adapter ──► sports API
                                     ▲                         │
                                     └── normalised JSON ◄─────┘
```

The browser only calls Playon's own `/api/...` endpoints. Route Handlers run on
the server, attach the secret API key, call the provider, convert the response
into Playon's own data shape and return it. Swapping a provider means changing
its adapter, not the UI.

**Caching:** the project uses Next.js *Cache Components* (`cacheComponents: true`
in `next.config.mjs`). Nothing is cached unless we opt in with the
`"use cache"` directive, which lets us set exact cache lifetimes per data type
once provider limits are known.

### Folder layout

```
src/
├── app/           Pages, layouts and (later) /api Route Handlers
└── components/    Reusable React components, grouped by purpose
```

More folders (`lib/providers`, `lib/sports`, `hooks`, …) are added when they
receive real code.

## Data providers

Not selected yet. Providers will be researched, compared and approved in
Phase 3. Known free-tier limitations will be documented here.

## Deployment

Planned for Vercel in Phase 5. Environment variables must be added in the
Vercel project settings.
