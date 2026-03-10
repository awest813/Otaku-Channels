import { NextResponse } from 'next/server';

/**
 * GET /api/streaming/sources
 *
 * ⚠️  REMOVED — Legal compliance block.
 *
 * This endpoint previously proxied to Consumet providers (gogoanime, zoro,
 * animepahe) to extract HLS streaming sources from pirated content.
 * This violates the Otaku Channels source policy:
 *   - No HLS extraction or proxying
 *   - No ingest from unauthorized scrapers
 *   - No rebroadcasting of content without rights-holder authorization
 *
 * See SOURCE_POLICY.md §3.1 and §3.2 for the full policy.
 *
 * HTTP 451 — Unavailable For Legal Reasons (RFC 7725)
 */
export async function GET(_request: Request) {
  return NextResponse.json(
    {
      error:
        'This streaming sources endpoint has been disabled for legal compliance reasons. ' +
        'Otaku Channels only serves content from officially licensed sources. ' +
        'See SOURCE_POLICY.md for details.',
      code: 'LEGAL_COMPLIANCE_BLOCK',
    },
    { status: 451 }
  );
}
