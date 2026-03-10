# Otaku Channels

**Otaku Channels** is a browser-based anime TV guide and launcher that aggregates anime from official providers, community-maintained anime indexes, and vetted grey APIs/sources into a single couch-friendly interface.

> **Status:** Milestone 5 (User Accounts) ✅ complete — now progressing through Milestone 6 (Discovery & Content: trending, recommendations, continue watching).

---

## Table of Contents

- [Features](#features)
- [Channel lineup](#channel-lineup)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
  - [Frontend only (mock data)](#frontend-only-mock-data)
  - [Full stack with Docker](#full-stack-with-docker)
  - [Manual backend setup](#manual-backend-setup)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [Environment variables](#environment-variables)
- [Running tests](#running-tests)
- [Linting & formatting](#linting--formatting)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [Source policy](#source-policy)

---

## Features

- **Discover anime across the ecosystem** — series, movies, and clips from official platforms plus vetted grey/community sources.
- **Rich metadata** — thumbnails, episode numbers, genres, dub/sub flags, runtime, and MAL scores via Jikan, Kitsu, and Shikimori.
- **TV-style interface** — horizontal content rails, hero banner, and a faux cable-box channel guide.
- **Live channels** — pseudo-live channels with deterministic rotation so all viewers see the same schedule.
- **Universal search** — full-text search and filtering by genre, source, language, and content type.
- **Watch player** — opens official embeds where available or deep-links to the original source page, including approved grey-api-backed providers.
- **Watchlist & recently viewed** — local watchlist and watch-history hooks (backend persistence planned).
- **Skeleton loading states** — `MediaCardSkeleton`, `MediaRailSkeleton`, and `HeroBannerSkeleton` for smooth loading transitions.
- **Error boundaries** — graceful fallback UI on API failures.
- **Fully tested** — Jest + React Testing Library with CI gating.

---

## Channel lineup

| Channel | Name                |
| ------- | ------------------- |
| 101     | Shonen Station      |
| 102     | Retro Vault         |
| 103     | Mecha Core          |
| 104     | YouTube Premieres   |
| 105     | Tubi Anime          |
| 106     | Pluto TV Anime      |
| 107     | RetroCrush Classics |

---

## Tech stack

| Layer           | Technology                                              |
| --------------- | ------------------------------------------------------- |
| Frontend        | Next.js 15 (App Router) + TypeScript                    |
| Styling         | Tailwind CSS v4                                         |
| Icons           | Lucide React + React Icons                              |
| Validation      | Zod                                                     |
| Metadata APIs   | Jikan v4 (MAL), Kitsu (JSON:API), Shikimori (GraphQL)   |
| Backend         | Fastify + Prisma + PostgreSQL (in `backend/`)           |
| Background jobs | BullMQ cron workers                                     |
| Auth            | Argon2 + JWT sessions                                   |
| Search          | PostgreSQL full-text search                             |
| Video           | Official embeds only — no re-streaming                  |
| Testing         | Jest + React Testing Library                            |
| CI              | GitHub Actions (lint → typecheck → format check → test) |

---

## Getting started

### Prerequisites

- **Node.js 20+** — check with `node -v`
- **pnpm 9+** — install with `npm install -g pnpm`

### Frontend only (mock data)

The fastest way to run the project. No database or backend required.

```bash
git clone https://github.com/awest813/Otaku-Channels.git
cd Otaku-Channels
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The app renders with **mock data** by default — you'll see the full home screen, series cards, live channels, search, and hero banner without any backend.

### Full stack with Docker

Docker Compose spins up PostgreSQL and Redis automatically.

```bash
# From the repo root
docker-compose up -d          # start Postgres + Redis

cd backend
npm install
cp .env.example .env          # defaults work with docker-compose as-is
npm run db:migrate            # apply Prisma migrations
npm run db:seed               # seed 11 anime, 7 channels, approved sources
npm run dev                   # Fastify on http://localhost:3001
```

Then in a separate terminal:

```bash
# From the repo root
pnpm install
cp .env.example .env.local
# set BACKEND_URL=http://localhost:3001 in .env.local
pnpm dev                      # Next.js on http://localhost:3000
```

Swagger API docs are available at [http://localhost:3001/docs](http://localhost:3001/docs).

### Manual backend setup

See [`backend/README.md`](./backend/README.md) for a full breakdown of the Fastify API, scripts, endpoints, and the source governance policy.

---

## Project structure

```
Otaku-Channels/
├── src/
│   ├── app/                      # Next.js App Router pages & API routes
│   │   ├── api/                  # REST API route handlers (proxy to Fastify)
│   │   │   ├── series/           # GET /api/series, /api/series/:slug, episodes
│   │   │   ├── movies/           # GET /api/movies
│   │   │   ├── live/             # GET /api/live
│   │   │   ├── search/           # GET /api/search
│   │   │   ├── providers/        # GET /api/providers
│   │   │   ├── images/           # GET /api/images (waifu.pics)
│   │   │   ├── quotes/           # GET /api/quotes (AnimeChan)
│   │   │   └── streaming/        # GET /api/streaming/* (Consumet)
│   │   ├── browse/               # Browse page (genre + source filtering)
│   │   ├── live/                 # Live channels page
│   │   ├── series/               # Series detail pages
│   │   ├── search/               # Search results page
│   │   ├── settings/             # Settings page
│   │   ├── watch/                # Watch / player page
│   │   ├── watchlist/            # Watchlist page
│   │   ├── layout.tsx            # Root layout (AppShell)
│   │   └── page.tsx              # Home page
│   ├── components/
│   │   ├── media/                # HeroBanner, MediaCard, MediaRail,
│   │   │                         # LiveChannelCard, EpisodeList,
│   │   │                         # RecentlyViewedRail, skeleton components
│   │   ├── search/               # SearchBar
│   │   ├── ui/                   # SourceBadge, GenrePill, buttons, links
│   │   ├── watch/                # WatchPlayerShell
│   │   └── layout/               # AppShell, TopNav, Footer
│   ├── constant/                 # App-wide constants
│   ├── data/
│   │   └── mockData.ts           # Mock series, movies, channels, episodes
│   ├── hooks/
│   │   ├── useRecentlyViewed.ts  # Recently viewed history (localStorage)
│   │   └── useWatchlist.ts       # Watchlist state (localStorage)
│   ├── lib/
│   │   ├── backend.ts            # Backend API client (server-side only)
│   │   ├── env.ts                # Zod-validated env vars
│   │   ├── jikan.ts              # Jikan v4 (MyAnimeList) API client
│   │   ├── kitsu.ts              # Kitsu JSON:API client
│   │   ├── shikimori.ts          # Shikimori GraphQL client
│   │   ├── helper.ts             # Shared fetch utilities
│   │   ├── logger.ts             # Dev logger
│   │   ├── og.ts                 # Open Graph metadata helpers
│   │   ├── utils.ts              # cn() class name helper
│   │   └── __mocks__/
│   │       └── backend.ts        # Jest manual mock (no network calls)
│   ├── styles/
│   │   └── globals.css           # Tailwind base + custom utilities
│   └── types/
│       └── index.ts              # Shared TypeScript types
├── backend/                      # Fastify REST API + Prisma + BullMQ
├── public/                       # Static assets
├── src/__tests__/                # Jest test suites
└── docker-compose.yml            # PostgreSQL + Redis for local dev
```

---

## API reference

All Next.js API routes live under `/api/`. When `BACKEND_URL` is configured they proxy to the Fastify backend; otherwise they fall back to mock data.

| Method | Route                        | Description                                       |
| ------ | ---------------------------- | ------------------------------------------------- |
| GET    | `/api/series`                | List anime series (filterable)                    |
| GET    | `/api/series/:slug`          | Get series by slug                                |
| GET    | `/api/series/:slug/episodes` | Episode list for a series                         |
| GET    | `/api/movies`                | List anime movies (filterable)                    |
| GET    | `/api/live`                  | List live channels                                |
| GET    | `/api/search`                | Full-text search                                  |
| GET    | `/api/providers`             | List approved streaming sources (official + grey) |
| GET    | `/api/images`                | Random SFW anime image (waifu.pics)               |
| GET    | `/api/quotes`                | Random anime quote (AnimeChan)                    |
| GET    | `/api/streaming/search`      | Anime search via Consumet                         |
| GET    | `/api/streaming/info`        | Anime info via Consumet                           |
| GET    | `/api/streaming/sources`     | Episode sources via Consumet                      |

### Query parameters

**`/api/series` and `/api/movies`**

| Param      | Type   | Example    | Description                        |
| ---------- | ------ | ---------- | ---------------------------------- |
| `genre`    | string | `action`   | Filter by genre (case-insensitive) |
| `source`   | string | `youtube`  | Filter by source type              |
| `language` | string | `dub`      | Filter by language                 |
| `tag`      | string | `trending` | Filter by tag (case-insensitive)   |
| `sort`     | string | `recent`   | Sort order                         |
| `page`     | number | `1`        | Page number                        |
| `limit`    | number | `20`       | Results per page                   |

**`/api/search`** — requires at least one of `q`, `genre`, or `source`.

For the full Fastify backend API (auth, channels, watchlists, recommendations, admin, etc.), see [`backend/README.md`](./backend/README.md).

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in values as needed.

| Variable                  | Required | Default                  | Description                        |
| ------------------------- | -------- | ------------------------ | ---------------------------------- |
| `BACKEND_URL`             | No       | `http://localhost:3001`  | Fastify backend URL                |
| `NEXT_PUBLIC_SHOW_LOGGER` | No       | —                        | Set to `true` to enable dev logger |
| `WAIFUPICS_BASE_URL`      | No       | `https://api.waifu.pics` | Waifu.pics API base URL            |

For local UI-only development with mock data, **no environment variables are required** — the app works out of the box.

---

## Running tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

Tests use **Jest + React Testing Library**. API route tests use a Jest manual mock (`src/lib/__mocks__/backend.ts`) — no backend server is needed.

### Test coverage

| Area          | Description                                                                |
| ------------- | -------------------------------------------------------------------------- |
| API routes    | series, movies, live, providers, search, images, quotes                    |
| Components    | MediaCard, HeroBanner, SearchBar, SourceBadge, GenrePill, WatchPlayerShell |
| Pages         | HomePage                                                                   |
| Lib utilities | OG metadata                                                                |

---

## Linting & formatting

```bash
# Lint (strict — zero warnings allowed)
pnpm lint:strict

# Auto-fix lint issues and format
pnpm lint:fix

# TypeScript type check
pnpm typecheck

# Check formatting
pnpm format:check

# Format all files
pnpm format
```

The CI workflow (`.github/workflows/lint.yml`) runs all four checks on every push and pull request.

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/my-feature`
2. Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages (`feat:`, `fix:`, `chore:`, etc.)
3. Run `pnpm lint:strict && pnpm typecheck && pnpm test` before pushing
4. Open a pull request — CI must pass before merge

> Source submissions can include official providers and vetted grey APIs as long as they pass the project review policy. See [Source policy](#source-policy) below.

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the full milestone-based roadmap.

**Currently in progress: Milestone 6 — Discovery & Content**

- [x] Home screen with anime rails and hero banner
- [x] Series detail pages with episode list
- [x] Universal search UI
- [x] Live channels section with pseudo-live schedule
- [x] Watch player (embed + external link fallback)
- [x] Watchlist page + `useWatchlist` hook (localStorage)
- [x] Recently viewed rail + `useRecentlyViewed` hook
- [x] Skeleton loading states on all content areas
- [x] Metadata API clients: Jikan (MAL), Kitsu, Shikimori
- [x] CI workflow (lint → typecheck → format → tests)
- [x] Fastify backend with Prisma, PostgreSQL, Redis, BullMQ
- [ ] Wire Next.js routes to Fastify backend (replace mock data)
- [ ] User authentication (login / signup)
- [ ] Watchlist & favorites persistence (backend-backed)
- [ ] Sub/dub language filter UI
- [ ] Autoplay next episode

---

## Source policy

- We intentionally support both official platforms and vetted grey APIs/sources used by the anime community.
- Grey sources must be reviewable and stable (domain allowlisted + source health checks).
- Always preserve source attribution and send users to the origin host when required.
- **Do not** host, mirror, or rebroadcast content ourselves.
- **Do not** bypass DRM or paywalls.
- Admins can approve or remove source domains as provider reliability and policy needs evolve.
