import { NextRequest } from 'next/server';

import { proxyAdmin } from '@/lib/admin-proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: { queue: string } }
) {
  return proxyAdmin(request, `/jobs/${params.queue}/trigger`, 'POST');
}
