# Otaku Channels

**Otaku Channels** is a browser-based anime TV guide and launcher that aggregates legally free anime from official sources — YouTube, Tubi, Pluto TV, RetroCrush, and more — into a single couch-friendly interface.

> **Status:** Active development — UI works with mock data. Backend API integration is in progress.

---

## Table of Contents

- [What it does](#what-it-does)
- [Tech stack](#tech-stack)
- [Getting started (testers & contributors)](#getting-started-testers--contributors)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [Environment variables](#environment-variables)
- [Running tests](#running-tests)
- [Linting & formatting](#linting--formatting)
- [Roadmap](#roadmap)
- [Legal guardrails](#legal-guardrails)

---

## What it does

- Finds officially free anime episodes, clips, live channels, and movies from legal sources.
- Pulls metadata (thumbnails, episode numbers, genres, dub/sub flags, runtime).
- Displays everything in a TV-style interface with horizontal content rows.
- Opens content in official embeds or deep-links to the source platform.
- Supports universal search and filtering by genre, source, language, and type.

### Channel lineup (faux cable-box feel)

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

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | Next.js 15 (App Router) + TypeScript          |
| Styling    | Tailwind CSS v4                               |
| Icons      | Lucide React + React Icons                    |
| Validation | Zod                                           |
| Backend    | Fastify + Prisma + PostgreSQL (in `backend/`) |
| Search     | Postgres full-text (planned: Meilisearch)     |
| Jobs       | BullMQ cron workers                           |
| Auth       | Argon2 + JWT sessions                         |
| Video      | Official embeds only (no re-streaming)        |

---

## Getting started (testers & contributors)

### Prerequisites

- **Node.js 20+** — check with `node -v`
- **pnpm 9+** — install with `npm install -g pnpm`

### 1. Clone and install

```bash
git clone https://github.com/awest813/Otaku-Channels.git
cd Otaku-Channels
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in values as needed. For local UI testing with mock data, **no variables are required** — the app works out of the box.

| Variable                  | Required | Default                  | Description                        |
| ------------------------- | -------- | ------------------------ | ---------------------------------- |
| `BACKEND_URL`             | No       | `http://localhost:3001`  | URL of the Fastify backend         |
| `NEXT_PUBLIC_SHOW_LOGGER` | No       | —                        | Set to `true` to enable dev logger |
| `WAIFUPICS_BASE_URL`      | No       | `https://api.waifu.pics` | Waifu.pics API base URL            |

### 3. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> The UI renders with **mock data** by default when no backend is configured. You will see the full home screen, series cards, live channels, search, and hero banner.

### 4. (Optional) Run the Fastify backend

The backend lives in `backend/`. It requires PostgreSQL and Redis.

```bash
cd backend
npm install
# configure backend/.env
npm run dev
```

---

## Project structure

```
Otaku-Channels/
├── src/
│   ├── app/                    # Next.js App Router pages & API routes
│   │   ├── api/                # REST API route handlers
│   │   │   ├── series/         # GET /api/series, /api/series/:slug, episodes
│   │   │   ├── movies/         # GET /api/movies
│   │   │   ├── live/           # GET /api/live
│   │   │   ├── search/         # GET /api/search
│   │   │   ├── providers/      # GET /api/providers
│   │   │   ├── images/         # GET /api/images (waifu.pics)
│   │   │   ├── quotes/         # GET /api/quotes (AnimeChan)
│   │   │   └── streaming/      # GET /api/streaming/* (Consumet)
│   │   ├── browse/             # Browse page
│   │   ├── live/               # Live channels page
│   │   ├── series/             # Series detail pages
│   │   ├── search/             # Search results page
│   │   ├── settings/           # Settings page
│   │   ├── watch/              # Watch / player page
│   │   ├── layout.tsx          # Root layout (AppShell)
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── media/              # HeroBanner, MediaCard, MediaRail, LiveChannelCard, EpisodeList
│   │   ├── search/             # SearchBar
│   │   ├── ui/                 # SourceBadge, GenrePill, Skeleton, buttons, links
│   │   └── layout/             # AppShell, navigation
│   ├── data/
│   │   └── mockData.ts         # Mock series, movies, channels, episodes
│   ├── lib/
│   │   ├── backend.ts          # Backend API client (server-side only)
│   │   ├── env.ts              # Zod-validated env vars
│   │   ├── utils.ts            # cn() class name helper
│   │   └── __mocks__/
│   │       └── backend.ts      # Jest manual mock (no network calls)
│   └── types/
│       └── index.ts            # Shared TypeScript types
├── backend/                    # Fastify REST API + Prisma + BullMQ
├── public/                     # Static assets
└── src/__tests__/              # Jest test suites
```

---

## API reference

All API routes live under `/api/`. They proxy to the Fastify backend when `BACKEND_URL` is set.

| Method | Route                        | Description                         |
| ------ | ---------------------------- | ----------------------------------- |
| GET    | `/api/series`                | List anime series (filterable)      |
| GET    | `/api/series/:slug`          | Get series by slug                  |
| GET    | `/api/series/:slug/episodes` | Get episode list for a series       |
| GET    | `/api/movies`                | List anime movies (filterable)      |
| GET    | `/api/live`                  | List live channels                  |
| GET    | `/api/search`                | Search anime/movies                 |
| GET    | `/api/providers`             | List approved streaming sources     |
| GET    | `/api/images`                | Random SFW anime image (waifu.pics) |
| GET    | `/api/quotes`                | Random anime quotes (AnimeChan)     |
| GET    | `/api/streaming/search`      | Search via Consumet                 |
| GET    | `/api/streaming/info`        | Anime info via Consumet             |
| GET    | `/api/streaming/sources`     | Episode sources via Consumet        |

### Common query parameters

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

**`/api/search`** — at least one of `q`, `genre`, or `source` is required.

---

## Environment variables

See `.env.example` for a full list. Key variables:

```env
# Backend API URL (Next.js API routes proxy to this)
BACKEND_URL=http://localhost:3001

# Show development logger overlay
NEXT_PUBLIC_SHOW_LOGGER=true

# Override Waifu.pics API base (optional)
WAIFUPICS_BASE_URL=https://api.waifu.pics
```

---

## Running tests

```bash
# Run all tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

Tests use **Jest + React Testing Library**. API route tests use a Jest manual mock (`src/lib/__mocks__/backend.ts`) so no backend server is needed.

### Test coverage summary

| Area          | Suites | Description                                                                |
| ------------- | ------ | -------------------------------------------------------------------------- |
| API routes    | 9      | series, movies, live, providers, search, images, quotes                    |
| Components    | 6      | MediaCard, HeroBanner, SearchBar, SourceBadge, GenrePill, WatchPlayerShell |
| Pages         | 1      | HomePage                                                                   |
| Lib utilities | 1      | OG metadata                                                                |

---

## Linting & formatting

```bash
# Lint (strict, max 0 warnings)
pnpm lint:strict

# Auto-fix lint issues + format
pnpm lint:fix

# Type check
pnpm typecheck

# Check formatting
pnpm format:check

# Format all files
pnpm format
```

The CI workflow (`.github/workflows/lint.yml`) runs all four checks on every push and pull request.

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the full project roadmap.

**Current milestone: MVP polish**

- [x] Home screen with anime rows (mock data)
- [x] Series detail pages
- [x] Universal search UI
- [x] Live channels section
- [x] Watch player (YouTube embed + external link fallback)
- [x] Jest test suite (17 suites, 84 tests — all passing)
- [x] CI workflow (lint + typecheck + prettier + tests)
- [ ] Backend API integration (replace mock data with real Fastify backend)
- [ ] User auth (login/signup)
- [ ] Favorites / watchlist persistence
- [ ] Sub/dub language filter UI
- [ ] Autoplay next episode

---

## Legal guardrails

- Ingest only from sources with permission or public APIs/feeds.
- Respect `robots.txt` and platform Terms of Service.
- **Do not** rip or proxy HLS streams.
- **Do not** remove ads from official players.
- **Do not** rebroadcast paid or geo-locked content.
- Always show source attribution and open official platforms when required.
