# Otaku Channels — Roadmap

This document tracks the planned features and milestones for Otaku Channels.

---

## Milestone 1 — Foundation ✅ (complete)

- [x] Next.js 15 App Router skeleton
- [x] TypeScript + Tailwind CSS v4 setup
- [x] Mock data layer (`src/data/mockData.ts`)
- [x] Core types (`AnimeSeries`, `Movie`, `LiveChannel`, `Episode`, `SourceProvider`)
- [x] Home page with hero banner and content rails
- [x] Series detail page
- [x] Live channels page
- [x] Watch player (YouTube embed + external link fallback)
- [x] SearchBar component
- [x] SourceBadge, GenrePill, MediaCard, MediaRail, LiveChannelCard
- [x] AppShell layout with navigation

---

## Milestone 2 — CI & Test Suite ✅ (complete)

- [x] Jest + React Testing Library configuration
- [x] API route tests (series, movies, live, providers, search, images, quotes)
- [x] Component tests (MediaCard, HeroBanner, SearchBar, SourceBadge, GenrePill, WatchPlayerShell)
- [x] Page tests (HomePage)
- [x] Jest manual mock for backend (`src/lib/__mocks__/backend.ts`)
- [x] Jest mock for `next/image` that strips Next.js-only DOM props (no React warnings)
- [x] ESLint strict (`--max-warnings=0`) — zero warnings
- [x] TypeScript strict mode — zero errors
- [x] Prettier formatting — enforced in CI
- [x] GitHub Actions workflow (lint → typecheck → format check → tests)

---

## Milestone 3 — Backend Integration 🚧 (in progress)

- [x] Fastify REST API server (`backend/`)
- [x] PostgreSQL schema via Prisma
- [x] Seed script with real anime data
- [x] `/api/v1/anime` — list + filter + pagination
- [x] `/api/v1/anime/:slug` — series detail
- [x] `/api/v1/anime/:slug/episodes` — episode list
- [x] `/api/v1/search` — full-text search
- [x] `/api/v1/channels` — live channels
- [x] `/api/v1/sources/domains` — approved providers
- [x] `/api/v1/profiles/:username` — public profile endpoint
- [x] `/api/v1/moderation/queue` — moderation queue with batch actions
- [x] BullMQ workers (session-cleanup, trending, source-check, metadata-refresh)
- [ ] Wire Next.js API routes to Fastify backend
- [ ] Remove dependency on mock data for production builds

---

## Milestone 4 — User Accounts 📅 (planned)

- [ ] User registration & login (Argon2 + JWT sessions)
- [ ] Favorites / watchlist (add/remove series and movies)
- [ ] Watch history tracking
- [ ] User preferences (default language: sub/dub, preferred sources)
- [ ] Profile page

---

## Milestone 5 — Discovery & Content 📅 (planned)

- [ ] Trending anime (view count / trending score)
- [ ] Recommended for you (genre-based)
- [ ] Sub/dub language filter UI
- [ ] Source filter UI (YouTube, Tubi, Pluto TV, etc.)
- [ ] Genre browse page with all anime by genre
- [ ] Autoplay next episode
- [ ] "Continue watching" rail on home page

---

## Milestone 6 — Streaming Integration 📅 (planned)

- [ ] Consumet API integration (gogoanime, Zoro, AnimePahe)
- [ ] Episode source resolution (HLS → official player handoff)
- [ ] Graceful fallback when Consumet is unavailable
- [ ] Source quality selector

---

## Milestone 7 — Polish & Accessibility 📅 (planned)

- [ ] Keyboard navigation (10-foot / couch mode)
- [ ] Controller / gamepad support
- [ ] ARIA labels and screen reader support
- [ ] Skeleton loading states on all content rails
- [ ] Error boundaries with retry UI
- [ ] PWA manifest + installable on mobile/desktop
- [ ] Sleep timer
- [ ] Dark/light theme toggle

---

## Milestone 8 — Production & Deployment 📅 (planned)

- [ ] Vercel deployment (frontend)
- [ ] Fly.io or Railway deployment (Fastify backend)
- [ ] PostgreSQL + Redis hosted instances
- [ ] BullMQ cron workers for metadata refresh
- [ ] Uptime monitoring
- [ ] Rate limiting on all public API routes
- [ ] CDN for thumbnails and hero images

---

## Nice-to-have / Future ideas

- Faux channel guide (grid schedule view)
- Anime stations by vibe (Shonen, Retro, Mecha, Chill, Fantasy)
- Kiosk / couch fullscreen mode
- RSS / publisher feed ingestion for user-added sources
- Clip / highlight reels
- Notifications for new episodes
- Social features (activity feed, lists)

---

## Legend

| Symbol | Meaning     |
| ------ | ----------- |
| ✅     | Complete    |
| 🚧     | In progress |
| 📅     | Planned     |
