import { NextResponse } from 'next/server';
import { getAnime, BackendError } from '@/lib/backend';

interface Params {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/series/:slug
 */
export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;

  try {
    const result = await getAnime(slug);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: `Failed to fetch series "${slug}"` }, { status: 502 });
  }
}
