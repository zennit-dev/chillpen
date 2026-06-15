import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stateless HMAC signing for the cached `user` cookie. `sign` produces a
 * `payload.signature` token; `verify` returns the original payload only when the
 * signature matches (constant-time), else `null`.
 */

const digest = (payload: string, secret: string): string =>
  createHmac("sha256", secret).update(payload).digest("base64url");

export const sign = (payload: string, secret: string): string => {
  const signature = digest(payload, secret);
  const encoded = Buffer.from(payload, "utf8").toString("base64url");
  return `${encoded}.${signature}`;
};

export const verify = (token: string, secret: string): string | null => {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const payload = Buffer.from(encoded, "base64url").toString("utf8");
  const expected = digest(payload, secret);

  const provided = Buffer.from(signature);
  const reference = Buffer.from(expected);
  if (provided.length !== reference.length) return null;
  if (!timingSafeEqual(provided, reference)) return null;

  return payload;
};
