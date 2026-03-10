import { NextRequest } from 'next/server';

import { proxyAdmin } from '@/lib/admin-proxy';

export async function POST(request: NextRequest) {
  return proxyAdmin(request, '/anime/merge', 'POST');
}
