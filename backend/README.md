# Otaku Channels — Backend

Node.js + TypeScript backend for Otaku Channels.

**Stack:** Fastify · PostgreSQL · Prisma ORM · Redis · BullMQ · Zod · JWT auth

---

## Quick Start (local dev)

### 1. Start PostgreSQL + Redis

```bash
# From repo root
docker-compose up -d
```

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env — the defaults work with docker-compose as-is
```

### 4. Run database migrations

```bash
npm run db:migrate
```

### 5. Seed sample data

```bash
npm run db:seed
```

This creates:
- Approved source domains (YouTube, Tubi, Pluto TV, RetroCrush, Crunchyroll, HIDIVE)
- 11 anime titles with genres, tags, sources, and episodes
- 7 themed channels (Retro Mecha, Shonen Power Hour, Cozy Slice of Life, etc.)
- A dev admin account: `admin@otakuchannels.local` / `Admin1234`

### 6. Start the dev server

```bash
npm run dev
```

Server starts at `http://localhost:3001`

API docs (Swagger UI): `http://localhost:3001/docs`

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled build |
| `npm run db:migrate` | Apply migrations (dev) |
| `npm run db:migrate:deploy` | Apply migrations (prod) |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Regenerate Prisma client |
| `npm test` | Run tests (Vitest) |
| `npm run typecheck` | TypeScript check |

---

## API Overview

All routes are prefixed with `/api/v1`.

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Revoke refresh token |
| GET | `/auth/me` | Current user |

### Anime Catalog

| Method | Path | Description |
|---|---|---|
| GET | `/anime` | List anime (filters: genre, type, year, source, sort) |
| GET | `/anime/trending` | Trending titles |
| GET | `/anime/featured` | Featured titles |
| GET | `/anime/genres` | All genres |
| GET | `/anime/:slug` | Anime detail with episodes |
| GET | `/anime/:slug/related` | Related anime |
| GET | `/anime/:slug/episodes` | Episode list |
| POST | `/anime` | *(Admin)* Create anime |
| PATCH | `/anime/:id` | *(Admin)* Update anime |

### Channels

| Method | Path | Description |
|---|---|---|
| GET | `/channels` | List public channels |
| GET | `/channels/featured` | Featured channels |
| GET | `/channels/:slug` | Channel detail |
| GET | `/channels/:slug/now-playing` | What is on now (pseudo-live) |
| GET | `/channels/:slug/schedule` | Full schedule |
| POST | `/channels/:slug/save` | Save channel to profile |
| DELETE | `/channels/:slug/save` | Unsave channel |
| POST | `/channels` | *(Admin)* Create channel |
| PATCH | `/channels/:id` | *(Admin)* Update channel |
| POST | `/channels/:id/program-blocks` | *(Admin)* Add anime block |
| POST | `/channels/:id/schedule` | *(Admin)* Set schedule slots |

### Search

| Method | Path | Description |
|---|---|---|
| GET | `/search?q=...` | Full-text search (title, alias, genre, year, source) |
| GET | `/search/suggest?q=...` | Quick autocomplete suggestions |

### Sources

| Method | Path | Description |
|---|---|---|
| GET | `/sources/domains` | List approved domains |
| POST | `/sources/domains` | *(Admin)* Approve domain |
| DELETE | `/sources/domains/:domain` | *(Admin)* Remove domain |
| GET | `/sources/anime/:animeId` | Sources for an anime |
| POST | `/sources/anime` | Submit a source link |
| PATCH | `/sources/:id/status` | *(Admin)* Change source status |
| GET | `/sources/pending` | *(Admin)* Pending review sources |

### Watch History & Progress

| Method | Path | Description |
|---|---|---|
| GET | `/watch-history` | Recent watch events |
| POST | `/watch-history` | Record a watch event |
| GET | `/watch-history/continue` | Continue watching list |
| PUT | `/watch-history/progress` | Upsert watch progress |
| GET | `/watch-history/progress/:episodeId` | Get episode progress |
| DELETE | `/watch-history/:id` | Remove history entry |

### Watchlists & Favorites

| Method | Path | Description |
|---|---|---|
| GET | `/watchlists` | User's watchlists |
| POST | `/watchlists` | Create watchlist |
| GET | `/watchlists/:id` | Watchlist detail |
| PATCH | `/watchlists/:id` | Update watchlist |
| DELETE | `/watchlists/:id` | Delete watchlist |
| POST | `/watchlists/:id/items` | Add anime to watchlist |
| PATCH | `/watchlists/:id/items/:animeId` | Update item status |
| DELETE | `/watchlists/:id/items/:animeId` | Remove item |
| GET | `/watchlists/favorites` | User's favorites |
| POST | `/watchlists/favorites` | Add to favorites |
| DELETE | `/watchlists/favorites/:animeId` | Remove from favorites |

### Recommendations

| Method | Path | Description |
|---|---|---|
| GET | `/recommendations/for-you` | Personalized recommendations |
| GET | `/recommendations/similar/:animeId` | Similar anime |
| GET | `/recommendations/trending` | Global trending |
| GET | `/recommendations/because-you-watched/:animeId` | Because you watched |

### Users / Profiles

| Method | Path | Description |
|---|---|---|
| GET | `/users/me/profile` | Get profile |
| PATCH | `/users/me/profile` | Update profile/preferences |
| GET | `/users/me/hidden` | Hidden titles |
| POST | `/users/me/hidden` | Hide a title |
| DELETE | `/users/me/hidden/:animeId` | Unhide |
| GET | `/users` | *(Admin)* List all users |

### Admin

| Method | Path | Description |
|---|---|---|
| GET | `/admin/stats` | Dashboard stats |
| PATCH | `/admin/users/:id/ban` | Ban / unban user |
| PATCH | `/admin/users/:id/role` | Change user role |
| PATCH | `/admin/anime/:id/visibility` | Show/hide/feature anime |
| POST | `/admin/anime/merge` | Merge duplicate titles |
| GET | `/admin/reports` | Pending reports |
| PATCH | `/admin/reports/:id` | Resolve report |
| GET | `/admin/audit` | Audit log |
| POST | `/admin/reports` | Submit a report (any user) |

### System

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/ready` | Readiness check (DB + Redis) |

---

## Source Allowlist

Only domains on the approved list can be used as source links. The initial seeded domains are:
- `www.youtube.com` (embeddable)
- `youtu.be` (embeddable)
- `tubitv.com`
- `pluto.tv`
- `www.retrocrush.tv`
- `www.crunchyroll.com`
- `hidive.com`

Admins can add or remove domains via `/api/v1/sources/domains`.

**Non-approved domain submissions are rejected at the API layer — no scraping, DRM bypass, or piracy infrastructure is supported.**

---

## Pseudo-Live Channels

Channels with type `SCHEDULED` use an epoch-based rotation algorithm to calculate "what is on now" without a live stream. The rotation is deterministic based on UTC time, so all clients see the same schedule.

The `GET /channels/:slug/now-playing` endpoint returns:
- `current` — the currently "playing" anime/slot
- `next` — the next slot
- `progressPercent` — how far through the current slot we are
- `remainingSec` — seconds until next slot

---

## What's Next

- Background jobs (BullMQ): trending score recomputation, source availability checks, stale token cleanup
- Metadata sync jobs pulling from Jikan (MyAnimeList public API)
- Full-text search upgrade with PostgreSQL tsvector indexes
- OAuth groundwork (Google/Discord)
- Public profiles page
- Analytics rollups
