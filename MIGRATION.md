# Backend-to-Frontend Wiring — Migration Checklist

This document tracks which screens and routes have been migrated off mock data
and are running against real backend seed data.

## Environment Setup

```bash
# In .env.local — set both to run fully against the backend
BACKEND_URL=http://localhost:3001
DATA_MODE=hybrid   # try backend, fall back to mock on failure
```

Run the backend before starting the frontend:

```bash
cd backend && npm run dev
# frontend
npm run dev
```

---

## Source policy note

The migration path supports both official providers and vetted grey anime sources. Route behavior, filtering, and fallback chains should treat both classes as first-class providers once domains are approved.

---

## API Routes

| Route                            | Wired | Mock Fallback | Notes                                                                                     |
| -------------------------------- | ----- | ------------- | ----------------------------------------------------------------------------------------- |
| `GET /api/series`                | ✅    | ✅            | `DATA_MODE` aware; filters: genre, source, language, tag, type, status, sort, page, limit |
| `GET /api/series/:slug`          | ✅    | ✅            | 404 when neither backend nor mock has the slug                                            |
| `GET /api/series/:slug/episodes` | ✅    | ✅            | Falls back to mock episodes keyed by slug                                                 |
| `GET /api/movies`                | ✅    | ✅            | Proxies `type=MOVIE`; same filter set as `/api/series`                                    |
| `GET /api/live`                  | ✅    | ✅            | Source/type filter applied on response                                                    |
| `GET /api/search`                | ✅    | ✅            | Chain: backend → Jikan → mock → empty                                                     |
| `GET /api/providers`             | ✅    | ✅            | Falls back to `sourceProviders` from mock data                                            |

---

## Frontend Pages

| Page          | Route                  | Data Source                                            | Off Mock? | Notes                                                                                          |
| ------------- | ---------------------- | ------------------------------------------------------ | --------- | ---------------------------------------------------------------------------------------------- |
| Home          | `/`                    | `lib/backend.ts` (server component)                    | ✅        | try backend → mock fallback for series, movies, channels                                       |
| Browse        | `/browse`              | `lib/backend.ts` (server component)                    | ✅        | try backend → mock fallback                                                                    |
| Live Channels | `/live`                | `lib/backend.ts` (server component)                    | ✅        | try backend → mock fallback                                                                    |
| Series Detail | `/series/[slug]`       | `lib/backend.ts` (server component)                    | ✅        | try backend → Jikan (for `jikan-*` slugs) → mock fallback                                      |
| Search        | `/search`              | `lib/api-client.ts` → `/api/search` (client component) | ✅        | backend → Jikan → mock; previously called Jikan directly                                       |
| Watch         | `/watch/[source]/[id]` | Static / URL params                                    | ✅        | No backend call; renders embedded/deep-link player from URL (official or approved grey source) |
| Watchlist     | `/watchlist`           | `localStorage`                                         | ✅        | Client-side only; no backend dependency                                                        |
| Settings      | `/settings`            | `localStorage`                                         | ✅        | Client-side only                                                                               |

---

## Shared Infrastructure

| Deliverable                        | Status | Location                                  |
| ---------------------------------- | ------ | ----------------------------------------- |
| Typed API response envelopes       | ✅     | `src/types/api.ts`                        |
| Browser-side API client with retry | ✅     | `src/lib/api-client.ts`                   |
| Backend normalizers                | ✅     | `src/lib/backend.ts`                      |
| `DATA_MODE` env variable support   | ✅     | `src/lib/data-mode.ts` + `src/lib/env.ts` |
| Mock fallback in all 7 API routes  | ✅     | Each `src/app/api/*/route.ts`             |
| Route contract smoke tests         | ✅     | `src/__tests__/api/smoke.test.ts`         |
| API client unit tests              | ✅     | `src/__tests__/lib/apiClient.test.ts`     |
| Jest manual backend mock           | ✅     | `src/lib/__mocks__/backend.ts`            |

---

## DATA_MODE Reference

| Value                       | Behaviour                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `mock`                      | Always return static mock data. Backend is never contacted. Ideal for UI-only development.          |
| `backend`                   | Always call Fastify. Returns 502 if backend is unavailable. Use for staging/production.             |
| `hybrid`                    | Try backend first; fall back to mock data if the call fails. **Default when `BACKEND_URL` is set.** |
| _(unset, no `BACKEND_URL`)_ | Equivalent to `mock`.                                                                               |

---

## Done Definition

- [x] Home, browse, live pages fetch from backend when `BACKEND_URL` is set
- [x] Series detail page fetches from backend (falls back through Jikan then mock)
- [x] Search page uses `/api/search` (backend → Jikan → mock chain)
- [x] All 7 Next.js API routes have mock fallback — no more 502 in dev
- [x] `src/types/api.ts` defines typed envelopes for all route responses
- [x] `src/lib/api-client.ts` provides a typed browser client with retry
- [x] 153 tests passing (24 test suites)
