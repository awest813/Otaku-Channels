import { NextResponse } from 'next/server';

/**
 * GET /api/streaming/info
 *
 * ⚠️  REMOVED — Legal compliance block.
 *
 * This endpoint previously proxied to Consumet providers (gogoanime, zoro,
 * animepahe) to fetch anime info from unauthorized scraper sites.
 * This violates the Otaku Channels source policy:
 *   - No ingest from unapproved / unlicensed sources
 *   - No proxying of content from piracy aggregators
 *   - No rebroadcasting of content without rights-holder authorization
 *
 * Use the official metadata APIs instead:
 *   GET /api/jikan/anime/:id    — MyAnimeList metadata (Jikan v4)
 *   GET /api/kitsu/anime/:id    — Kitsu metadata
 *   GET /api/shikimori/anime/:id — Shikimori metadata
 *
 * See SOURCE_POLICY.md §3.1 for the full prohibited-sources list.
 *
 * HTTP 451 — Unavailable For Legal Reasons (RFC 7725)
 */
export async function GET(_request: Request) {
  return NextResponse.json(
    {
      error:
        'This streaming info endpoint has been disabled for legal compliance reasons. ' +
        'Use /api/jikan/anime/:id, /api/kitsu/anime/:id, or /api/shikimori/anime/:id ' +
        'for anime metadata. See SOURCE_POLICY.md for details.',
      code: 'LEGAL_COMPLIANCE_BLOCK',
      alternatives: [
        '/api/jikan/anime/:id',
        '/api/kitsu/anime/:id',
        '/api/shikimori/anime/:id',
      ],
    },
    { status: 451 }
  );
}
