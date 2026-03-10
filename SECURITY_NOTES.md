# Security Notes — Otaku Channels

**Status:** Active  
**Last Updated:** 2026-03-10  
**Audience:** Developers, DevOps, Security reviewers

---

## Summary

This document records known security considerations, mitigations in place, and outstanding risks that require attention before production deployment.

---

## 1. Authentication & Session

### JWT / Argon2 (Backend)

- Password hashing uses Argon2 (backend/Fastify). No plain-text passwords stored.
- JWT tokens are issued by the Fastify backend. Next.js routes proxy auth cookies.
- The Next.js layer **never generates or verifies JWTs directly** — it forwards cookies.

### Rate Limiting (Middleware)

- **Status:** Partial. `middleware.ts` implements a per-instance in-memory counter for `/api/auth/*` routes.
- **Risk:** In a multi-instance (serverless/container) deployment, each instance has an independent counter. A bot distributing requests across instances can bypass the limit.
- **Recommendation:** Replace with Upstash Redis-backed rate limiting (e.g., `@upstash/ratelimit`) for production.

### Admin Route Authorization

- **Status:** Fixed. Admin proxy (`src/lib/admin-proxy.ts`) returns HTTP 401 if no `Authorization` header is present on the Next.js side.
- The Fastify backend also independently enforces JWT auth on all `/api/v1/admin/*` routes.
- Defense-in-depth: both layers enforce auth.

---

## 2. Input Validation

### Query Parameter Validation

- **Status:** Fixed. Numeric parameters (`page`, `limit`, `year`) are validated and clamped to safe ranges in all route handlers.
- Search parameter `q` is trimmed and must be non-empty (checked at route level).
- String parameters passed to external APIs are URL-encoded before concatenation.

### Request Body Validation

- Analytics endpoint (`/api/analytics`) uses Zod schema validation. All fields are validated before forwarding to backend.
- Auth routes (login, register) forward raw bodies to the backend which performs Zod validation.

### Prototype Pollution / Injection

- All external API responses are treated as `unknown` and narrowed through typed ingestion functions.
- No `eval`, `Function()`, or dynamic code execution in any route handler.

---

## 3. SSRF (Server-Side Request Forgery)

### Backend Proxy

- `BACKEND_URL` is set via environment variable. In `src/lib/backend.ts` and `src/lib/admin-proxy.ts`, all requests go to `${BACKEND_URL}/api/v1/...`.
- The path suffix is **hardcoded** in each route handler — not user-controlled.
- **Risk level:** Low — as long as `BACKEND_URL` is not user-controlled, SSRF is not exploitable.
- **Recommendation:** Validate `BACKEND_URL` format in env.ts (already validated as a Zod URL schema).

### External API Proxies (Images, Quotes)

- `/api/images` proxies to `WAIFUPICS_BASE_URL`. The type parameter is validated against a strict allowlist.
- `/api/quotes` proxies to `ANIMECHAN_BASE_URL`. The `anime` and `character` parameters are URL-encoded.
- Both base URLs are set via environment variable and validated as URLs in `src/lib/env.ts`.
- **Risk level:** Low — base URLs are not user-controlled.

---

## 4. Streaming Route Legal & Security Block

### Consumet / Piracy Provider Routes

- **Status:** Blocked. Routes `/api/streaming/search`, `/api/streaming/sources`, and `/api/streaming/info` return HTTP 451 (Unavailable For Legal Reasons) and never proxy to Consumet or scraper-based providers.
- **Reason:** gogoanime, zoro, and animepahe are unauthorized scrapers that distribute pirated content. Proxying their streams violates the repo's source policy.
- **See also:** `SOURCE_POLICY.md` §3.1 and §3.2.

---

## 5. Open Redirect

### Watch Page

- The watch page (`/app/watch/[source]/[id]`) renders content from episode `watchUrl` fields.
- `watchUrl` values are stored in the database and originate from the ingestion pipeline.
- The ingestion pipeline only accepts URLs from approved source types (see `SOURCE_POLICY.md` §2).
- **Recommendation:** Add a server-side URL validation step in the watch page that verifies the `watchUrl` domain is in the approved domain allowlist.

---

## 6. Content Security Policy (CSP)

- **Status:** Not yet implemented. No `Content-Security-Policy` header is set.
- **Risk:** Without CSP, injected scripts from third-party iframes or XSS vulnerabilities can exfiltrate user data.
- **Recommendation (High priority):** Implement a CSP that:
  - Allows `frame-src` only for approved embed domains (youtube.com, tubi.tv, pluto.tv, retrocrush.tv).
  - Sets `default-src 'self'`.
  - Disallows inline scripts except where explicitly needed.

---

## 7. Security Headers

The following security headers are applied via `middleware.ts` and `next.config.js`:

| Header                      | Value                                      | Notes                                            |
| --------------------------- | ------------------------------------------ | ------------------------------------------------ |
| `X-Frame-Options`           | `SAMEORIGIN`                               | Prevents clickjacking                            |
| `X-Content-Type-Options`    | `nosniff`                                  | Prevents MIME sniffing                           |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`          | Limits referrer leakage                          |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()` | Disables hardware APIs                           |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`      | HTTPS-only (middleware adds when HTTPS detected) |

**Missing:**

- `Content-Security-Policy` (see §6)
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`

---

## 8. Dependency Security

- No known critical vulnerabilities in production dependencies at last audit.
- Run `npm audit` before each release.
- `zod` is used for all external data validation — keep up to date.

---

## 9. Environment Variable Exposure

- `BACKEND_URL` is server-side only and is **not** prefixed with `NEXT_PUBLIC_`. ✓
- `NEXT_PUBLIC_SHOW_LOGGER` and `NEXT_PUBLIC_APP_VERSION` are the only client-exposed env vars. ✓
- No secrets (API keys, JWT secrets, DB credentials) are exposed to the browser bundle. ✓
- **Risk:** If `DATA_MODE` is not set and `BACKEND_URL` is missing, the app silently falls back to mock data. This is acceptable for development but should trigger a warning or startup failure in production mode.

---

## 10. Outstanding Risks (Unresolved)

| ID     | Severity | Issue                                                                    | Recommendation                               |
| ------ | -------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| SEC-01 | High     | In-memory rate limiter bypassed in multi-instance deployments            | Use Redis-backed rate limiter                |
| SEC-02 | High     | No Content-Security-Policy header                                        | Implement CSP (see §6)                       |
| SEC-03 | Medium   | Watch page `watchUrl` not validated against domain allowlist             | Add domain allowlist check                   |
| SEC-04 | Medium   | `hybrid` DATA_MODE silently serves stale mock data when backend is down  | Add observability alert when fallback occurs |
| SEC-05 | Low      | No `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy` headers | Add to middleware.ts                         |
| SEC-06 | Low      | `/api/analytics` has no per-IP rate limit                                | Add rate limiting to analytics POST          |

---

## 11. Reporting Vulnerabilities

Security issues should be reported privately. Do not open a public GitHub Issue for security vulnerabilities. Contact the repository owner directly or use GitHub's private vulnerability reporting feature.
