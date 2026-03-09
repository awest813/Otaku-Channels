import argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { db } from '../db';
import { BadRequestError } from '../errors';

// ─── Password hashing ─────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65_536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

// ─── Refresh token helpers ────────────────────────────────────────────────────

export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url');
}

import { createHash } from 'crypto';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// ─── URL / domain validation ──────────────────────────────────────────────────

export function extractDomain(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function sanitizeUrl(rawUrl: string): string {
  const url = new URL(rawUrl); // throws if invalid
  // Only allow http/https
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new BadRequestError('URL must use http or https');
  }
  return url.toString();
}

export async function assertDomainAllowed(rawUrl: string): Promise<void> {
  const domain = extractDomain(rawUrl);
  if (!domain) throw new BadRequestError('Invalid URL');

  const allowed = await db.allowedDomain.findUnique({ where: { domain } });
  if (!allowed) {
    throw new BadRequestError(
      `Domain "${domain}" is not on the approved source allowlist. An admin must approve it first.`,
    );
  }
}
