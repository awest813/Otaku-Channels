# Otaku Channels — Changelog

All notable changes to this project will be documented here.

---

## [Unreleased]

### Added (Milestone 6 — Discovery & Content)

- **TrendingRail** (`src/components/media/TrendingRail.tsx`) — async server component that calls `getTrendingAnime()` (backend view-count scores) with mock-data tag fallback; replaces the inline tag-filter on the home page
- **ForYouRail** (`src/components/media/ForYouRail.tsx`) — client component that derives genre preferences from watch history, calls `GET /api/recommendations/for-you`, and filters out already-seen titles; renders nothing until the user has history
- **`/api/recommendations/for-you` route** — new Next.js route that proxies the auth-gated backend for-you endpoint, falls back to genre-heuristic `getSharedGenreRecs`, and finally to mock-catalogue picks when offline
- **`getForYouRecommendations()`** added to `src/lib/api-client.ts` for browser-side calls
- **Genre browse page** (`src/app/browse/genre/[genre]/page.tsx`) — server-rendered paginated results page (24 per page); genre pills on hero banner and series detail pages now link here
- **Source filter badges** — official providers show a green shield icon; grey-vetted providers show an amber shield icon in the `/browse` source filter

### In progress

- Discovery & Content (Milestone 6) — all items complete ✅; planning Milestone 7

### Documentation

- Updated docs to explicitly allow vetted grey APIs and anime sources alongside official providers
- Renamed legal/allowlist language to source-policy language for consistency across frontend and backend docs

---

## [0.3.0] — 2025 — Metadata APIs & UI Polish

### Added

- **Jikan v4 client** (`src/lib/jikan.ts`) — MyAnimeList public API integration
  - `searchJikan()`, `getJikanById()`, `toSeries()`, `toMovie()`
- **Kitsu client** (`src/lib/kitsu.ts`) — Kitsu JSON:API integration
  - `searchKitsu()`, `toSeries()`, `toMovie()`
- **Shikimori client** (`src/lib/shikimori.ts`) — Shikimori GraphQL integration
  - `searchShikimori()`, `toSeries()`, `toMovie()`
- `trailerEmbedUrl`, `streamingLinks`, and `malId` fields on `AnimeSeries` and `Movie` types
- `JikanAnime`, `KitsuAnimeResource`, and `ShikimoriAnime` raw API types
- **Watchlist page** (`src/app/watchlist/`) and `useWatchlist` hook (localStorage)
- **Recently viewed rail** (`RecentlyViewedRail`) and `useRecentlyViewed` hook (localStorage)
- **Skeleton loading states**: `MediaCardSkeleton`, `MediaRailSkeleton`, `HeroBannerSkeleton`
- Error boundary with fallback UI
- Browse page with genre and source filtering
- Settings page
- Footer component (`src/components/layout/Footer.tsx`)
- Helper utilities (`src/lib/helper.ts`) and logger (`src/lib/logger.ts`)
- `SourceType` enum expanded: `crunchyroll`, `consumet`, `jikan`, `kitsu`, `shikimori`

---

## [0.2.0] — 2024 — Fastify Backend

### Added

- **Fastify REST API** (`backend/`) with TypeScript, Prisma ORM, PostgreSQL, Redis, and BullMQ
- Prisma schema: `Anime`, `Episode`, `Channel`, `User`, `Watchlist`, `WatchHistory`, `Source`, `Report` models
- Seed script: 11 anime titles, 7 themed channels, approved source domains (official + grey-vetted)
- Auth routes: register, login, refresh, logout, `/auth/me`
- Anime catalog: list, filter, trending, featured, genres, detail, related, episodes
- Channel routes: list, featured, detail, now-playing (pseudo-live), schedule
- Search: full-text + autocomplete suggestions
- Source governance: approved domain management for official + grey providers
- Watch history and progress tracking
- Watchlists and favorites management
- Recommendations: for-you, similar, trending, because-you-watched
- User profile and preferences routes
- Admin routes: stats, ban/unban, role change, visibility, merge duplicates, reports, audit log
- BullMQ workers: session-cleanup, trending, source-check, metadata-refresh
- Pseudo-live channel rotation algorithm (deterministic epoch-based)
- Swagger/OpenAPI docs at `http://localhost:3001/docs`
- `docker-compose.yml` for PostgreSQL + Redis local development

---

## [0.1.0] — 2024 — MVP Frontend

### Added

- Next.js 15 App Router with TypeScript and Tailwind CSS v4
- Core shared types: `AnimeSeries`, `Movie`, `LiveChannel`, `Episode`, `SourceProvider`
- Mock data layer (`src/data/mockData.ts`)
- Home page with hero banner and horizontal content rails
- Series detail page with `EpisodeList`
- Live channels page with `LiveChannelCard`
- Watch player page (`WatchPlayerShell`) with YouTube embed and external link fallback
- `SearchBar` component with routing
- UI components: `SourceBadge`, `GenrePill`, `MediaCard`, `MediaRail`
- `AppShell` layout with `TopNav`
- Zod-validated environment variables (`src/lib/env.ts`)
- Backend API client (`src/lib/backend.ts`) with mock data fallback
- Open Graph metadata helpers (`src/lib/og.ts`)
- Jest + React Testing Library configuration
- API route tests: series, movies, live, providers, search, images, quotes
- Component tests: MediaCard, HeroBanner, SearchBar, SourceBadge, GenrePill, WatchPlayerShell
- Page test: HomePage
- Jest manual mock for backend (`src/lib/__mocks__/backend.ts`)
- ESLint strict, TypeScript strict, Prettier — all enforced in CI
- GitHub Actions CI workflow: lint → typecheck → format check → tests
- Husky pre-commit hooks + commitlint (Conventional Commits)
- Channel lineup: Shonen Station (101), Retro Vault (102), Mecha Core (103), YouTube Premieres (104), Tubi Anime (105), Pluto TV Anime (106), RetroCrush Classics (107)
