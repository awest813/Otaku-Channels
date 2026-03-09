import { NextResponse } from 'next/server';

import { BackendError, listAllowedDomains } from '@/lib/backend';

/**
 * GET /api/providers
 *
 * Returns all approved streaming domains / source providers.
 */
export async function GET() {
  try {
    const result = await listAllowedDomains();
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 502 }
    );
  }
}
