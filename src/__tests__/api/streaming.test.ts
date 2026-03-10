/**
 * Tests for the Consumet streaming route legal compliance blocks.
 *
 * All three streaming routes (search, sources, info) must return
 * HTTP 451 (Unavailable For Legal Reasons) with a LEGAL_COMPLIANCE_BLOCK
 * code. They must never proxy to Consumet providers.
 *
 * @jest-environment node
 */

import { GET as streamingInfo } from '@/app/api/streaming/info/route';
import { GET as streamingSearch } from '@/app/api/streaming/search/route';
import { GET as streamingSources } from '@/app/api/streaming/sources/route';

function req(url: string): Request {
  return new Request(`http://localhost${url}`);
}

async function jsonBody(res: Response) {
  return res.json() as Promise<Record<string, unknown>>;
}

// ─── /api/streaming/search ────────────────────────────────────────────────────

describe('GET /api/streaming/search — legal block', () => {
  it('returns HTTP 451', async () => {
    const res = await streamingSearch(req('/api/streaming/search?q=naruto'));
    expect(res.status).toBe(451);
  });

  it('returns LEGAL_COMPLIANCE_BLOCK code', async () => {
    const res = await streamingSearch(req('/api/streaming/search?q=naruto'));
    const body = await jsonBody(res);
    expect(body.code).toBe('LEGAL_COMPLIANCE_BLOCK');
  });

  it('returns an error message', async () => {
    const res = await streamingSearch(req('/api/streaming/search'));
    const body = await jsonBody(res);
    expect(typeof body.error).toBe('string');
    expect((body.error as string).length).toBeGreaterThan(0);
  });

  it('returns 451 even with no query params', async () => {
    const res = await streamingSearch(req('/api/streaming/search'));
    expect(res.status).toBe(451);
  });
});

// ─── /api/streaming/sources ──────────────────────────────────────────────────

describe('GET /api/streaming/sources — legal block', () => {
  it('returns HTTP 451', async () => {
    const res = await streamingSources(
      req('/api/streaming/sources?episodeId=abc')
    );
    expect(res.status).toBe(451);
  });

  it('returns LEGAL_COMPLIANCE_BLOCK code', async () => {
    const res = await streamingSources(
      req('/api/streaming/sources?episodeId=abc')
    );
    const body = await jsonBody(res);
    expect(body.code).toBe('LEGAL_COMPLIANCE_BLOCK');
  });

  it('returns an error message', async () => {
    const res = await streamingSources(req('/api/streaming/sources'));
    const body = await jsonBody(res);
    expect(typeof body.error).toBe('string');
  });
});

// ─── /api/streaming/info ─────────────────────────────────────────────────────

describe('GET /api/streaming/info — legal block', () => {
  it('returns HTTP 451', async () => {
    const res = await streamingInfo(req('/api/streaming/info?id=naruto'));
    expect(res.status).toBe(451);
  });

  it('returns LEGAL_COMPLIANCE_BLOCK code', async () => {
    const res = await streamingInfo(req('/api/streaming/info?id=naruto'));
    const body = await jsonBody(res);
    expect(body.code).toBe('LEGAL_COMPLIANCE_BLOCK');
  });

  it('includes alternatives array pointing to official metadata APIs', async () => {
    const res = await streamingInfo(req('/api/streaming/info?id=naruto'));
    const body = await jsonBody(res);
    expect(Array.isArray(body.alternatives)).toBe(true);
    expect((body.alternatives as string[]).length).toBeGreaterThan(0);
  });

  it('returns an error message', async () => {
    const res = await streamingInfo(req('/api/streaming/info'));
    const body = await jsonBody(res);
    expect(typeof body.error).toBe('string');
  });
});
