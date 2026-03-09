# Otaku Channels

Otaku Channels is a browser-based anime TV guide and launcher that aggregates legally free anime from official sources like YouTube, Pluto TV, Tubi, and RetroCrush into a single couch-friendly interface.

## Core concept

The app is an **Anime Loader / Anime TV experience** that:

- Finds officially free anime episodes, clips, live channels, and movies.
- Pulls metadata (thumbnails, episode numbers, genres, dub/sub flags, runtime).
- Displays everything in a TV-style interface with familiar content rows.
- Opens content in official embeds or deep-links out to the source platform.

## Product framing options

- AniTV Free
- Otaku Channels
- Anime Surf
- NeoToon TV

## Source layer

- YouTube official anime publishers
- Pluto TV anime/live channels
- Tubi anime catalog
- RetroCrush free catalog
- Optional user-added official RSS/publisher feeds

## Normalization layer

Every item is normalized to a common structure:

- title
- series
- episode
- movie vs series
- dub/sub
- runtime
- source
- region restrictions
- embed allowed vs external-only

## UI layout

TV-first rows such as:

- Now Airing
- Free on YouTube
- Classic Anime
- Movies
- Dubbed
- 24/7 Channels

## Playback rules

- Embed YouTube when allowed.
- Deep-link to Tubi/Pluto/RetroCrush when embedding is restricted.
- Never proxy or restream video.

## Suggested stack

- Frontend: Next.js + TypeScript + Tailwind
- Backend: Next.js API routes or Node/Express
- DB: Supabase or Postgres
- Search: Meilisearch or Postgres full-text
- Jobs: cron refresh workers
- Video: official embeds only

## MVP features

- Home screen with anime rows
- Universal search
- Filters for sub/dub/movie/series/source
- “Watch now” buttons
- Favorites/watchlist
- Live anime channels section
- Autoplay next suggestion
- 10-foot remote-friendly UI

## Nice extras

- Faux channel guide
- Anime stations by vibe (shonen, retro, mecha, chill, fantasy)
- Sleep timer
- Controller support
- Kiosk/couch mode
- PWA install support

## Legal guardrails

- Ingest only from sources with permission or public APIs/feeds.
- Respect robots.txt and platform Terms of Service.
- Do not rip HLS streams.
- Do not remove ads.
- Do not rebroadcast paid or geo-locked content.
- Always show source attribution and open official platforms when needed.

## Twist: free anime cable-box feel

- Channel 101: Shonen
- Channel 102: Retro
- Channel 103: Mecha
- Channel 104: Anime Movies
- Channel 105: YouTube Premieres
