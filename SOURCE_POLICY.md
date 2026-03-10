# Source Policy — Otaku Channels

**Status:** Active  
**Effective:** 2026-03-10  
**Audience:** Developers, contributors, reviewers

---

## 1. Mission Statement

Otaku Channels aggregates **legally free anime** from **officially licensed** sources only. Every piece of content served must be watchable by end-users without infringing any copyright, violating any platform Terms of Service, or circumventing any geo-restriction or pay-wall.

---

## 2. Approved Source Tiers

### Tier 1 — Official Free Streaming (Permitted)

Sources with a published free tier and a public, documented API or embed mechanism.

| Provider    | Source Type   | API/Embed Method                       | Notes                                            |
| ----------- | ------------- | -------------------------------------- | ------------------------------------------------ |
| YouTube     | `youtube`     | YouTube IFrame API                     | Official embeds only; no private/unlisted videos |
| Tubi        | `tubi`        | Deep-link to tubi.tv                   | No HLS extraction; user lands on official player |
| Pluto TV    | `pluto`       | Deep-link to pluto.tv                  | No HLS extraction; user lands on official player |
| RetroCrush  | `retrocrush`  | Deep-link to retrocrush.tv             | No HLS extraction                                |
| Crunchyroll | `crunchyroll` | Deep-link only (free tier titles only) | Embedded player not permitted by CR ToS          |

### Tier 2 — Metadata Providers (Permitted, No Streaming)

Sources used **only** for anime metadata (titles, descriptions, genres, episode lists, cover art). No streaming, embed, or HLS extraction permitted.

| Provider            | Source Type | API                                         | Notes                                |
| ------------------- | ----------- | ------------------------------------------- | ------------------------------------ |
| Jikan (MyAnimeList) | `jikan`     | REST v4 — https://api.jikan.moe/v4          | Rate limit: ~3 req/s; no auth needed |
| Kitsu               | `kitsu`     | JSON:API — https://kitsu.io/api/edge        | No auth needed                       |
| Shikimori           | `shikimori` | GraphQL — https://shikimori.one/api/graphql | No auth needed                       |

### Tier 3 — Supplemental Media APIs (Permitted, Non-Content)

Sources used for non-content supplemental data.

| Provider   | Purpose                | URL                    | Notes             |
| ---------- | ---------------------- | ---------------------- | ----------------- |
| Waifu.pics | SFW decorative images  | https://api.waifu.pics | SFW endpoint only |
| AnimeChan  | Anime character quotes | https://animechan.io   | Public API        |

---

## 3. Prohibited Sources

The following are **explicitly prohibited** regardless of technical feasibility:

### 3.1 Scraper-Based Streaming Aggregators

These services obtain streams by scraping third-party sites without authorization:

| Provider                               | Reason Prohibited                                     |
| -------------------------------------- | ----------------------------------------------------- |
| **gogoanime**                          | Unauthorized scraper; pirates licensed content        |
| **zoro.to / aniwatch.to**              | Unauthorized scraper; pirates licensed content        |
| **animepahe**                          | Unauthorized scraper; pirates licensed content        |
| **Any Consumet provider**              | Consumet is a scraping library targeting piracy sites |
| **9anime, kissanime, and derivatives** | Unauthorized scrapers                                 |

### 3.2 HLS/M3U8 Extraction

- **No proxying of HLS streams** from any provider, including licensed ones.
- **No serving of .m3u8 manifests or .ts segments** on behalf of any provider.
- Video segments must always be loaded directly from the provider's CDN, not through Otaku Channels infrastructure.

### 3.3 Geo-Locked or Paid Content

- Content behind a regional license wall must not be served to out-of-region users.
- Subscription-only content must not be served to unauthenticated or non-subscriber users.

### 3.4 Unofficial/Expired Licenses

- Do not ingest content whose licensing status is `requires-subscription`, `geo-blocked`, or `unavailable` unless the user is actively redirected to the official platform.

---

## 4. robots.txt Compliance

All external API clients must:

1. Respect `robots.txt` for any API that uses standard web crawling.
2. Respect published rate limits (see metadata provider limits in Tier 2 above).
3. Set a descriptive `User-Agent` header on requests so providers can identify the client.

---

## 5. Attribution Requirements

Every piece of content served **must** carry:

- `sourceName` — human-readable name of the provider.
- `sourceType` — machine-readable provider category.
- `watchUrl` — canonical URL on the provider's official platform.
- `isOfficial` — `true` only for Tier 1 licensed streaming services.

When a user watches content, the player must:

- Display the source attribution badge (SourceBadge component).
- For `external` embed types: open the official URL in a new tab rather than proxying.

---

## 6. Source Ingestion Allowlist

Only the following `SourceType` values are active for streaming purposes. All other types are metadata-only:

```
youtube    — active streaming embed
tubi       — external link (official)
pluto      — external link (official)
retrocrush — external link (official)
crunchyroll — external link (official, free tier only)
```

Metadata-only (no streaming):

```
jikan      — metadata only
kitsu      — metadata only
shikimori  — metadata only
```

Deprecated (must not produce new streaming links):

```
consumet   — DEPRECATED; blocked at API layer
freestream — legacy; requires case-by-case review before use
retro      — legacy; requires case-by-case review before use
live       — generic; only permitted for officially licensed live channels
```

---

## 7. Adding New Sources

To add a new streaming source:

1. Confirm the source offers a documented public API or embed SDK.
2. Confirm the content is freely licensed (not geo-locked or paywalled).
3. Add the new `SourceType` to `src/types/canonical.ts`.
4. Add entries to `SourceBadge.tsx` (styles, icons, names records).
5. Update the allowlist in this document.
6. Add the provider to `src/data/mockData.ts` `sourceProviders` array with `isOfficial: true`.
7. Open a PR referencing this policy document.

---

## 8. Violation Escalation

Any contributor who discovers a policy violation (an active route or provider that proxies unauthorized content) should:

1. Open a GitHub Issue with the label `security`.
2. Optionally use the `/api/admin/sources/broken` endpoint to flag it.
3. The route must be disabled within 24 hours of confirmation.
