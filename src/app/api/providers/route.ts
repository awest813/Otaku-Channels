import { NextResponse } from 'next/server';

import { BackendError, listAllowedDomains } from '@/lib/backend';
import { getDataMode } from '@/lib/data-mode';

import { sourceProviders } from '@/data/mockData';

/**
 * GET /api/providers
 *
 * Returns all approved streaming domains / source providers.
 *
 * Respects DATA_MODE env var: mock | backend | hybrid (default)
 */
export async function GET() {
  const mode = getDataMode();

  if (mode === 'mock') {
    return NextResponse.json({
      data: sourceProviders,
      total: sourceProviders.length,
    });
  }

  try {
    const result = await listAllowedDomains();
    return NextResponse.json(result);
  } catch (err) {
    if (mode === 'backend') {
      if (err instanceof BackendError) {
        return NextResponse.json(
          { error: err.message },
          { status: err.status }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch providers' },
        { status: 502 }
      );
    }
    // hybrid — fall back to mock
    return NextResponse.json({
      data: sourceProviders,
      total: sourceProviders.length,
    });
  }
}
