import { getSessionCookie, verifySessionToken } from "./utils/auth.js";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname === "/api/login" || url.pathname === "/api/public-data") {
    return context.next();
  }
  if (url.pathname.startsWith("/api/share/") && context.request.method === "GET") {
    return context.next();
  }
  if (!url.pathname.startsWith("/api/")) {
    return context.next();
  }

  const token = getSessionCookie(context.request);
  const ok = await verifySessionToken(token, context.env.SESSION_SECRET);
  if (!ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return context.next();
}
