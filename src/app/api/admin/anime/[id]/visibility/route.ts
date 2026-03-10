import { NextRequest } from 'next/server';

import { proxyAdmin } from '@/lib/admin-proxy';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyAdmin(request, `/anime/${params.id}/visibility`, 'PATCH');
}
