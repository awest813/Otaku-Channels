/**
 * POST /api/analytics — contract tests
 *
 * These tests verify request validation and response shapes without a live
 * backend. The global fetch is mocked so no real network calls are made.
 *
 * @jest-environment node
 */

import { POST } from '@/app/api/analytics/route';

// Mock fetch globally so no real backend calls are made
const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('POST /api/analytics — contract', () => {
  it('returns 400 for invalid JSON body', async () => {
    const req = new Request('http://localhost/api/analytics', {
      method: 'POST',
      body: 'not-json',
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(typeof body.error).toBe('string');
  });

  it('returns 400 for missing required fields', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(typeof body.error).toBe('string');
  });

  it('returns 400 for unknown event type', async () => {
    const res = await POST(
      makeRequest({ event: 'unknown_event', animeId: 'anime-1' })
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing animeId', async () => {
    const res = await POST(makeRequest({ event: 'viewed_title' }));
    expect(res.status).toBe(400);
  });

  it('returns ok:true when backend is available', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    const res = await POST(
      makeRequest({ event: 'viewed_title', animeId: 'anime-1' })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.forwarded).toBe(true);
    expect(body.event).toBe('viewed_title');
  });

  it('returns ok:true, forwarded:false when backend is unavailable', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'));
    const res = await POST(
      makeRequest({ event: 'started_watch', animeId: 'anime-1' })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.forwarded).toBe(false);
  });

  it('returns ok:false when backend returns non-ok status', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    );
    const res = await POST(
      makeRequest({ event: 'added_watchlist', animeId: 'anime-1' })
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.forwarded).toBe(false);
  });

  it('accepts all valid event types', async () => {
    const events = [
      'viewed_title',
      'started_watch',
      'completed_episode',
      'added_watchlist',
      'clicked_external',
    ] as const;

    for (const event of events) {
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), { status: 200 })
      );
      const res = await POST(makeRequest({ event, animeId: 'anime-1' }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.event).toBe(event);
    }
  });

  it('completed_episode sets completed=true automatically', async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    await POST(makeRequest({ event: 'completed_episode', animeId: 'anime-1' }));
    // Verify fetch was called with completed=true in the body
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(callBody.completed).toBe(true);
  });
});
