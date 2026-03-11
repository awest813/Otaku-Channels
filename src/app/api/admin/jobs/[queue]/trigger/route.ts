import { NextRequest } from 'next/server';

import { proxyAdmin } from '@/lib/admin-proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ queue: string }> }
) {
  const { queue } = await params;
  return proxyAdmin(request, `/jobs/${queue}/trigger`, 'POST');
}
