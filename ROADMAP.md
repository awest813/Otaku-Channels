# Otaku Channels — Roadmap

This document tracks the planned features and milestones for Otaku Channels.

---

## Current status snapshot (honest progress)

This snapshot is intentionally blunt so roadmap status matches what is live in the repo right now.

### Debug tooling

- ✅ Admin **Job Status** page exists and supports queue health visibility + manual job triggers.
- ✅ Backend logging/error utilities exist (`logger`, `serverLogger`, `errorCapture`) and are wired for diagnostics.
- 🚧 Still missing a dedicated developer debug console/tracing UI in the frontend.

### Audit & moderation

- ✅ Admin **Audit Log** view is implemented with action filters and pagination.
- ✅ Admin report/user/source moderation pages and API routes are present.
- 🚧 Needs broader audit event coverage docs (what is and is not logged) and stronger retention policy notes.

### Polish (UX/accessibility/perf)

- ✅ Core UX polish exists (skeletons, empty states, error boundaries, consistent card/button patterns).
- 🚧 Major polish goals are still open: keyboard/gamepad navigation, sleep timer, theme toggle, offline fallback.

### Testing

- ✅ Strong unit/integration coverage across API routes, components, and key library utilities.
- ✅ CI checks run lint + typecheck + format + Jest tests.
- ✅ Contract smoke suite covers all major route groups: series, movies, live, search, providers, channels, analytics, and Jikan episodes (236 tests, 33 suites).
- 🚧 No live integration tests against a running Fastify + PostgreSQL stack yet.

---

## Milestone 1 — Foundation ✅ (complete)

- [x] Next.js 15 App Router skeleton
- [x] TypeScript + Tailwind CSS v4 setup
- [x] Mock data layer (`src/data/mockData.ts`)
- [x] Core types (`AnimeSeries`, `Movie`, `LiveChannel`, `Episode`, `SourceProvider`)
- [x] Home page with hero banner and horizontal content rails
- [x] Series detail page with episode list
- [x] Live channels page
- [x] Watch player (YouTube embed + external link fallback)
- [x] Watchlist page + `useWatchlist` hook (localStorage)
- [x] Recently viewed rail + `useRecentlyViewed` hook (localStorage)
- [x] Skeleton loading states (`MediaCardSkeleton`, `MediaRailSkeleton`, `HeroBannerSkeleton`)
- [x] Error boundary with fallback UI
- [x] SearchBar component
- [x] Browse page (genre + source filtering)
- [x] Settings page
- [x] SourceBadge, GenrePill, MediaCard, MediaRail, LiveChannelCard
- [x] AppShell layout with TopNav and Footer

---

## Milestone 2 — CI & Test Suite ✅ (complete)

- [x] Jest + React Testing Library configuration
- [x] API route tests (series, movies, live, providers, search, images, quotes)
- [x] Component tests (MediaCard, HeroBanner, SearchBar, SourceBadge, GenrePill, WatchPlayerShell)
- [x] Page tests (HomePage)
- [x] Jest manual mock for backend (`src/lib/__mocks__/backend.ts`)
- [x] Jest mock for `next/image` (strips Next.js-only DOM props — no React warnings)
- [x] ESLint strict (`--max-warnings=0`) — zero warnings
- [x] TypeScript strict mode — zero errors
- [x] Prettier formatting — enforced in CI
- [x] GitHub Actions workflow (lint → typecheck → format check → tests)
- [x] Husky pre-commit hooks + commitlint (Conventional Commits)

---

## Milestone 3 — Metadata & External APIs ✅ (complete)

- [x] Jikan v4 client (`src/lib/jikan.ts`) — MyAnimeList public API
  - [x] `searchJikan()` — full-text anime search
  - [x] `getJikanById()` — fetch anime by MAL ID
  - [x] `toSeries()` / `toMovie()` — normalize Jikan responses to shared types
- [x] Kitsu client (`src/lib/kitsu.ts`) — Kitsu JSON:API
  - [x] `searchKitsu()` — full-text anime search
  - [x] `toSeries()` / `toMovie()` — normalize Kitsu responses to shared types
- [x] Shikimori client (`src/lib/shikimori.ts`) — Shikimori GraphQL
  - [x] `searchShikimori()` — anime search via GraphQL
  - [x] `toSeries()` / `toMovie()` — normalize Shikimori responses to shared types
- [x] Shared `JikanAnime`, `KitsuAnimeResource`, `ShikimoriAnime` types
- [x] `trailerEmbedUrl`, `streamingLinks`, `malId` fields on `AnimeSeries` and `Movie`

---

## Milestone 4 — Backend Integration ✅ (complete)

- [x] Fastify REST API server (`backend/`)
- [x] PostgreSQL schema via Prisma ORM
- [x] Seed script with 11 anime, 7 channels, and approved source domains (including vetted grey providers)
- [x] Auth routes (`/api/v1/auth/register`, `login`, `refresh`, `logout`, `me`)
- [x] Anime catalog (`/api/v1/anime` — list, filter, trending, featured, genres, detail, related, episodes)
- [x] Channel routes (`/api/v1/channels` — list, featured, detail, now-playing, schedule)
- [x] Search routes (`/api/v1/search`, `/api/v1/search/suggest`)
- [x] Source allowlist and grey-source governance (`/api/v1/sources/domains`)
- [x] Watch history & progress routes
- [x] Watchlist & favorites routes
- [x] Recommendations (`for-you`, `similar`, `trending`, `because-you-watched`)
- [x] User / profile routes
- [x] Admin routes (stats, ban/unban, role change, visibility, merge, reports, audit)
- [x] BullMQ cron workers (session-cleanup, trending, source-check, metadata-refresh)
- [x] Pseudo-live channel rotation algorithm
- [x] Swagger/OpenAPI docs at `/docs`
- [x] Wire Next.js API routes to Fastify backend (auth, series, movies, live, search, recommendations, user, admin — all wired with `hybrid` fallback mode)
- [x] Remove dependency on mock data for production builds (set `DATA_MODE=backend` to disable mock fallback)
- [x] End-to-end smoke tests for the wired API (contract tests covering all major route groups: series, movies, live, search, providers, channels, analytics, jikan episodes)

---

## Milestone 5 — User Accounts ✅ (complete)

- [x] User registration & login UI (forms, validation) — `LoginForm`, `SignupForm` in `src/app/login/` and `src/app/signup/`
- [x] JWT session management in Next.js (cookie-based) — `AuthProvider` / `useAuth` in `src/context/auth.tsx`
- [x] Favorites / watchlist persisted to Fastify backend — `useWatchlist` hook with full backend sync (add via POST, remove via DELETE `/api/user/watchlist?animeId=`)
- [x] Watch history tracked in backend — `useRecentlyViewed` hook with backend sync via `/api/user/watch-history`
- [x] User preferences: default language (sub/dub), preferred sources — `ProfileContent.tsx` with sub/dub toggle and source multi-select; saved via `PATCH /api/user/profile`
- [x] Profile page with watchlist and history — inline watchlist preview (up to 6 items) and watch history preview (up to 6 items) with "See all" links

---

## Milestone 6 — Discovery & Content 🚧 (in progress)

- [x] Trending anime rail (view count / trending score from backend) — `TrendingRail` server component
- [x] "Recommended for you" rail (genre-based) — `ForYouRail` client component with `/api/recommendations/for-you` route
- [x] "Continue watching" rail on home page — `RecentlyViewedRail`
- [x] Sub/dub language filter UI — filter chips exist in `/browse`; backend `listAnime()` now filters by `language` via `sourceLinksTitleLevel`
- [x] Source filter UI (official + grey providers) — Official/Grey-vetted shield badges on source chips in `/browse`
- [x] Genre browse page with paginated results — `/browse/genre/[genre]`; genre pills on hero banner and series pages link here
- [x] Autoplay next episode — `WatchPlayerShell` countdown overlay + toggle
- [x] Search autocomplete suggestions (`/api/v1/search/suggest`) — `SearchBar` live dropdown

---

## Milestone 7 — Streaming Integration 📅 (planned)

- [ ] Consumet API integration (gogoanime, Zoro, AnimePahe)
- [ ] Episode source resolution (official + grey source handoff)
- [ ] Graceful fallback when Consumet is unavailable
- [ ] Source quality selector in watch player

---

## Milestone 8 — Polish & Accessibility 📅 (planned)

- [x] Keyboard navigation (10-foot / couch mode) — `useRailKeyboard` hook; ArrowLeft/Right/Home/End navigate between cards in any `MediaRail`; roving tabindex pattern
- [ ] Controller / gamepad support
- [ ] ARIA labels and screen reader support
- [ ] PWA manifest — installable on mobile/desktop
- [ ] Sleep timer
- [ ] Dark/light theme toggle
- [ ] Offline fallback page

---

## Milestone 9 — Production & Deployment 📅 (planned)

- [ ] Vercel deployment (frontend)
- [ ] Fly.io or Railway deployment (Fastify backend)
- [ ] Hosted PostgreSQL + Redis
- [ ] BullMQ cron workers in production
- [ ] Rate limiting on all public API routes
- [ ] CDN for thumbnails and hero images
- [ ] Uptime monitoring and alerting
- [ ] Structured logging (Pino) + log aggregation

---

## Nice-to-have / Future ideas

- Faux channel guide (grid schedule view)
- Anime stations by vibe (Shonen, Retro, Mecha, Chill, Fantasy)
- Kiosk / couch fullscreen mode
- RSS / publisher/community feed ingestion for user-added sources
- Clip / highlight reels
- New episode notifications (push / email)
- Social features (activity feed, public lists, follows)
- Metadata sync jobs (Jikan / Kitsu / Shikimori auto-refresh)
- OAuth login (Google / Discord)
- Public API for third-party clients

---

## Legend

| Symbol | Meaning     |
| ------ | ----------- |
| ✅     | Complete    |
| 🚧     | In progress |
| 📅     | Planned     |

---

## Milestone 10 — Source Governance 📅 (planned)

- [ ] Expand approved source registry for grey anime APIs
- [ ] Add risk labels per source (`official`, `grey-vetted`, `community`)
- [ ] Automated uptime and takedown-signal monitoring
- [ ] Admin review queue SLA and moderation notes for source decisions
