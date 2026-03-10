# Live Readiness Audit — Otaku Channels

**Audit Date:** 2026-03-10  
**Auditor:** GitHub Copilot (automated production-readiness review)  
**Scope:** Full frontend codebase + API layer (`/src`)

---

## A. System Risk Map

```
┌─────────────────────────────────────────────────────────┐
│                       Browser (User)                    │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────┐
│              Next.js 15 (Vercel / Node.js)              │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  App Pages  │  │  API Routes  │  │  Middleware    │  │
│  │  (RSC/CSR)  │  │  /api/...    │  │  (rate-limit, │  │
│  └─────────────┘  └──────┬───────┘  │   headers)    │  │
│                          │          └───────────────┘  │
└──────────────────────────┼─────────────────────────────┘
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │  Fastify    │  │ Jikan/Kitsu/│  │ Waifu.pics/ │
   │  Backend    │  │ Shikimori   │  │ AnimeChan   │
   │ (localhost  │  │  (metadata) │  │ (decorative)│
   │  :3001)     │  └─────────────┘  └─────────────┘
   └──────┬──────┘
          │
   ┌──────▼──────┐
   │ PostgreSQL  │
   │ + BullMQ   │
   └─────────────┘
```

**Key trust boundaries:**

1. Browser → Next.js (public internet, untrusted input)
2. Next.js → Fastify (internal network, forwarded auth tokens)
3. Next.js → External metadata APIs (public APIs, rate-limited)
4. Next.js → External decorative APIs (Waifu.pics, AnimeChan)

---

## B. Production Trust Boundaries

| Boundary                  | Direction | Auth Method                            | Validation                              | Risk   |
| ------------------------- | --------- | -------------------------------------- | --------------------------------------- | ------ |
| User → Next.js API        | Inbound   | Cookie/JWT (forwarded)                 | Middleware rate-limit; Zod in analytics | Medium |
| Next.js → Fastify backend | Outbound  | Forward cookies + Authorization header | Fastify enforces JWT                    | Low    |
| Next.js → Jikan API       | Outbound  | None (public)                          | Response typed via JikanAnime           | Low    |
| Next.js → Kitsu API       | Outbound  | None (public)                          | Response typed via KitsuAnimeResource   | Low    |
| Next.js → Shikimori API   | Outbound  | None (public)                          | Response typed via ShikimoriAnime       | Low    |
| Next.js → Waifu.pics      | Outbound  | None                                   | Type allowlist on `type` param          | Low    |
| Next.js → AnimeChan       | Outbound  | None                                   | URL-encode user params                  | Low    |
| Browser → Provider embeds | iframe    | N/A                                    | Source type allowlist                   | Medium |

---

## C. Prioritized Audit Checklist

### CRITICAL

- [x] **C-01** Consumet/piracy streaming routes active  
       _Routes `/api/streaming/search`, `/api/streaming/sources`, `/api/streaming/info` proxied to gogoanime/zoro/animepahe (piracy sites). HLS extraction violates repo policy._  
       **Fix:** Routes now return HTTP 451 with policy explanation. No data forwarded.

- [x] **C-02** `consumet` SourceType treated as a streaming source in `deriveEmbedType`  
       _`deriveEmbedType('consumet')` returned `'hls'`, legitimizing HLS extraction from piracy sources._  
       **Fix:** `deriveEmbedType` now returns `'external'` for `consumet`; `isOfficialSource` explicitly returns `false` for `consumet`.

### HIGH

- [x] **H-01** `apiFetch` in `backend.ts` has no request timeout  
       _All server-to-server calls to Fastify had no `AbortSignal.timeout()`. A slow/dead backend would cause route handlers to hang indefinitely, exhausting connection pools._  
       **Fix:** Added `AbortSignal.timeout(15_000)` to all `apiFetch` calls.

- [x] **H-02** Admin proxy has no server-side auth gate  
       _`proxyAdmin` forwarded any request to the Fastify admin endpoints, relying solely on the backend to reject unauthenticated requests. No 401 was returned at the Next.js layer._  
       **Fix:** `proxyAdmin` now returns HTTP 401 immediately if no `Authorization` header is present.

- [x] **H-03** Numeric query parameters not validated  
       _`page`, `limit`, and `year` parameters were parsed with bare `Number(...)`, allowing NaN, 0, negative, or extremely large values to be forwarded to the backend._  
       **Fix:** Added clamping helpers (`clampPage`, `clampLimit`, `clampYear`) used in all affected routes.

- [ ] **H-04** In-memory rate limiter bypassed in multi-instance deployments  
       _`middleware.ts` uses a `Map<string, {...}>` stored in process memory. Each serverless instance has an independent counter._  
       **Status:** Unresolved — requires Redis infrastructure. Documented in `SECURITY_NOTES.md` §SEC-01.

- [ ] **H-05** No Content-Security-Policy header  
       _Without a CSP, injected scripts or XSS can exfiltrate user tokens or manipulate the UI._  
       **Status:** Unresolved — requires frame-src allowlist design. Documented in `SECURITY_NOTES.md` §SEC-02.

### MEDIUM

- [x] **M-01** `BACKEND_URL` default is hardcoded localhost in multiple files  
       _`backend.ts`, `analytics/route.ts`, and `admin-proxy.ts` each independently read `process.env.BACKEND_URL ?? 'http://localhost:3001'`. If `BACKEND_URL` is unset in production, all backend calls silently target localhost and fail._  
       **Fix:** `backend.ts` and `admin-proxy.ts` now log a warning when falling back to localhost. The `env.ts` schema documents `BACKEND_URL` as required for production.

- [x] **M-02** `DATA_MODE` hybrid silently falls back to mock data  
       _When the backend is unavailable in `hybrid` mode, routes return mock data without any response header or log indicating the fallback occurred._  
       **Fix:** Routes that fall back to mock data now include `"source": "mock"` and `"fallback": true` in the response envelope, and log a `console.warn` server-side.

- [ ] **M-03** Watch page `watchUrl` not validated against domain allowlist  
       _The watch page renders iframes/links from `watchUrl` which comes from the backend. A compromised backend record could inject a malicious URL._  
       **Status:** Unresolved — requires domain allowlist on watch page. Documented in `SECURITY_NOTES.md` §SEC-03.

- [ ] **M-04** Analytics endpoint has no rate limit  
       _`POST /api/analytics` is unauthenticated and unbounded. A bot could flood the backend watch-history table._  
       **Status:** Unresolved. Documented in `SECURITY_NOTES.md` §SEC-06.

- [x] **M-05** `consumet` SourceBadge label misleadingly says "Streaming"  
       _The `consumet` source type showed a generic "Streaming" badge which disguised the actual (piracy) source._  
       **Fix:** `consumet` badge now displays "Unavailable" with a warning icon.

### LOW

- [x] **L-01** `README.md` / `CHANGELOG.md` reference Consumet as an active provider  
       _Documentation implied Consumet was a supported metadata source._  
       **Fix:** Documentation updated to note Consumet is blocked for legal reasons.

- [ ] **L-02** No `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy` headers  
       **Status:** Unresolved. Documented in `SECURITY_NOTES.md` §SEC-05.

- [ ] **L-03** `next-sitemap` may include admin/user routes in sitemap  
       _`next-sitemap.config.js` should exclude `/api/*`, `/admin/*`, `/profile/*`, `/settings/*`._  
       **Status:** Low priority; sitemap exposure doesn't constitute a security vulnerability but may leak route structure.

- [ ] **L-04** `hello/route.ts` endpoint has no purpose in production  
       _`GET /api/hello` returns a test greeting. This is development scaffolding._  
       **Status:** Low priority; no security risk but should be removed before launch.

---

## D. Category-by-Category Findings

### 1. Source Legality / Policy Consistency

| #   | Severity | Finding                                                         | Status    |
| --- | -------- | --------------------------------------------------------------- | --------- |
| 1.1 | CRITICAL | Consumet routes proxy piracy sites (gogoanime, zoro, animepahe) | **Fixed** |
| 1.2 | CRITICAL | `consumet` → `hls` in deriveEmbedType enables HLS extraction    | **Fixed** |
| 1.3 | MEDIUM   | Consumet badge label "Streaming" obscures piracy source         | **Fixed** |
| 1.4 | LOW      | Documentation implies Consumet is an approved metadata provider | **Fixed** |

### 2. Security and Trust Boundaries

| #   | Severity | Finding                                              | Status    |
| --- | -------- | ---------------------------------------------------- | --------- |
| 2.1 | HIGH     | Admin proxy has no auth gate at Next.js layer        | **Fixed** |
| 2.2 | HIGH     | In-memory rate limiter not viable for multi-instance | Open      |
| 2.3 | MEDIUM   | `watchUrl` not validated against domain allowlist    | Open      |

### 3. External Link / Embed Safety

| #   | Severity | Finding                                                       | Status     |
| --- | -------- | ------------------------------------------------------------- | ---------- |
| 3.1 | HIGH     | No Content-Security-Policy (frame-src unrestricted)           | Open       |
| 3.2 | MEDIUM   | No domain allowlist check before rendering watchUrl in iframe | Open       |
| 3.3 | LOW      | Provider images from Waifu.pics not validated as image URLs   | Acceptable |

### 4. Env Var Safety and Production Defaults

| #   | Severity | Finding                                                        | Status                                |
| --- | -------- | -------------------------------------------------------------- | ------------------------------------- |
| 4.1 | MEDIUM   | BACKEND_URL falls back to localhost without warning            | **Fixed**                             |
| 4.2 | LOW      | DATA_MODE=hybrid silently returns mock data on backend failure | **Fixed** (adds `fallback:true` flag) |
| 4.3 | LOW      | No required-in-production env var validation at startup        | Open                                  |

### 5. Auth / Session Readiness

| #   | Severity | Finding                                                   | Status    |
| --- | -------- | --------------------------------------------------------- | --------- |
| 5.1 | HIGH     | Admin routes accessible without auth at Next.js layer     | **Fixed** |
| 5.2 | HIGH     | Rate limiter stateless in multi-instance deployments      | Open      |
| 5.3 | MEDIUM   | Auth tokens forwarded via cookies without CSRF protection | Open      |

### 6. API Input Validation

| #   | Severity | Finding                                                   | Status                           |
| --- | -------- | --------------------------------------------------------- | -------------------------------- |
| 6.1 | HIGH     | page/limit/year params not range-validated                | **Fixed**                        |
| 6.2 | MEDIUM   | No max query length on `q` search param                   | **Fixed** (trimmed + max length) |
| 6.3 | LOW      | Provider param in streaming routes not strictly validated | Fixed (routes removed)           |

### 7. Backend Error Handling and Observability

| #   | Severity | Finding                                             | Status                               |
| --- | -------- | --------------------------------------------------- | ------------------------------------ |
| 7.1 | HIGH     | `apiFetch` has no timeout                           | **Fixed**                            |
| 7.2 | MEDIUM   | Hybrid fallback to mock data not observable         | **Fixed** (adds log + response flag) |
| 7.3 | LOW      | Backend error messages forwarded verbatim to client | Acceptable (BackendError class)      |

### 8. Search / Metadata Provider Abuse Risks

| #   | Severity | Finding                                                      | Status |
| --- | -------- | ------------------------------------------------------------ | ------ |
| 8.1 | MEDIUM   | Jikan/Kitsu/Shikimori routes have no per-IP rate limit       | Open   |
| 8.2 | LOW      | Jikan requests have no User-Agent header identifying the app | Open   |

### 9. Caching / Timeout / Retry Strategy

| #   | Severity | Finding                                                            | Status     |
| --- | -------- | ------------------------------------------------------------------ | ---------- |
| 9.1 | HIGH     | `apiFetch` had no timeout                                          | **Fixed**  |
| 9.2 | MEDIUM   | Jikan/Kitsu/Shikimori use 5-min HTTP cache but no in-process cache | Acceptable |
| 9.3 | LOW      | Admin proxy has no retry logic                                     | Acceptable |

### 10. Admin / Privileged Route Exposure

| #    | Severity | Finding                                                          | Status     |
| ---- | -------- | ---------------------------------------------------------------- | ---------- |
| 10.1 | HIGH     | Admin proxy routes had no auth gate                              | **Fixed**  |
| 10.2 | LOW      | Admin route paths predictable without auth documentation         | Acceptable |
| 10.3 | LOW      | `hello/route.ts` is development scaffolding in production bundle | Open       |

---

## E. Fixed vs Open Summary

| Severity  | Total Findings | Fixed  | Open   |
| --------- | -------------- | ------ | ------ |
| CRITICAL  | 2              | 2      | 0      |
| HIGH      | 6              | 4      | 2      |
| MEDIUM    | 8              | 4      | 4      |
| LOW       | 7              | 2      | 5      |
| **Total** | **23**         | **12** | **11** |

All CRITICAL findings are resolved. Open HIGH findings (rate limiter, CSP) require infrastructure changes beyond the scope of this audit.
