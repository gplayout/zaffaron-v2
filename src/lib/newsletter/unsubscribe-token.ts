/**
 * unsubscribe-token.ts — HMAC-signed unsubscribe tokens for newsletter emails.
 *
 * Format: <email_b64url>.<expMs>.<sig_b64url>
 *
 * - email is base64url-encoded so it survives URL transit (no need to escape)
 * - expMs is the absolute expiration timestamp in milliseconds since epoch
 * - sig is HMAC-SHA256(email|expMs) with NEWSLETTER_UNSUBSCRIBE_SECRET
 *
 * Verification rejects: malformed, expired, signature mismatch, missing secret.
 *
 * Threat addressed: pre-fix anyone who knew (or guessed) a subscriber email
 * could trigger an unsubscribe DELETE via /newsletter/unsubscribe?email=victim.
 * Post-fix: only the URL embedded in the welcome email itself unsubscribes,
 * because the URL carries an HMAC the recipient cannot forge.
 *
 * TTL: 1 year. Welcome emails sit in inboxes for a long time; expiration
 * exists primarily as a defense-in-depth (limits replay if HMAC secret leaks
 * + later rotates).
 */

import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 365 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "unsubscribe-token: NEWSLETTER_UNSUBSCRIBE_SECRET is not set or is < 32 chars"
    );
  }
  return secret;
}

function sign(email: string, expMs: number, secret: string): string {
  return createHmac("sha256", secret)
    .update(`${email}|${expMs}`)
    .digest("base64url");
}

export function generateUnsubscribeToken(email: string): string {
  const secret = getSecret();
  const expMs = Date.now() + TOKEN_TTL_MS;
  const sig = sign(email, expMs, secret);
  const emailB64 = Buffer.from(email, "utf8").toString("base64url");
  return `${emailB64}.${expMs}.${sig}`;
}

export type UnsubVerifyResult =
  | { ok: true; email: string }
  | {
      ok: false;
      reason: "malformed" | "expired" | "invalid_signature" | "no_secret";
    };

export function verifyUnsubscribeToken(token: string): UnsubVerifyResult {
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { ok: false, reason: "no_secret" };
  }

  if (typeof token !== "string" || token.length === 0) {
    return { ok: false, reason: "malformed" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { ok: false, reason: "malformed" };
  }

  const [emailB64, expStr, sigB64] = parts;
  if (!emailB64 || !expStr || !sigB64) {
    return { ok: false, reason: "malformed" };
  }

  let email: string;
  try {
    email = Buffer.from(emailB64, "base64url").toString("utf8");
    // Sanity check: decoded email must be plausibly an email
    if (!email || email.length > 320 || !email.includes("@")) {
      return { ok: false, reason: "malformed" };
    }
  } catch {
    return { ok: false, reason: "malformed" };
  }

  const expMs = Number(expStr);
  if (!Number.isFinite(expMs) || expMs <= 0) {
    return { ok: false, reason: "malformed" };
  }
  if (Date.now() > expMs) {
    return { ok: false, reason: "expired" };
  }

  const expectedSig = sign(email, expMs, secret);
  let a: Buffer, b: Buffer;
  try {
    a = Buffer.from(sigB64, "base64url");
    b = Buffer.from(expectedSig, "base64url");
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, reason: "invalid_signature" };
  }

  return { ok: true, email };
}
