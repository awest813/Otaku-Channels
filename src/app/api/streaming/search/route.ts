import { NextResponse } from 'next/server';

/**
 * GET /api/streaming/search
 *
 * ⚠️  REMOVED — Legal compliance block.
 *
 * This endpoint previously proxied to Consumet providers (gogoanime, zoro,
 * animepahe) which are unauthorized scrapers distributing pirated content.
 * Proxying their streams violates the Otaku Channels source policy:
 *   - No ingest from unapproved / unlicensed sources
 *   - No HLS extraction or proxying
 *   - No rebroadcasting of content without rights-holder authorization
 *
 * See SOURCE_POLICY.md §3.1 for the full prohibited-sources list.
 *
 * HTTP 451 — Unavailable For Legal Reasons (RFC 7725)
 */
export async function GET(_request: Request) {
  return NextResponse.json(
    {
      error:
        'This streaming search endpoint has been disabled for legal compliance reasons. ' +
        'Otaku Channels only serves content from officially licensed sources. ' +
        'See SOURCE_POLICY.md for details.',
      code: 'LEGAL_COMPLIANCE_BLOCK',
    },
    { status: 451 }
  );
}
