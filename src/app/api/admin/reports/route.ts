import { NextRequest } from 'next/server';
import { proxyAdmin } from '@/lib/admin-proxy';

export async function GET(request: NextRequest) {
  return proxyAdmin(request, '/reports');
}

export async function POST(request: NextRequest) {
  return proxyAdmin(request, '/reports', 'POST');
}
