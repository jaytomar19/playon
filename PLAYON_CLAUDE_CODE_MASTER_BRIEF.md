# PLAYON --- Claude Code Master Project Brief

> **Purpose:** Master product, architecture and implementation brief for
> Claude Code.
>
> **Initial instruction:** Read this entire document and inspect the
> existing repository. Do not write application code, install packages,
> overwrite files or begin implementation yet. First return the planning
> deliverables in Section 17 and wait for explicit approval.

## 1. Project overview

**Playon** is a responsive, multi-sport live-score **website** initially
supporting: - Cricket - Football

The goal is a functional, production-quality portfolio project that
retrieves and displays real sports data through external APIs. This is
not a static UI demonstration.

The project must be completed in a short timeframe. Prioritize a
reliable, focused MVP over unnecessary abstractions, excessive features
or infrastructure.

### Product principles

-   Use real sports data. Never fabricate live scores, match minutes,
    overs, results or fixtures.
-   If data is unavailable, say so through a clear empty, unavailable or
    error state.
-   Keep V1 limited to cricket and football.
-   Keep code readable, beginner-friendly and maintainable.
-   Use reusable React components where they provide real value.
-   Protect API credentials on the server.
-   Avoid unnecessary dependencies and services.
-   Do not add features that are not explicitly approved below.

## 2. Approved V1 features

Treat this list as the scope boundary.

### Core score experience

1.  Live cricket scores.
2.  Live football scores.
3.  Upcoming fixtures.
4.  Recent match results.
5.  Basic match details within the limitations below.
6.  Last-updated indicator.

### Discovery

7.  Sport filters: Cricket and Football.
8.  Competition filters.
9.  Team search.
10. Competition search.

### User experience

11. Responsive website design.
12. Dark and light themes.
13. Favourite teams saved in browser `localStorage`.
14. Loading states.
15. Error states.
16. Empty states.
17. SEO and metadata.

### Match detail limitations

**Cricket** - Team names. - Scores. - Overs where available. - Innings
information where available. - Match status.

**Football** - Team names. - Goals. - Match minute where available. -
Match status. - Final result.

Only display fields actually provided by the selected API. Omit missing
optional fields or clearly mark them unavailable. Never infer or invent
values.

### Explicitly excluded from V1

Do not implement: - Authentication, accounts or user profiles. - A
mobile application (this is a website; responsive layouts are
required). - Fantasy sports. - Sports news or editorial content. -
Notifications or push notifications. - Betting, odds or gambling
integrations. - Community posts, chat or social features. - AI summaries
or predictions. - Sports beyond cricket and football. - Complex admin
dashboards. - Subscriptions or monetisation. - Any other unapproved
feature.

Record potentially useful additions as future ideas; do not implement
them.

## 3. Technology stack and rules

  Area                Technology
  ------------------- -------------------------------------
  Framework           Next.js
  Routing             Next.js App Router
  UI                  React
  Language            **JavaScript only**
  Styling             Tailwind CSS
  Components          shadcn/ui where appropriate
  Icons               Lucide
  Backend endpoints   Next.js Route Handlers
  Data                External cricket and football APIs
  Optional database   Supabase only if genuinely required
  Version control     Git and GitHub
  Hosting             Vercel

### Non-negotiable rules

-   Use JavaScript, not TypeScript. Do not create `.ts` or `.tsx` files.
-   Use Next.js App Router.
-   Never expose API keys in frontend code, client components,
    `NEXT_PUBLIC_` variables, browser requests or committed files.
-   The browser must call Playon's own Next.js endpoints, not
    third-party APIs directly.
-   Keep provider calls and credentials on the server.
-   Do not add Supabase by default. `localStorage` is enough for V1
    favourites and theme preference.
-   Do not build authentication or a mobile app.
-   Do not commit `.env.local`, credentials or secrets.
-   Avoid unnecessary libraries. Explain significant dependencies and
    technical decisions.
-   Preserve existing useful work in the repository.

## 4. Proposed architecture

Use a simple server-mediated architecture (a backend-for-frontend):

``` text
User's browser
   |
   | HTTPS / fetch to same-origin endpoint
   v
Next.js pages and React components
   |
   | GET /api/cricket/... or /api/football/...
   v
Next.js Route Handlers
   |
   v
Sport-specific provider adapters
   |
   | server-side authenticated requests
   v
External cricket / football APIs
   |
   v
Provider response -> validation -> normalization
   |
   v
Cache / refresh policy
   |
   v
Consistent Playon JSON response -> browser UI
```

### Responsibilities

**Frontend** - Render pages, match cards, filters and search. - Manage
interactive controls, theme and favourites. - Display loading, success,
empty and error states. - Never contain provider credentials or
provider-specific parsing logic.

**Route Handlers** - Validate query parameters. - Call server-side
provider adapters. - Apply cache and refresh rules. - Normalize
responses and return consistent JSON. - Handle provider errors without
leaking secrets, stack traces or raw internal responses.

**Provider adapters** - Encapsulate provider-specific URLs,
authentication, request parameters and response parsing. - Convert
provider data into Playon's normalized format. - Keep cricket and
football adapters separate where their data differs. - Allow a provider
to be replaced without rewriting UI components.

**Normalization** - Give the frontend predictable fields and status
values. - Preserve sport-specific score data; do not force cricket and
football into identical score fields. - Handle optional/missing fields
without inventing data.

**Browser storage** - Store favourite team IDs and theme preference in
`localStorage`. - No account or server database is required for these
preferences. - Access `localStorage` only on the client, after
hydration; do not read it during server rendering.

Keep the architecture proportionate. Do not introduce microservices, a
separate backend server, Redis, queues, complex state-management
libraries or Supabase unless a specific approved V1 need proves they are
necessary.

## 5. Proposed folder structure

Inspect the existing repository first. Adapt this structure if an
existing structure is already sensible. Do not create empty folders or
abstractions without a real use.

``` text
playon/
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   ├── globals.css
│   │   ├── loading.js
│   │   ├── error.js
│   │   ├── not-found.js
│   │   ├── cricket/page.js
│   │   ├── football/page.js
│   │   ├── match/[sport]/[matchId]/page.js
│   │   └── api/
│   │       ├── cricket/
│   │       │   ├── live/route.js
│   │       │   ├── fixtures/route.js
│   │       │   ├── results/route.js
│   │       │   └── matches/[matchId]/route.js
│   │       └── football/
│   │           ├── live/route.js
│   │           ├── fixtures/route.js
│   │           ├── results/route.js
│   │           └── matches/[matchId]/route.js
│   ├── components/
│   │   ├── layout/
│   │   ├── matches/
│   │   ├── filters/
│   │   ├── states/
│   │   └── ui/
│   ├── features/
│   │   ├── cricket/
│   │   ├── football/
│   │   ├── favourites/
│   │   └── theme/
│   ├── hooks/
│   └── lib/
│       ├── providers/
│       ├── sports/
│       ├── cache/
│       ├── api/
│       ├── constants/
│       └── utils/
├── .env.example
├── .gitignore
├── package.json
├── next.config.mjs
└── README.md
```

Suggested files under `lib/providers/`: `cricketProvider.js`,
`footballProvider.js`. Suggested normalizers: `normalizeCricket.js`,
`normalizeFootball.js`. Keep the actual tree simpler if that better
suits the project size.

## 6. Frontend/backend communication

The browser should call same-origin Playon endpoints, for example:

``` js
const response = await fetch("/api/cricket/live");

if (!response.ok) {
  throw new Error("Unable to load cricket scores");
}

const result = await response.json();
```

This is an illustrative contract, not a request to start coding during
the planning step.

### Proposed endpoints

  Endpoint                               Purpose
  -------------------------------------- ----------------------------
  `GET /api/cricket/live`                Live cricket matches
  `GET /api/cricket/fixtures`            Upcoming cricket fixtures
  `GET /api/cricket/results`             Recent cricket results
  `GET /api/cricket/matches/:matchId`    Basic cricket details
  `GET /api/football/live`               Live football matches
  `GET /api/football/fixtures`           Upcoming football fixtures
  `GET /api/football/results`            Recent football results
  `GET /api/football/matches/:matchId`   Basic football details

Add query parameters (competition, team, date, pagination) only where
supported by the chosen provider and needed by V1.

### Consistent response contract

Suggested success response:

``` json
{
  "success": true,
  "sport": "cricket",
  "category": "live",
  "data": [],
  "meta": {
    "lastUpdated": "ISO-8601 timestamp",
    "source": "provider identifier"
  }
}
```

Suggested error response:

``` json
{
  "success": false,
  "error": {
    "code": "SPORTS_DATA_UNAVAILABLE",
    "message": "Score data is temporarily unavailable."
  },
  "meta": {
    "lastUpdated": null
  }
}
```

Keep response formats consistent. Handle invalid parameters, provider
timeouts, rate limits, network errors, invalid responses, missing
optional fields, empty results and unknown match IDs. Never return
credentials, authorization headers, raw provider errors or stack traces
to the browser.

## 7. Sports API research and integration

API selection is a critical dependency. Research cricket and football
providers separately; do not assume one provider can adequately cover
both.

### Verify for each provider

1.  Live score endpoint availability.
2.  Upcoming fixtures endpoint.
3.  Recent results endpoint.
4.  Competition/tournament information.
5.  Team names and stable team IDs.
6.  Match details required by Section 2.
7.  Whether live endpoints are included in the free plan.
8.  Free quota and rate limits per minute/hour/day.
9.  Data refresh/update frequency.
10. Caching and storage restrictions.
11. Attribution requirements.
12. Portfolio/commercial usage terms.
13. Documentation quality and provider reliability.
14. Whether the provider is usable for the project's timeframe.

Use official API documentation, pricing and terms pages as primary
evidence. Community reports can supplement but not replace official
documentation. Do not invent quotas, refresh rates or plan capabilities.
Mark unverified details as unknown.

### API comparison deliverable

Prepare this table before recommending providers:

  Item                        Cricket candidate   Football candidate
  --------------------------- ------------------- --------------------
  Provider                    Research            Research
  Official documentation      Link                Link
  Live scores                 Verify              Verify
  Fixtures                    Verify              Verify
  Results                     Verify              Verify
  Required match fields       Verify              Verify
  Free quota                  Verify              Verify
  Live data on free tier      Verify              Verify
  Refresh frequency           Verify              Verify
  Usage / attribution terms   Verify              Verify
  Main limitations            Record              Record
  Recommendation              Pending approval    Pending approval

### Mandatory API approval gate

-   Recommend one cricket provider and one football provider.
-   Explain why each is suitable and identify limitations.
-   List the exact endpoints needed for V1.
-   Confirm whether free tiers support development and demonstration.
-   Explain any usage/attribution restrictions.
-   **Wait for the project owner to approve the provider choices before
    integration.**

### Normalized data

The UI must consume Playon-normalized data, not provider-specific
response JSON. A conceptual match shape:

``` json
{
  "id": "provider-match-id",
  "sport": "cricket",
  "competition": { "id": "competition-id", "name": "Competition name" },
  "homeTeam": { "id": "team-a", "name": "Team A", "logo": null },
  "awayTeam": { "id": "team-b", "name": "Team B", "logo": null },
  "status": "live",
  "startTime": "ISO-8601 timestamp",
  "score": {},
  "details": {},
  "lastUpdated": "ISO-8601 timestamp"
}
```

This is conceptual. Cricket and football must retain sport-specific
score structures. Cricket details may contain innings and overs;
football details may contain goals and match minute. Only populate
values supplied by the API.

### Caching and refresh

-   Respect API terms, quotas and rate limits.
-   Live scores need shorter caching than fixtures and completed
    results, but exact durations must be based on provider limits and
    update frequency.
-   Avoid polling continuously or requesting the same data independently
    from multiple components.
-   Show the timestamp for the data actually displayed. Do not claim
    cached data was freshly fetched.
-   If stale cached data is displayed after a provider failure, make its
    age clear where appropriate.
-   Propose a refresh policy after provider research; do not invent
    arbitrary intervals.

## 8. UI and brand direction

Playon should look like a distinctive sports product, not an untouched
starter template.

### Visual goals

-   Strong Playon brand identity.
-   Clear typography, colour system, spacing and hierarchy.
-   Scores easy to scan quickly.
-   Distinct but consistent cricket and football score treatments.
-   Responsive website layouts for desktop, tablet and mobile browser
    widths.
-   Polished dark and light themes with sufficient contrast.
-   Subtle, purposeful transitions; avoid excessive animation.
-   Use Lucide icons and shadcn/ui selectively.
-   Use original hero artwork, textures or visual assets where they
    improve the brand, not as decoration for its own sake.

### Homepage priority

1.  Brand and primary navigation.
2.  Sport selection.
3.  Live score content.
4.  Upcoming fixtures.
5.  Recent results.
6.  Competition and team search/filter controls.
7.  Last-updated information.

### Match cards

**Cricket:** competition, teams, innings scores, overs where available,
match status.\
**Football:** competition, teams, goals, match minute where available,
match status/final result.

### Data states

Every data-driven section needs: - Loading state. - Error state with
retry where appropriate. - Empty state for a successful response
containing no matches. - Data state. - Stale-data indication if cached
data is being shown and its age matters.

An empty response is not an error. Never fill an empty state with fake
matches.

## 9. Approved feature behaviour

### Filters

-   Switch between cricket and football.
-   Filter by competitions available in the loaded dataset/provider.
-   Do not imply that every global competition is supported.

### Search

-   Team search matches names in available data.
-   Competition search matches available competition names.
-   Ignore case and trim leading/trailing spaces.
-   Show a clear no-results state.
-   Do not claim global coverage unless the API provides it.

### Favourite teams

-   Allow mark/unmark.
-   Store stable team IDs in `localStorage`, not just display names.
-   Handle first-time visitors and missing/corrupt stored values.
-   Read localStorage client-side after hydration.
-   Favourites are browser-local and are not synced across devices.
-   No account is required.

### Themes

-   Provide a theme toggle.
-   Persist preference in `localStorage`.
-   Avoid theme flash where practical.
-   Ensure contrast in both themes.
-   No account required.

### Match details

-   Use only the approved fields in Section 2.
-   Route by sport and match ID.
-   Validate sport and ID.
-   Handle unknown, deleted or unavailable matches.
-   Do not add commentary, lineups, player profiles, advanced statistics
    or other unapproved detail.

### Last updated

-   Show when displayed data was last successfully fetched/updated.
-   Do not optimistically update after a failed request.
-   Distinguish provider update time from fetch time if the API exposes
    both.

## 10. Security and environment configuration

Use server-only environment variables. Exact names depend on selected
providers; possible placeholders:

``` env
CRICKET_API_BASE_URL=
CRICKET_API_KEY=

FOOTBALL_API_BASE_URL=
FOOTBALL_API_KEY=
```

These are examples, not confirmed provider configuration.

-   Never use `NEXT_PUBLIC_` for secrets.
-   Create `.env.example` with empty/safe placeholders.
-   Keep `.env.local` ignored by Git.
-   Validate query parameters and IDs.
-   Do not trust arbitrary client-supplied provider URLs.
-   Do not log credentials or authorization headers.
-   Do not expose raw provider errors or stack traces.
-   Use HTTPS in production.
-   Do not collect personal data; V1 has no accounts.

## 11. Supabase decision

Supabase is optional, not mandatory.

V1 favourites and theme preference fit browser `localStorage`; sports
data comes from external APIs; Next.js Route Handlers provide the
server-side API layer. Therefore **do not add Supabase by default**.

Use Supabase only if an explicitly approved requirement genuinely needs
persistent server-side storage. If no such requirement exists, leave it
out to reduce setup time and complexity.

## 12. SEO, accessibility and performance

### SEO

-   Use Next.js metadata APIs.
-   Add a meaningful site title and description.
-   Give sport and match pages useful metadata where practical.
-   Use semantic headings and HTML landmarks.
-   Do not create misleading SEO content for unavailable data.

### Accessibility

-   Use semantic HTML.
-   Ensure keyboard access for navigation, filters, search and theme
    controls.
-   Provide visible focus styles and accessible labels for icon-only
    buttons.
-   Maintain contrast in both themes.
-   Do not communicate match status through colour alone.
-   Respect reduced-motion preferences.

### Performance

-   Prefer Server Components for non-interactive content.
-   Use Client Components only for interactive controls and browser
    storage.
-   Limit client-side JavaScript.
-   Avoid duplicate API requests.
-   Optimize images and assets.
-   Keep bundle size and dependencies under control.
-   Use caching consistent with provider terms and data freshness.

## 13. Technical risks and mitigations

  ------------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- ------------------------
  Free API plan excludes  High                    Verify exact endpoints
  live scores                                     and plan restrictions
                                                  before selection.

  Free quota is too small High                    Estimate request volume,
                                                  cache and avoid
                                                  unnecessary polling.

  Data is delayed or      High                    Show only supplied
  incomplete                                      fields and display
                                                  honest update
                                                  information.

  Provider changes or     High                    Isolate provider
  outage                                          adapters, validate
                                                  responses and handle
                                                  failures.

  Cricket and football    Expected                Use separate normalizers
  schemas differ                                  and sport-specific score
                                                  structures.

  Scope expands           High                    Enforce approved V1
                                                  scope and defer excluded
                                                  features.

  API key leaks           Critical                Server-only env vars,
                                                  `.gitignore`, review and
                                                  deployment checks.

  Excessive refresh       High                    Set refresh policy from
  triggers rate limits                            verified quotas and
                                                  update frequency.

  localStorage causes     Medium                  Access it only
  hydration mismatch                              client-side after
                                                  hydration.

  No live match during    Medium                  Demonstrate
  demonstration                                   fixtures/results/empty
                                                  states honestly; never
                                                  fake a live match.

  Deployment differs from Medium                  Test production build
  local                                           and configure Vercel env
                                                  vars explicitly.
  ------------------------------------------------------------------------

## 14. What to test before development

### Repository inspection

-   Identify whether a project already exists.
-   Inspect `package.json`, Next.js version, App Router and folder
    structure.
-   Check existing code, assets, styles and uncommitted work.
-   Identify what should be retained.
-   Do not reset, delete or overwrite existing work without approval.

### API feasibility

For each candidate, verify authentication, live scores, fixtures,
results, match details, team/competition IDs, required fields, free
quota, rate limits, update frequency, error formats, caching rules and
attribution/usage terms.

### Representative data-shape checks

Obtain or inspect provider examples for: - Live cricket match. -
Upcoming cricket fixture. - Completed cricket match. - Live football
match. - Upcoming football fixture. - Completed football match. - Match
with missing optional fields. - Empty result set.

Confirm the fields can be mapped accurately without fabricating data.

### Architecture checks

-   Route Handlers can call providers server-side.
-   Secrets cannot appear in browser bundles.
-   Vercel supports the required server-side requests.
-   Cache behaviour follows provider terms.
-   The normalized format represents both sports correctly.

### UI checks

-   Confirm brand direction and homepage hierarchy.
-   Confirm sport-specific match card layouts.
-   Confirm loading, error and empty states.
-   Confirm responsive navigation, filters and theme contrast.

## 15. Testing strategy

Keep tests proportionate to the short timeline, but cover core
behaviour.

**Unit-level checks** - Cricket and football normalization. - Missing
optional fields. - Status mapping. - Search matching. - Favourite
storage helpers. - Query parameter validation.

**Route/API checks** - Successful response. - Provider timeout. - Rate
limit. - Invalid response. - Empty result. - Unknown match ID. - Missing
environment variables. - No API key in returned JSON or browser
requests.

**UI checks** - Live, upcoming and results sections. - Correct
sport-specific score formats. - Sport/competition filters. -
Team/competition search. - Favourites persist after refresh. - Theme
persists after refresh. - Loading/error/empty states are distinct. -
Match details handle unavailable data. - Last-updated indicator is
accurate.

**Production checks** - `npm run build` succeeds. - No critical
browser-console errors. - No committed/exposed secrets. - Responsive
layouts checked at common viewport sizes. - Metadata present. - Vercel
environment variables configured. - Deployed site retrieves real data. -
Provider failure does not crash the whole website.

## 16. Five-stage development plan

Keep the plan to these five stages. Do not create a long chain of extra
phases. Model labels are suggestions, not strict requirements; choose
the available model based on the task and project access.

### Phase 1 --- Foundation & Architecture

**Suggested model:** Opus 4.6\
**Outcome:** A clean, working Next.js project with a well-planned
architecture.

Tasks: - Review requirements and existing project folder. - Plan
frontend, backend and data architecture. - Set up Next.js App Router,
React, JavaScript and Tailwind CSS. - Establish reusable folders,
components and environment-variable structure. - Create a basic running
application and README.

Completion checks: - Project runs locally. - Production build
succeeds. - JavaScript only. - Folder structure is clear and
proportionate. - No secrets are present. - README explains setup and
project purpose.

### Phase 2 --- Brand Identity & UI Development

**Suggested model:** Sonnet 4.6\
**Outcome:** Playon looks like a real, distinctive sports brand, not a
starter template.

Tasks: - Establish visual identity, colour system and typography. -
Build responsive homepage, navigation and sports sections. - Create
live, upcoming and completed match components. - Design cricket and
football visual treatments. - Add original hero artwork, textures and
visual assets where suitable. - Build loading, error and empty states.

Completion checks: - Coherent Playon visual identity. - Sport-specific
score layouts. - Responsive behaviour checked. - All data states
designed. - No untouched starter-template appearance.

### Phase 3 --- Real Sports Data Integration

**Suggested model:** Opus for research/architecture, then Sonnet for
implementation\
**Outcome:** Real cricket and football data displayed reliably.

Tasks: - Research and compare API providers and free-plan
restrictions. - Confirm live score access, fixtures, results,
competitions, update frequency and usage terms. - Get project-owner
approval of API choices before implementation. - Build secure Next.js
Route Handlers. - Integrate cricket and football data through separate
adapters. - Normalize data for the frontend. - Add caching, refresh
rules and accurate update timestamps. - Handle errors, rate limits and
incomplete data.

Completion checks: - Real provider data is displayed. - No fake
scores. - API keys remain server-side. - Data mapping is accurate. -
Error/empty states work. - Refresh policy respects quotas and terms.

### Phase 4 --- Features & User Experience

**Suggested model:** Sonnet 4.6\
**Outcome:** The site becomes useful and interactive.

Tasks: - Sport and competition filters. - Team and competition search. -
Basic match detail pages. - Favourite teams saved in localStorage. -
Dark and light themes. - Last-updated indicator. - Responsive behaviour
and consistent interactions. - SEO metadata and accessible controls.

Completion checks: - Filters/search work on actual available data. -
Favourites and theme persist locally. - Match details respect approved
limitations. - No account/authentication flow. - Desktop and
mobile-browser widths work.

### Phase 5 --- Quality, Performance & Launch

**Suggested model:** Opus for review, then Sonnet for fixes\
**Outcome:** A polished, tested, deployed Playon V1.

Tasks: - Review UI consistency and remove generic or unfinished
patterns. - Test real data, error handling and edge cases. - Improve
performance, accessibility and SEO. - Check API-key security and
production configuration. - Prepare GitHub repository and
documentation. - Configure Vercel deployment. - Verify the live website
and real data before calling it complete.

Completion checks: - Production build succeeds. - Deployed website is
accessible. - Real data is verified after deployment. - API keys are not
exposed. - Core V1 tests pass. - Known API limitations are documented.

## 17. Short-time delivery priorities

**Must work** - Homepage. - Cricket and football sections. - Live
scores, fixtures and results where supported by approved APIs. - Real
API integration. - Match cards and approved basic details. - Loading,
error and empty states. - Secure API-key handling. - Responsive website.

**Should work** - Sport and competition filters. - Team and competition
search. - Dark and light themes. - Favourite teams. - Last-updated
indicator. - SEO metadata.

**Polish after core behaviour** - Extra visual effects. - Decorative
artwork beyond what improves the brand. - Non-essential animations. -
Minor visual refinements.

Do not sacrifice data correctness or API security to finish decoration
faster. If provider access blocks a required feature, report it and
recommend legitimate alternatives. Never substitute fake live scores.

## 18. Documentation and handover

README should include: - Project overview and approved V1 scope. -
Technology stack. - Prerequisites and installation. -
Environment-variable setup. - Local development and production build
commands. - API provider names and official documentation links. - Known
free-tier/API limitations. - Deployment instructions. - Brief
architecture explanation.

A concise `DECISIONS.md` may be used for important decisions (provider
selection, cache policy, Supabase decision and trade-offs), but do not
create excessive documentation files.

## 19. Working rules for Claude Code

1.  Read this entire document before changes.
2.  Inspect the repository before assuming it is empty.
3.  Do not write application code until the initial plan is presented
    and approved.
4.  Do not install packages or make destructive changes during the
    initial planning response.
5.  Work within the five-stage plan.
6.  Use JavaScript only.
7.  Keep implementation understandable to a beginner.
8.  Explain significant technical decisions clearly.
9.  Prefer small working increments over large rewrites.
10. Do not over-engineer.
11. Do not add unapproved features.
12. Never invent data or claim API capabilities without verification.
13. Never expose API credentials.
14. Do not add Supabase without a real requirement.
15. Keep UI and API contracts consistent.
16. Test changes after implementation.
17. If a requirement is ambiguous, identify it and ask one focused
    question rather than silently making a major assumption.
18. If a free API plan cannot support a required feature, report the
    limitation before proceeding.
19. Preserve existing work unless a change is approved.
20. At the end of each stage, report completed work, tests, remaining
    work and known limitations.

## 20. First response required --- planning only

When given this document, Claude Code must **not** generate application
code or begin implementation.

First perform a read-only review and return:

1.  **Requirements understanding:** Summarize Playon and approved V1
    scope.
2.  **Repository inspection:** What exists, what is reusable and what
    must be preserved.
3.  **Architecture proposal:** Frontend, Route Handlers, provider
    adapters, normalization and caching.
4.  **Folder structure:** Proposed structure and any simplifications.
5.  **API research plan:** Candidate cricket/football providers and
    capabilities to verify. Do not claim unverified free-tier access.
6.  **Technical risks:** Highest-impact risks and mitigations.
7.  **Frontend/backend communication:** Request and response flow.
8.  **Pre-development tests:** API feasibility, data shape, security and
    environment checks.
9.  **Five-stage plan:** Use Section 16 without adding phases.
10. **Blocking questions:** Ask only questions necessary for a safe or
    correct decision.

Then stop and wait for explicit approval from the project owner.

**Do not implement Phase 1 or create application files until approval is
given.**

## 21. Definition of done --- Playon V1

Playon V1 is complete only when: - It is a deployed website, not just a
local UI demo. - It supports cricket and football. - It displays real
live scores when available from selected providers. - It displays
upcoming fixtures and recent results where supported. - It provides the
approved basic match details. - Sport and competition filters work. -
Team and competition search work. - Favourite teams use browser
`localStorage`. - Dark and light themes work. - An honest last-updated
indicator is shown. - Loading, error and empty states work. - The
website is responsive. - API credentials remain server-side. - SEO
metadata and accessibility basics are present. - Production build
succeeds. - Deployed Vercel website has been checked with real data. -
Known API limitations are documented. - No excluded feature has been
added without approval.

------------------------------------------------------------------------

**Final instruction:** Build Playon as a focused, real-data-driven
sports score website. Prioritize a working, trustworthy V1 over feature
quantity. Follow the five-stage plan, keep the implementation simple,
and wait for approval before beginning implementation.
