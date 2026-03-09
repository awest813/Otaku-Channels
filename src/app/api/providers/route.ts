import { NextResponse } from 'next/server';

import { sourceProviders } from '@/data/mockData';

/**
 * GET /api/providers
 *
 * Returns all registered source providers (YouTube, Tubi, Pluto TV, etc.).
 */
export async function GET() {
  return NextResponse.json({
    data: sourceProviders,
    total: sourceProviders.length,
  });
}
