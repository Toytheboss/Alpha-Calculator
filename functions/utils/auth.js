const COOKIE_NAME = "alpha_session";

export function getSessionCookie(request) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

async function hmac(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function createSessionToken(secret) {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = `exp=${exp}`;
  const sig = await hmac(secret, payload);
  return `${btoa(payload).replace(/=+$/, "")}.${sig}`;
}

export async function verifySessionToken(token, secret) {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  try {
    const payload = atob(parts[0]);
    const sig = parts[1];
    const expected = await hmac(secret, payload);
    if (sig !== expected) return false;
    const exp = Number((payload.match(/exp=(\d+)/) || [])[1]);
    return exp > Date.now();
  } catch {
    return false;
  }
}

export function sessionCookieHeader(token) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`;
}

export function clearSessionCookieHeader() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}
